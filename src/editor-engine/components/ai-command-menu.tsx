"use client"

import * as React from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Sparkles, Wand2, Type, Repeat, Loader2 } from "lucide-react"
import { useAIGenerator } from "../hooks/use-ai-generator"

export function AICommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const { generateAction, isLoading } = useAIGenerator()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "g") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleAction = async (action: 'generate' | 'continue' | 'refine' | 'rewrite') => {
    await generateAction(action, searchValue)
    setOpen(false)
    setSearchValue("")
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Instrucción para la IA... (presiona Enter para generar)" 
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <CommandList>
        {isLoading && (
          <div className="p-4 flex items-center justify-center text-accent text-sm">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            La IA está pensando...
          </div>
        )}
        <CommandEmpty>Presiona Enter para enviar instrucción personalizada.</CommandEmpty>
        <CommandGroup heading="Acciones Rápidas">
          <CommandItem onSelect={() => handleAction('generate')}>
            <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
            <span>Generar Escena Completa</span>
          </CommandItem>
          <CommandItem onSelect={() => handleAction('continue')}>
            <Wand2 className="mr-2 h-4 w-4 text-blue-500" />
            <span>Continuar el Guion</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Transformación">
          <CommandItem onSelect={() => handleAction('refine')}>
            <Type className="mr-2 h-4 w-4 text-green-500" />
            <span>Refinar Selección</span>
          </CommandItem>
          <CommandItem onSelect={() => handleAction('rewrite')}>
            <Repeat className="mr-2 h-4 w-4 text-purple-500" />
            <span>Reescribir Escena</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
