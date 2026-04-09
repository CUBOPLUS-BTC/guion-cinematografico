# 09 — Sistema de Exportación

> **Documento:** Especificación de Exportación  
> **Última actualización:** 2026-04-08

---

## 9.1 Resumen

El sistema de exportación convierte el documento Fountain (AST interno) a formatos profesionales estándar de la industria cinematográfica: **PDF** y **FDX** (Final Draft XML).

---

## 9.2 Exportación a PDF

### Especificaciones de Formato (Industria Estándar)

| Aspecto | Valor |
|:--------|:------|
| **Tamaño de página** | US Letter (8.5" × 11") |
| **Fuente** | Courier Prime 12pt |
| **Interlineado** | Single-spaced |
| **Margen superior** | 1.0" |
| **Margen inferior** | 0.5" (más número de página) |
| **Margen izquierdo** | 1.5" |
| **Margen derecho** | 1.0" |
| **Numeración** | Esquina superior derecha, empezando en página 2 |
| **Regla 1 pag = 1 min** | El formato debe preservar esta relación |

### Márgenes por Elemento Fountain

| Elemento | Margen Izquierdo | Margen Derecho | Formato |
|:---------|:-----------------|:---------------|:--------|
| Scene Heading | 1.5" | 1.0" | MAYÚSCULAS, negrita opcional |
| Action | 1.5" | 1.0" | Normal |
| Character | 3.7" | — | MAYÚSCULAS |
| Parenthetical | 3.1" | 2.0" | (en paréntesis) |
| Dialogue | 2.5" | 2.0" | Normal |
| Transition | — | 1.0" | MAYÚSCULAS, alineado derecha |
| Page Number | — | 0.75" | Alineado derecha |

### Reglas de Paginación

1. **Scene headings** no pueden ser la última línea de una página (force break antes)
2. **Character + Dialogue** no se separan: si Character está al final, se mueve a la siguiente página
3. Si el diálogo se parte entre páginas: insertar `(MORE)` al final y `CHARACTER (CONT'D)` al inicio de la siguiente
4. **Transiciones** no pueden ser la primera línea de una página

### Implementación Técnica

| Aspecto | Decisión |
|:--------|:---------|
| **Librería** | `@react-pdf/renderer` o `pdfkit` (server-side) |
| **Generación** | Server-side en API route de Next.js |
| **Endpoint** | `POST /api/projects/[id]/export` con `format: 'pdf'` |
| **Respuesta** | Binary PDF stream para descarga directa |

### Página de Título (Title Page)

```
                              TÍTULO DEL GUIÓN
                              
                                 Escrito por
                              Nombre del Autor
                              
                              
                              
                              
                              
Datos de contacto                               Fecha / Borrador
Dirección                                       Draft #X
Email / Teléfono
```

### Opciones de Exportación PDF

| Opción | Tipo | Default |
|:-------|:-----|:--------|
| Incluir página de título | Boolean | Sí |
| Incluir números de escena | Boolean | No |
| Incluir notas | Boolean | No |
| Incluir metadatos de plugins | Boolean | No |
| Marca de agua (plan Free) | Boolean | Automático |
| Revisión / borrador | String | "First Draft" |

---

## 9.3 Exportación a FDX (Final Draft)

### Formato FDX

FDX es un formato XML propietario de Final Draft. La estructura básica:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Template="No" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. COFFEE SHOP - DAY</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>The place is nearly empty.</Text>
    </Paragraph>
    <Paragraph Type="Character">
      <Text>SARAH</Text>
    </Paragraph>
    <Paragraph Type="Dialogue">
      <Text>I've been waiting for you.</Text>
    </Paragraph>
  </Content>
  <TitlePage>...</TitlePage>
  <SceneProperties>...</SceneProperties>
</FinalDraft>
```

### Mapeo Fountain → FDX Paragraph Types

| Fountain Element | FDX Paragraph Type |
|:----------------|:-------------------|
| Scene Heading | `Scene Heading` |
| Action | `Action` |
| Character | `Character` |
| Dialogue | `Dialogue` |
| Parenthetical | `Parenthetical` |
| Transition | `Transition` |
| Centered | `Action` (con align center) |
| Section | `Action` (con formato especial) |
| Note | `Script Note` |

### Implementación

- Generación server-side
- Serialización XML con `xmlbuilder2` o similar
- Endpoint: `POST /api/projects/[id]/export` con `format: 'fdx'`
- Validación contra esquema FDX conocido

---

## 9.4 Importación

### Formatos Soportados

| Formato | Soporte | Método |
|:--------|:--------|:-------|
| **.fountain** | ✅ Completo | Parser Fountain directo |
| **.fdx** | ✅ Completo | Parser XML → AST Fountain |
| **.txt** | ⚠️ Parcial | Heurístico (intentar detectar formato) |
| **.pdf** | ❌ Futuro | OCR + heurísticos (complejo) |

### Flujo de Importación

```
Upload archivo ──► Detectar formato ──► Parser específico ──► AST Fountain ──► Crear proyecto
```

---

## 9.5 Otras Exportaciones (Futuro)

| Formato | Descripción | Prioridad |
|:--------|:------------|:----------|
| **HTML** | Vista web del guión (shareable link) | Media |
| **Markdown** | Para integración con otros tools | Baja |
| **JSON** | AST crudo para APIs externas | Baja |
| **ePub** | Para lectura en e-readers | Baja |
