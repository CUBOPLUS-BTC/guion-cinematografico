"use client"

export type EditorFooterProps = {
  pageCount: number
  estimatedDuration: string
}

export function EditorFooter({ pageCount, estimatedDuration }: EditorFooterProps) {
  return (
    <footer className="h-8 border-t border-accent-muted bg-bg-tertiary flex items-center px-4 justify-between text-[10px] text-text-muted shrink-0">
      <div className="flex gap-4 flex-wrap">
        <span>{pageCount} Pág</span>
        <span>{estimatedDuration}</span>
        <span className="hidden sm:inline">Markdown · Streamdown</span>
      </div>
      <div className="flex gap-4">
        <span>IA: Conectada</span>
        <span className="text-success font-bold uppercase">Listo</span>
      </div>
    </footer>
  )
}
