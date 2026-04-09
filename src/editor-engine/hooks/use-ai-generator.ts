import { useCompletion } from "@ai-sdk/react"
import { useEditorStore } from "../store/editor-store"
import { useProjectStore } from "../store/project-store"
import { AIRequest } from "@/lib/core/ai/orchestrator"
import { convertTipTapToFountain } from "@/lib/core/fountain/convert-tiptap"
import { usePluginStore } from "../store/plugin-store"

export const useAIGenerator = () => {
  const { editor, markDirty } = useEditorStore()
  const project = useProjectStore()
  const { getAIModifiers } = usePluginStore()

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/ai/generate",
    credentials: "include",
    onFinish: (_prompt: string, completion: string) => {
      if (editor && completion) {
        editor.commands.insertContent(completion)
        markDirty()
      }
    },
  })

  const generateAction = async (
    action: AIRequest["action"],
    userInstruction: string = ""
  ) => {
    if (!editor) return

    const json = editor.getJSON()
    const allElements = convertTipTapToFountain(json)

    const previousScenes = allElements.slice(-15)

    const request: AIRequest = {
      action,
      context: {
        title: project.title,
        previousScenes,
        currentScene: null,
        characters: [],
      },
      modifiers: { technical: getAIModifiers() },
      userInstruction,
      model: "anthropic/claude-3-haiku",
    }

    await complete(JSON.stringify(request))
  }

  return {
    generateAction,
    completion,
    isLoading,
  }
}
