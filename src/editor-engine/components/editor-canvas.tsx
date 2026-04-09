"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { FountainExtension } from "../core/fountain-extension"
import { useEditorStore } from "../store/editor-store"
import { useEffect } from "react"
import "./editor-canvas.css"
import type { JSONContent } from "@tiptap/core"

const DEMO_HTML = `
<div data-type="scene_heading">INT. CAFETERIA - DAY</div>
<p data-type="action">A small, dimly lit coffee shop. SARAH (20s) sits alone.</p>
<div data-type="character">SARAH</div>
<div data-type="parenthetical">(to herself)</div>
<div data-type="dialogue">I've been waiting for too long.</div>
`

export type EditorCanvasProps = {
  projectId: string
  initialContent: JSONContent | object | null
}

export function EditorCanvas({ projectId, initialContent }: EditorCanvasProps) {
  const { setEditor, updateStats, markDirty, zoom, markClean } = useEditorStore()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
      }),
      FountainExtension,
    ],
    content:
      initialContent && typeof initialContent === "object" && "type" in initialContent
        ? (initialContent as JSONContent)
        : DEMO_HTML,
    editorProps: {
      attributes: {
        class: "fountain-editor-canvas shadow-2xl focus:outline-none",
        style: `transform: scale(${zoom / 100}); transform-origin: top center;`,
      },
    },
    onUpdate: () => {
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

  const { isDirty } = useEditorStore()

  useEffect(() => {
    if (!isDirty || !editor) return

    const timeout = setTimeout(() => {
      void (async () => {
        try {
          const content = editor.getJSON()
          const res = await fetch(`/api/projects/${projectId}/content`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(content),
          })
          if (!res.ok) {
            return
          }
          markClean()
        } catch {
          /* red intentar en el siguiente ciclo */
        }
      })()
    }, 2000)

    return () => clearTimeout(timeout)
  }, [isDirty, editor, markClean, projectId])

  if (!editor) {
    return null
  }

  return (
    <div className="flex-1 overflow-y-auto bg-bg-primary py-12 scrollbar-hide">
      <EditorContent editor={editor} />
    </div>
  )
}
