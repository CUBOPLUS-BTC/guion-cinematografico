import { useCompletion } from 'ai/react';
import { useEditorStore } from '../store/editor-store';
import { useProjectStore } from '../store/project-store';
import { AIRequest } from '@/lib/core/ai/orchestrator';
import { convertTipTapToFountain } from '@/lib/core/fountain/convert-tiptap';

export const useAIGenerator = () => {
  const { editor, markDirty } = useEditorStore();
  const project = useProjectStore();

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/ai/generate',
    onFinish: (_prompt: string, completion: string) => {
      if (editor) {
        // Para simplificar, insertamos al final o en la selección
        editor.commands.insertContent(completion);
        markDirty();
      }
    },
  });

  const generateAction = async (action: AIRequest['action'], userInstruction: string = "") => {
    if (!editor) return;

    const json = editor.getJSON();
    const allElements = convertTipTapToFountain(json);
    
    // Tomamos las últimas 15 líneas como contexto
    const previousScenes = allElements.slice(-15);

    const request: AIRequest = {
      action,
      context: {
        title: project.title,
        previousScenes,
        currentScene: null,
        characters: [], // Aquí podríamos extraer personajes únicos del script
      },
      modifiers: {},
      userInstruction,
      model: 'anthropic/claude-3-haiku',
    };

    await complete(JSON.stringify(request));
  };

  return {
    generateAction,
    completion,
    isLoading,
  };
};
