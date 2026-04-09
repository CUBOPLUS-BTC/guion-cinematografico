# 10 — Estado y Modelo de Datos

> **Documento:** Especificación de Estado y Base de Datos  
> **Última actualización:** 2026-04-08

---

## 10.1 Gestión de Estado (Cliente)

### Stores de Zustand

```
┌─────────────────────────────────────────────────┐
│                Zustand Stores                    │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐             │
│  │ useEditorStore│  │usePluginStore│             │
│  │ - content     │  │ - states     │             │
│  │ - cursor      │  │ - active     │             │
│  │ - selection   │  │ - update()   │             │
│  │ - isDirty     │  │ - toggle()   │             │
│  └──────────────┘  └──────────────┘             │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐             │
│  │ useAIStore   │  │useProjectStore│            │
│  │ - isStreaming │  │ - project    │             │
│  │ - history     │  │ - save()     │             │
│  │ - generate() │  │ - load()     │             │
│  └──────────────┘  └──────────────┘             │
│                                                  │
│  ┌──────────────┐                               │
│  │ useUIStore   │                               │
│  │ - theme      │                               │
│  │ - panels     │                               │
│  │ - zoom       │                               │
│  └──────────────┘                               │
└─────────────────────────────────────────────────┘
```

### Store: useEditorStore

```typescript
interface EditorStore {
  /** Referencia a la instancia TipTap */
  editor: Editor | null;
  setEditor: (editor: Editor) => void;
  
  /** Estado de guardado */
  isDirty: boolean;
  lastSavedAt: Date | null;
  markDirty: () => void;
  markClean: () => void;
  
  /** Estadísticas en tiempo real */
  stats: {
    pageCount: number;
    wordCount: number;
    sceneCount: number;
    characterNames: string[];
    estimatedDuration: string;
  };
  updateStats: () => void;
  
  /** Zoom del canvas */
  zoom: number;
  setZoom: (zoom: number) => void;
  
  /** Outline del documento (para panel izquierdo) */
  outline: OutlineItem[];
  updateOutline: () => void;
}
```

### Store: usePluginStore

```typescript
interface PluginStore {
  /** Estado de cada plugin */
  states: Record<string, PluginState>;
  
  /** Plugins activos */
  activePlugins: string[];
  
  /** Acciones */
  updatePlugin: (id: string, state: Partial<PluginState>) => void;
  togglePlugin: (id: string) => void;
  resetPlugin: (id: string) => void;
  resetAll: () => void;
  
  /** Computed: contexto combinado para IA */
  getAIContext: () => CombinedPluginContext;
}
```

### Store: useAIStore

```typescript
interface AIStore {
  /** Estado de streaming */
  isStreaming: boolean;
  streamingText: string;
  progress: number; // 0-1
  
  /** Modelo seleccionado */
  selectedModel: AIModel;
  setModel: (model: AIModel) => void;
  
  /** Historial de sesión */
  sessionHistory: AIGeneration[];
  
  /** Acciones */
  generate: (request: AIRequest) => Promise<void>;
  cancel: () => void;
  accept: () => void;
  reject: () => void;
  
  /** Config */
  temperature: number;
  setTemperature: (t: number) => void;
}
```

---

## 10.2 Esquema de Base de Datos (Prisma)

### Diagrama ER

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │────<│   Project    │────<│   Version    │
│              │     │              │     │              │
│ id           │     │ id           │     │ id           │
│ email        │     │ userId    FK │     │ projectId FK │
│ name         │     │ title        │     │ content      │
│ image        │     │ logline      │     │ label        │
│ plan         │     │ genre        │     │ createdAt    │
│ stripeId     │     │ format       │     └──────────────┘
│ createdAt    │     │ language     │
└──────┬───────┘     │ content      │     ┌──────────────┐
       │             │ status       │────<│ AIGeneration │
       │             │ settings     │     │              │
       │             │ createdAt    │     │ id           │
       │             │ updatedAt    │     │ projectId FK │
       │             └──────────────┘     │ action       │
       │                                  │ prompt       │
       │             ┌──────────────┐     │ output       │
       └────────────<│  Session     │     │ modifiers    │
       │             │  Account     │     │ model        │
       │             │ (NextAuth)   │     │ tokens       │
       │             └──────────────┘     │ accepted     │
       │                                  │ createdAt    │
       │             ┌──────────────┐     └──────────────┘
       └────────────<│ Subscription │
                     │              │
                     │ id           │
                     │ userId    FK │
                     │ stripeSubId  │
                     │ plan         │
                     │ status       │
                     │ currentStart │
                     │ currentEnd   │
                     └──────────────┘
```

### Modelos Prisma

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  passwordHash  String?
  
  plan          Plan      @default(FREE)
  
  projects      Project[]
  sessions      Session[]
  accounts      Account[]
  subscription  Subscription?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Project {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title     String
  logline   String   @default("")
  genre     Genre    @default(DRAMA)
  format    ScreenplayFormat @default(FEATURE)
  language  String   @default("es")
  
  content   Json     // FountainJSON (AST serializado)
  settings  Json     @default("{}")
  
  status    ProjectStatus @default(DRAFT)
  
  versions     Version[]
  generations  AIGeneration[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
}

model Version {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  content   Json
  label     String   @default("Auto-save")
  
  createdAt DateTime @default(now())
  
  @@index([projectId])
}

model AIGeneration {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  action    AIAction
  prompt    String   @db.Text
  output    String   @db.Text
  modifiers Json
  model     String
  
  inputTokens  Int
  outputTokens Int
  
  accepted  Boolean  @default(false)
  
  createdAt DateTime @default(now())
  
  @@index([projectId])
}

model Subscription {
  id           String   @id @default(cuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  stripeSubId  String   @unique
  stripeCustId String
  plan         Plan
  status       SubStatus
  
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Enums
enum Plan { FREE PRO ENTERPRISE }
enum Genre { DRAMA COMEDY THRILLER HORROR SCIFI ROMANCE ACTION DOCUMENTARY OTHER }
enum ScreenplayFormat { FEATURE SHORT SERIES PILOT DOCUMENTARY }
enum ProjectStatus { DRAFT IN_PROGRESS REVIEW FINAL }
enum AIAction { GENERATE REFINE CONTINUE REWRITE }
enum SubStatus { ACTIVE PAST_DUE CANCELED INCOMPLETE }
```

---

## 10.3 API Contracts

### POST `/api/ai/generate`

**Request:**
```typescript
{
  projectId: string;
  action: 'generate' | 'refine' | 'continue' | 'rewrite';
  userInstruction: string;
  context: { /* auto-built from project */ };
  modifiers: Record<string, PluginState>;
  model: string;
  config: { temperature: number; maxTokens: number; };
}
```

**Response:** `text/event-stream` (SSE)

### GET `/api/projects`

**Response:**
```typescript
{
  projects: Array<{
    id: string;
    title: string;
    logline: string;
    genre: string;
    status: string;
    pageCount: number;
    updatedAt: string;
  }>;
  total: number;
}
```

### POST `/api/projects/[id]/export`

**Request:**
```typescript
{
  format: 'pdf' | 'fdx';
  options: {
    includeTitlePage: boolean;
    includeSceneNumbers: boolean;
    includeNotes: boolean;
    revision: string;
  };
}
```

**Response:** Binary file stream con `Content-Disposition: attachment`
