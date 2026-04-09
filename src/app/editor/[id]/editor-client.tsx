"use client"

import { ChatPanel } from "@/editor-engine/components/chat-panel"
import { SynopsisPanel } from "@/editor-engine/components/synopsis-panel"
import { ChatProvider } from "@/editor-engine/components/chat-context"
import { EditorFooter } from "@/editor-engine/components/editor-footer"
import { EditorHeader } from "@/editor-engine/components/editor-header"
import { EditorLayout } from "@/editor-engine/components/editor-layout"
import { ModifiersPanel } from "@/editor-engine/components/modifiers-panel"
import { PreviewPanel } from "@/editor-engine/components/preview-panel"
import { GenerateVideoPromptsDialog } from "@/editor-engine/components/generate-video-prompts-dialog"
import { useEditorStore } from "@/editor-engine/store/editor-store"
import { useProjectStore } from "@/editor-engine/store/project-store"
import { useChatStore } from "@/editor-engine/store/chat-store"
import { usePluginStore } from "@/editor-engine/store/plugin-store"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { initializePlugins } from "@/editor-engine/plugins/all-plugins"
import { projectContentToFountainString } from "@/lib/core/fountain/project-content"
import type { UIMessage } from "ai"

function normalizeProjectSettings(settings: unknown): Record<string, unknown> {
  if (settings && typeof settings === "object" && !Array.isArray(settings)) {
    return { ...(settings as Record<string, unknown>) }
  }
  return {}
}

function getModifiersFromSettings(settings: unknown): unknown {
  const base = normalizeProjectSettings(settings)
  return base.modifiers
}

export type EditorClientProps = {
  projectId: string
  initialTitle: string
  initialContent: unknown
  initialSettings: unknown
  initialChatMessages: UIMessage[]
  initialLogline?: string
  initialSynopsis?: string
}

