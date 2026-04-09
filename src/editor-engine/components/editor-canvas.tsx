"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { FountainExtension } from "../core/fountain-extension"
import { useEditorStore } from "../store/editor-store"
import { useEffect } from "react"
import "./editor-canvas.css"

export const EditorCanvas = () => {
  const { setEditor, updateStats, markDirty, zoom } = useEditorStore()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable things that Fountain handles differently
        heading: false,
        bulletList: false,
        orderedList: false,
      }),
      FountainExtension,
    ],
    content: `
<div data-type="scene_heading">INT. CAFETERIA - DAY</div>
<p data-type="action">A small, dimly lit coffee shop. SARAH (20s) sits alone.</p>
<div data-type="character">SARAH</div>
<div data-type="parenthetical">(to herself)</div>
<div data-type="dialogue">I've been waiting for too long.</div>
    `,
    editorProps: {
      attributes: {
        class: "fountain-editor-canvas shadow-2xl focus:outline-none",
        style: `transform: scale(${zoom / 100}); transform-origin: top center;`,
      },
    },
    onUpdate: ({ editor }) => {
      updateStats()
      markDirty()
    },
  })

  useEffect(() => {
    if (!editor) return
    setEditor(editor)
    return () => {
      setEditor(null)
    }
  }, [editor, setEditor])

  // Lógica de Autoguardado
  const { isDirty, markClean } = useEditorStore()
  
  useEffect(() => {
    if (!isDirty || !editor) return

    const timeout = setTimeout(async () => {
      try {
        const content = editor.getJSON()
        // Nota: En una app real usaríamos el id de los params/store
        // Por ahora simulamos el guardado para validar la lógica
        console.log("Auto-saving content...", content)
        
        // Simulación de fetch:
        // await fetch(`/api/projects/${projectId}/content`, {
        //   method: 'PUT',
        //   body: JSON.stringify(content)
        // })
        
        markClean()
      } catch (error) {
        console.error("Failed to auto-save", error)
      }
    }, 2000)

    return () => clearTimeout(timeout)
  }, [isDirty, editor, markClean])

  if (!editor) {
    return null
  }

  return (
    <div className="flex-1 overflow-y-auto bg-bg-primary py-12 scrollbar-hide">
      <EditorContent editor={editor} />
    </div>
  )
}
