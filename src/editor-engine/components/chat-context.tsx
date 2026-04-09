"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useChatStore } from "@/editor-engine/store/chat-store"
import { useEditorStore } from "@/editor-engine/store/editor-store"
import { usePluginStore } from "@/editor-engine/store/plugin-store"
import type { ChatDocumentAction } from "@/lib/core/ai/chat-document"
import { getTextFromUIMessage } from "@/editor-engine/utils/ui-message-text"

const ACTION_HINTS: Record<Exclude<ChatDocumentAction, "chat">, string> = {
  generate:
    "Genera una escena nueva completa en formato Fountain, coherente con el documento actual.",
  continue: "Continúa el guion desde el final en Fountain, sin repetir lo ya escrito.",
  refine:
    "Refina y pule el guion completo para que sea más cinematográfico, manteniendo Fountain.",
  rewrite:
    "Reescribe el guion aplicando un tono más claro y visual, en Fountain.",
}

export type EditorChatContextValue = {
  projectId: string
  messages: UIMessage[]
  status: ReturnType<typeof useChat>["status"]
  sendMessage: ReturnType<typeof useChat>["sendMessage"]
  stop: ReturnType<typeof useChat>["stop"]
  busy: boolean
  runQuickAction: (action: Exclude<ChatDocumentAction, "chat">) => Promise<void>
  submitChat: (text: string) => Promise<void>
  setModel: (model: string) => void
}

const EditorChatContext = createContext<EditorChatContextValue | null>(null)

export type ChatProviderProps = {
  projectId: string
  initialMessages: UIMessage[]
  children: ReactNode
}

export function ChatProvider({
  projectId,
  initialMessages,
  children,
}: ChatProviderProps) {
  const setPendingAction = useChatStore((s) => s.setPendingAction)
  const documentFountain = useChatStore((s) => s.documentFountain)
  const updateStatsFromFountain = useEditorStore((s) => s.updateStatsFromFountain)
  const [activeModel, setActiveModel] = useState<string>("meta-llama/llama-3.1-8b-instruct:free")
  const activeModelRef = useRef(activeModel)

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: `/api/projects/${projectId}/chat`,
        credentials: "include",
        prepareSendMessagesRequest: async ({ body, messages }) => ({
          body: {
            ...(body ?? {}),
            messages,
            documentFountain: useChatStore.getState().documentFountain,
            modifiers: { technical: usePluginStore.getState().getAIModifiers() },
            model: activeModelRef.current,
            action: useChatStore.getState().pendingAction,
          },
        }),
      }),
    [projectId]
  )

  const { messages, sendMessage, status, stop } = useChat({
    id: `project-chat-${projectId}`,
    messages: initialMessages,
    transport,
    onFinish: ({ message }) => {
      const text = getTextFromUIMessage(message)
      const action = useChatStore.getState().pendingAction
      useChatStore.getState().applyAssistantOutput(text, action)
      useChatStore.getState().setPendingAction("chat")
    },
  })

  useEffect(() => {
    activeModelRef.current = activeModel
  }, [activeModel])

  useEffect(() => {
    updateStatsFromFountain(documentFountain)
  }, [documentFountain, updateStatsFromFountain])

  const busy = status === "streaming" || status === "submitted"

  const runQuickAction = useCallback(
    async (action: Exclude<ChatDocumentAction, "chat">) => {
      if (busy) return
      setPendingAction(action)
      await sendMessage({ text: ACTION_HINTS[action] })
    },
    [busy, sendMessage, setPendingAction]
  )

  const submitChat = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || busy) return
      setPendingAction("chat")
      await sendMessage({ text: trimmed })
    },
    [busy, sendMessage, setPendingAction]
  )

  const setModel = useCallback((model: string) => {
    setActiveModel(model)
  }, [])

  const value = useMemo<EditorChatContextValue>(
    () => ({
      projectId,
      messages,
      status,
      sendMessage,
      stop,
      busy,
      runQuickAction,
      submitChat,
      setModel,
    }),
    [
      projectId,
      messages,
      status,
      sendMessage,
      stop,
      busy,
      runQuickAction,
      submitChat,
      setModel,
    ]
  )

  return (
    <EditorChatContext.Provider value={value}>{children}</EditorChatContext.Provider>
  )
}

export function useEditorChat(): EditorChatContextValue {
  const ctx = useContext(EditorChatContext)
  if (!ctx) {
    throw new Error("useEditorChat must be used within ChatProvider")
  }
  return ctx
}