export function EditorClient({
  projectId,
  initialTitle,
  initialContent,
  initialSettings,
  initialChatMessages,
  initialLogline = "",
  initialSynopsis = "",
}: EditorClientProps) {
  const { stats } = useEditorStore()
  const setProject = useProjectStore((s) => s.setProject)
  const projectTitle = useProjectStore((s) => s.title)
  const updateProjectTitle = useProjectStore((s) => s.updateTitle)
  const setDocumentFountain = useChatStore((s) => s.setDocumentFountain)
  const markClean = useChatStore((s) => s.markClean)
  const getProjectContentPayload = useChatStore((s) => s.getProjectContentPayload)
  const chatDirty = useChatStore((s) => s.isDirty)
  const modifiersDirty = usePluginStore((s) => s.isDirty)
  const settingsBaseRef = useRef<Record<string, unknown>>(normalizeProjectSettings(initialSettings))
  const savedTitleRef = useRef(initialTitle)
  const [savedTitle, setSavedTitle] = useState(initialTitle)
  const [titleSaving, setTitleSaving] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)

  const initialFountain = useMemo(
    () => projectContentToFountainString(initialContent),
    [initialContent]
  )

  useEffect(() => {
    settingsBaseRef.current = normalizeProjectSettings(initialSettings)
  }, [projectId, initialSettings])

  useEffect(() => {
    savedTitleRef.current = initialTitle
    setSavedTitle(initialTitle)
    setTitleError(null)
  }, [projectId, initialTitle])

  useEffect(() => {
    initializePlugins()
    usePluginStore.getState().hydrateFromSettings(getModifiersFromSettings(initialSettings))
  }, [projectId, initialSettings])

  useEffect(() => {
    setProject({
      id: projectId,
      title: initialTitle,
      logline: "",
      genre: "DRAMA",
      content: initialContent,
    })
  }, [projectId, initialTitle, initialContent, setProject])

  useEffect(() => {
    setDocumentFountain(initialFountain, { markDirty: false })
  }, [initialFountain, setDocumentFountain])

  useEffect(() => {
    if (!chatDirty) return
    const t = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch(`/api/projects/${projectId}/content`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(getProjectContentPayload()),
          })
          if (res.ok) {
            markClean()
          }
        } catch {
          /* reintento en siguiente ciclo */
        }
      })()
    }, 2000)
    return () => clearTimeout(t)
  }, [chatDirty, getProjectContentPayload, markClean, projectId])

  useEffect(() => {
    if (!modifiersDirty) return
    const t = setTimeout(() => {
      void (async () => {
        try {
          const modifiers = usePluginStore.getState().getSettingsPayload()
          const merged = { ...settingsBaseRef.current, modifiers }
          const res = await fetch(`/api/projects/${projectId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ settings: merged }),
          })
          if (res.ok) {
            const updated = (await res.json()) as { settings?: unknown }
            usePluginStore.getState().markClean()
            if (
              updated.settings &&
              typeof updated.settings === "object" &&
              !Array.isArray(updated.settings)
            ) {
              settingsBaseRef.current = { ...(updated.settings as Record<string, unknown>) }
            } else {
              settingsBaseRef.current = merged
            }
          }
        } catch {
          /* reintento en siguiente ciclo */
        }
      })()
    }, 2000)
    return () => clearTimeout(t)
  }, [modifiersDirty, projectId])

  const persistTitle = useCallback(
    async (nextTitle: string) => {
      const trimmedTitle = nextTitle.trim()
      if (!trimmedTitle || trimmedTitle === savedTitleRef.current.trim()) {
        return
      }

      setTitleSaving(true)
      setTitleError(null)

      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: trimmedTitle }),
        })

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string }
          setTitleError(data.error ?? "No se pudo guardar el nombre del guion")
          return
        }

        const updated = (await res.json()) as { title?: string }
        const persistedTitle =
          typeof updated.title === "string" && updated.title.trim() !== ""
            ? updated.title.trim()
            : trimmedTitle

        savedTitleRef.current = persistedTitle
        setSavedTitle(persistedTitle)
        updateProjectTitle(persistedTitle)
        setTitleError(null)
      } catch {
        setTitleError("No se pudo guardar el nombre del guion")
      } finally {
        setTitleSaving(false)
      }
    },
    [projectId, updateProjectTitle]
  )

  useEffect(() => {
    const trimmedTitle = projectTitle.trim()
    if (!trimmedTitle || trimmedTitle === savedTitleRef.current.trim()) {
      return
    }

    const timeoutId = setTimeout(() => {
      void persistTitle(projectTitle)
    }, 900)

    return () => clearTimeout(timeoutId)
  }, [persistTitle, projectTitle])

  const handleTitleCommit = useCallback(() => {
    const trimmedTitle = projectTitle.trim()
    if (!trimmedTitle) {
      updateProjectTitle(savedTitleRef.current)
      setTitleError(null)
      return
    }

    void persistTitle(projectTitle)
  }, [persistTitle, projectTitle, updateProjectTitle])

  const handleExport = async (format: "pdf" | "fdx") => {
    const res = await fetch(`/api/projects/${projectId}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        format,
        options: {
          includeTitlePage: true,
          revision: "Borrador",
        },
      }),
    })
    if (!res.ok) return
    const blob = await res.blob()
    const dispo = res.headers.get("Content-Disposition")
    const match = dispo?.match(/filename="([^"]+)"/)
    const filename = match?.[1] ?? `guion.${format === "pdf" ? "pdf" : "fdx"}`
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ChatProvider
      key={projectId}
      projectId={projectId}
      initialMessages={initialChatMessages}
    >
      <div className="h-screen w-full flex flex-col bg-bg-primary overflow-hidden">
        <EditorHeader
          title={projectTitle}
          savedTitle={savedTitle}
          chatDirty={chatDirty}
          titleSaving={titleSaving}
          titleError={titleError}
          wordCount={stats.wordCount}
          sceneCount={stats.sceneCount}
          onTitleChange={updateProjectTitle}
          onTitleCommit={handleTitleCommit}
          onExportPdf={() => void handleExport("pdf")}
          onExportFdx={() => void handleExport("fdx")}
          toolbarExtra={<GenerateVideoPromptsDialog projectId={projectId} />}
        />

        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <EditorLayout
            chatSlot={
              <ChatPanel
                synopsisSlot={
                  <SynopsisPanel
                    projectId={projectId}
                    model="openai/gpt-oss-20b:free"
                    initialLogline={initialLogline}
                    initialSynopsis={initialSynopsis}
                  />
                }
              />
            }
            previewSlot={<PreviewPanel />}
            modifiersSlot={<ModifiersPanel className="border-0 rounded-none" />}
          />
        </div>

        <EditorFooter
          pageCount={stats.pageCount}
          estimatedDuration={stats.estimatedDuration}
        />
      </div>
    </ChatProvider>
  )
}
