# 08 — Dashboard SaaS (Next.js)

> **Documento:** Especificación del Dashboard  
> **Última actualización:** 2026-04-08

---

## 8.1 Resumen

La aplicación **web** es un dashboard SaaS construido con Next.js 15 (App Router) como monolito unificado. Gestiona autenticación, proyectos/guiones, configuración de usuario, billing y sirve los API routes para la IA y exportación.

---

## 8.2 Rutas y Páginas

### Rutas Públicas

| Ruta | Página | Descripción |
|:-----|:-------|:------------|
| `/` | Landing | Landing page con propuesta de valor, features, pricing |
| `/login` | Login | Inicio de sesión (OAuth + email) |
| `/signup` | Registro | Creación de cuenta |
| `/pricing` | Pricing | Planes y precios |

### Rutas Protegidas (Dashboard)

| Ruta | Página | Descripción |
|:-----|:-------|:------------|
| `/dashboard` | Home | Overview: proyectos recientes, stats de uso, accesos directos |
| `/dashboard/projects` | Proyectos | Lista de todos los guiones/proyectos |
| `/dashboard/projects/new` | Nuevo proyecto | Wizard de creación (título, género, template) |
| `/dashboard/projects/[id]` | Detalle proyecto | Metadata, versiones, exportaciones, abrir editor |
| `/dashboard/projects/[id]/settings` | Config proyecto | Configuración específica del proyecto |
| `/dashboard/settings` | Settings general | Perfil, preferencias, API keys propias |
| `/dashboard/settings/billing` | Billing | Plan actual, uso, upgrade/downgrade, invoices |
| `/dashboard/ai-history` | Historial IA | Log de todas las generaciones de IA |
| `/dashboard/templates` | Templates | Plantillas de guión disponibles |

### API Routes

| Ruta | Método | Descripción |
|:-----|:-------|:------------|
| `/api/ai/generate` | POST | Generación de texto con IA (SSE stream) |
| `/api/ai/refine` | POST | Refinamiento de texto (SSE stream) |
| `/api/projects` | GET, POST | Listar / crear proyectos |
| `/api/projects/[id]` | GET, PATCH, DELETE | CRUD de proyecto específico |
| `/api/projects/[id]/content` | GET, PUT | Contenido del guión (JSON del AST) |
| `/api/projects/[id]/export` | POST | Exportar a PDF o FDX |
| `/api/projects/[id]/versions` | GET, POST | Historial de versiones |
| `/api/auth/[...nextauth]` | * | NextAuth.js endpoints |
| `/api/webhooks/stripe` | POST | Webhooks de Stripe |

---

## 8.3 Autenticación

### Proveedores

| Proveedor | Prioridad | Config |
|:----------|:----------|:-------|
| Google OAuth | Alta | Client ID + Secret |
| GitHub OAuth | Media | Client ID + Secret |
| Email/Password | Alta | Credentials provider con bcrypt |
| Magic Link | Baja (futuro) | Email-based passwordless |

### Flujo de Auth

```
User ──► /login ──► NextAuth.js ──► Provider (Google/GitHub/Credentials)
                                          │
                                    JWT + Session
                                          │
                                    ┌─────┴──────┐
                                    │ Middleware  │
                                    │ (protect   │
                                    │  /dashboard)│
                                    └─────┬──────┘
                                          │
                                    Dashboard ──► Editor (auth token via URL/cookie)
```

### Middleware de Protección

- Todas las rutas `/dashboard/*` requieren sesión activa
- Las rutas `/api/*` (excepto auth y webhooks) requieren JWT válido
- El editor recibe un token de sesión para llamar a las API routes

---

## 8.4 Gestión de Proyectos

### Modelo de Proyecto

```typescript
interface Project {
  id: string;               // UUID
  userId: string;            // Owner
  title: string;             // Título del guión
  logline: string;           // Resumen de una línea
  genre: Genre;              // Enum: thriller, drama, comedy, etc.
  format: ScreenplayFormat;  // feature, short, series, documentary
  language: string;          // 'es', 'en', etc.
  
  content: FountainJSON;     // Contenido del guión (AST serializado)
  
  status: 'draft' | 'in-progress' | 'review' | 'final';
  
  createdAt: DateTime;
  updatedAt: DateTime;
  
  settings: ProjectSettings;
  stats: ProjectStats;
}

interface ProjectStats {
  pageCount: number;
  wordCount: number;
  characterCount: number;   // Personajes únicos
  sceneCount: number;
  estimatedDuration: string; // "1h 45m"
  aiGenerationsUsed: number;
}
```

### Página de Lista de Proyectos

| Vista | Descripción |
|:------|:------------|
| **Grid** | Cards con thumbnail, título, género, última edición, progreso |
| **List** | Tabla con columnas: título, género, páginas, estado, fecha |
| **Filtros** | Por género, estado, fecha de creación |
| **Búsqueda** | Full-text search en título y logline |
| **Orden** | Por fecha (reciente), nombre, páginas |
| **Acciones** | Abrir editor, duplicar, exportar, eliminar |

---

## 8.5 Sistema de Billing

### Planes

| Feature | Free | Pro ($15/mes) | Enterprise ($49/mes) |
|:--------|:-----|:--------------|:---------------------|
| Proyectos | 3 | Ilimitados | Ilimitados |
| Generaciones IA/día | 20 | 200 | Ilimitadas |
| Modelos IA | GPT-4o-mini | GPT-4o, Claude | Todos + priority |
| Exportación PDF | Marca de agua | Sin marca | Sin marca |
| Exportación FDX | ❌ | ✅ | ✅ |
| Colaboración | ❌ | 3 personas | Ilimitado |
| Historial versiones | 5 versiones | 50 versiones | Ilimitado |
| Soporte | Community | Email | Priority + chat |

### Integración Stripe

- **Checkout**: Stripe Checkout Sessions para upgrade
- **Portal**: Stripe Customer Portal para gestión
- **Webhooks**: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- **Sincronización**: Webhook → actualizar plan en DB → invalidar cache

---

## 8.6 Dashboard Home

| Sección | Contenido |
|:--------|:----------|
| **Proyectos recientes** | 4 últimos proyectos con acceso rápido |
| **Estadísticas** | Generaciones IA usadas hoy, páginas totales escritas |
| **Acciones rápidas** | Nuevo proyecto, abrir último, importar Fountain |
| **Tips** | Tip aleatorio sobre escritura de guiones |
| **Plan** | Indicador del plan actual + uso |
