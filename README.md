# 🎬 Guion Cinematográfico AI

El primer editor de guiones diseñado para cineastas modernos. Integra el formato estándar **Fountain** y modelos de lenguaje de vanguardia a través de **OpenRouter** para llevar tus historias al siguiente nivel.

## ✨ Características

- **Editor Fountain Integrado**: Escribe con el formato estándar de la industria de forma fluida.
- **IA Contextual**: Múltiples modos de IA (Generar, Refinar, Continuar) basados en los parámetros técnicos específicos de la escena.
- **Sistema de Plugins (Modificadores)**: Inyecta directivas de dirección directamente en la IA como:
  - 🎥 Planos (CU, MCU, Wide Shot, Dolly)
  - 💡 Iluminación (High-Key, Low-Key)
  - 📸 Tipos de Lentes y Cámaras
  - ✨ Efectos visuales y acústicos (VFX/SFX)
  - 📖 Profundidad Narrativa
- **Exportación Profesional**: Exporta tus guiones a un PDF estandarizado (Courier Prime 12pt, márgenes exactos de industria) o en el formato más usado de Hollywood: Final Draft (`.fdx`).
- **Dashboard SaaS**: Gestiona todos tus proyectos y scripts recientes de manera unificada.

---

## 🛠 Stack Tecnológico

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Editor**: [TipTap](https://tiptap.dev/) / ProseMirror
- **UI & Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) y [shadcn/ui](https://ui.shadcn.com/) (Sistema de diseño basado en colores zinc/ámbar y espacios OKLCH).
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/) con [Prisma ORM](https://www.prisma.io/)
- **Autenticación**: [NextAuth.js v5](https://next-auth.js.org/)
- **IA**: [Vercel AI SDK](https://sdk.vercel.ai/) y [OpenRouter](https://openrouter.ai/)
- **Estado Global**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Sistema Local**: Exportaciones vía `jspdf` y `xmlbuilder2`.

---

## 🚀 Instalación y Uso

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd guion-cinematografico
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Copia el archivo `.env.example` y renómbralo a `.env`. (En local se usarán las variables ya adjuntas si has seguido el tutorial):
```bash
cp .env.example .env
```
_Asegúrate de que tus credenciales de PostgreSQL y la API de OpenRouter se encuentren bien definidas en el `.env`._

### 4. Inicializar y aplicar esquemas de la Base de Datos
Actualiza la meta información de prisma y syncronea la bd:
```bash
npx prisma generate
npx prisma db push
```
*(Alternativamente puedes correr `npx prisma migrate dev` para crear una migración formal)*

### 5. Iniciar el entorno de Desarrollo
Lanza la aplicación en modo desarrollo:
```bash
npm run dev
```
📍 Escuchando en [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura Principal del Proyecto

```text
src/
├── app/                  # Rutas de app router de Next.js
│   ├── (dashboard)/      # Listado de proyectos y dashboard
│   ├── api/              # API Endpoints (Tratamiento de docs, Exportación y Server-Sent Events para IA)
│   └── editor/           # Canvas de edición y Toolbar de sistema de plugins
├── components/           # Componentes Modulares de React y componentes extendidos (ui/)
├── editor-engine/        # Extensiones de TipTap, utilidades, stores de Zustand y parseo
├── lib/                  # Orquestador del LLM, generador PDF/FDX y conector a la db.
└── types/                # Esquemas estáticos y metadata Typescript.
```

---

## 📝 Roadmap Completado para el MVP

- [x] **Fase 1:** Arquitectura Base y UI Foundation
- [x] **Fase 2:** Motor Core del Editor (TipTap + Fountain Parser)
- [x] **Fase 3:** Integración de Inteligencia Artificial (OpenRouter + Pipeline SSE)
- [x] **Fase 4:** Sistema de Plugins (Modificadores de Cámara, VFX, Iluminación, Narrativa)
- [x] **Fase 5:** Exportación PDF/FDX y Dashboard de Usuarios

---

© 2026 Guion Cinematográfico AI. Diseñado para cineastas y creadores de contenido visionarios.
