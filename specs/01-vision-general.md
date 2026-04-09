# 01 — Visión General del Producto

> **Documento:** Especificación de Producto  
> **Última actualización:** 2026-04-08

---

## 1.1 Nombre del Producto

**Guion Cinematográfico AI** (nombre de trabajo — sujeto a branding definitivo)

---

## 1.2 Declaración de Visión

Crear la plataforma de escritura de guiones cinematográficos más avanzada del mercado, que combine un editor profesional con formato **Fountain** estándar de la industria, un sistema de **plugins modulares** para dirección cinematográfica (planos, luces, cámaras, VFX/SFX), y un motor de **inteligencia artificial generativa** que transforme instrucciones técnicas en prosa cinematográfica de alta calidad.

---

## 1.3 Propuesta de Valor

| Aspecto | Descripción |
|:--------|:------------|
| **Para quién** | Guionistas, directores, productores, estudiantes de cine y equipos de preproducción |
| **Problema** | Las herramientas actuales de escritura de guiones (Final Draft, Celtx, WriterSolo) son estáticas: solo formatean texto. No integran dirección cinematográfica, ni asisten con IA en la generación de escenas |
| **Solución** | Un editor web en tiempo real que parsea Fountain, permite inyectar metadatos cinematográficos mediante plugins visuales, y genera/refina escenas usando IA con contexto técnico completo |
| **Diferenciador** | La combinación única de formato estándar (Fountain) + modificadores cinematográficos (planos, luces, lentes, VFX) + IA generativa contextual |

---

## 1.4 Público Objetivo

### Usuarios Primarios
- **Guionistas profesionales** que buscan acelerar su flujo de escritura con asistencia de IA sin perder control creativo
- **Directores y directores de fotografía** que quieren previsualizar decisiones técnicas integradas en el guion

### Usuarios Secundarios
- **Estudiantes de cine y escuelas de cine** que necesitan herramientas de aprendizaje interactivo
- **Productores** que buscan guiones con metadatos técnicos integrados para estimación de costos
- **Equipos de preproducción** que necesitan un documento vivo que conecte guion con dirección técnica

---

## 1.5 Alcance Funcional (MVP)

### Funcionalidades Core (Must Have)

| ID | Funcionalidad | Descripción |
|:---|:-------------|:------------|
| F-01 | **Editor Fountain en tiempo real** | Canvas de escritura con parsing en vivo del formato Fountain, renderizado con tipografía estándar (Courier Prime), auto-formateo de elementos (escenas, diálogos, acotaciones, transiciones) |
| F-02 | **Sistema de Plugins/Modificadores** | Panel lateral con controles interactivos para inyectar metadatos cinematográficos: planos, luces, cámaras/lentes, VFX/SFX, nivel de descripción |
| F-03 | **Motor de IA Generativa** | Integración con modelos de lenguaje (GPT-4, Claude, etc.) que recibe el contexto del guion + los modificadores activos y genera/refina escenas en streaming |
| F-04 | **Exportación profesional** | Generación de archivos PDF con formato de industria y exportación a .fdx (Final Draft) |
| F-05 | **Dashboard de proyectos** | Gestión de múltiples guiones, organización por proyectos, historial de versiones |

### Funcionalidades Extendidas (Should Have)

| ID | Funcionalidad | Descripción |
|:---|:-------------|:------------|
| F-06 | **Autenticación y cuentas** | Sign-up/login con proveedores OAuth, gestión de perfil |
| F-07 | **Colaboración en tiempo real** | Edición simultánea por múltiples usuarios con CRDT |
| F-08 | **Sistema de billing/suscripción** | Planes free/pro/enterprise con límites de uso de IA |
| F-09 | **Templates de guión** | Plantillas prediseñadas para largometraje, cortometraje, serie TV, documental |
| F-10 | **Historial de IA** | Log de todas las generaciones con posibilidad de restaurar versiones anteriores |

### Funcionalidades Futuras (Could Have)

| ID | Funcionalidad | Descripción |
|:---|:-------------|:------------|
| F-11 | **Storyboard automático** | Generación de storyboards visuales a partir del guion + modificadores |
| F-12 | **Análisis de guion** | Métricas automáticas: tiempo estimado, distribución de diálogos, arco dramático |
| F-13 | **API pública** | Endpoints para integración con herramientas externas de producción |
| F-14 | **Modo offline** | PWA con sincronización cuando recupere conectividad |

---

## 1.6 Restricciones y Supuestos

### Restricciones
- El formato de guión debe cumplir al 100% con la especificación **Fountain** (https://fountain.io)
- La tipografía en el editor y exportación debe ser **Courier Prime** (12pt, estándar de industria)
- El editor debe funcionar fluidamente con guiones de hasta **120 páginas** (~20,000 líneas)
- La latencia de respuesta de la IA debe ser < 2 segundos para el primer token (streaming)

### Supuestos
- Los usuarios tienen conexión a internet (la IA requiere backend)
- El navegador target es Chromium-based (Chrome, Edge, Brave) con soporte para Firefox y Safari
- El modelo de negocio será SaaS con suscripción mensual/anual

---

## 1.7 Métricas de Éxito (KPIs)

| Métrica | Objetivo |
|:--------|:---------|
| Tiempo de carga del editor | < 1.5 segundos |
| Latencia primer token IA | < 2 segundos |
| Parsing Fountain en tiempo real | < 16ms por keystroke (60fps) |
| Fidelidad de exportación PDF | 100% compliance con formato industria |
| Satisfacción de usuario (NPS) | > 50 |
| Retención mensual | > 60% |
