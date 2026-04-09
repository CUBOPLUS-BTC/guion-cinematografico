"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Clapperboard,
  Film,
  MessageSquare,
  Rocket,
  Shield,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

const FOUNTAIN_DEMO = `INT. ESTUDIO — DÍA

La luz entra oblicua. MARCOS mira el guion abierto.

MARCOS
(quieto)
No es el final. Es el corte.`

function useTypewriter(full: string, msPerChar: number, startDelayMs: number) {
  const [out, setOut] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    let i = 0
    let timeoutId: ReturnType<typeof setTimeout>

    function schedule(delay: number, fn: () => void) {
      timeoutId = setTimeout(() => {
        if (!cancelled) fn()
      }, delay)
    }

    function tick() {
      if (cancelled) return
      i += 1
      setOut(full.slice(0, i))
      if (i < full.length) {
        schedule(msPerChar, tick)
      } else {
        setDone(true)
      }
    }

    schedule(startDelayMs, tick)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [full, msPerChar, startDelayMs])

  return { text: out, done }
}

function LandingReveal({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode
  className?: string
  delayMs?: number
}) {
  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-4 duration-700",
        className
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  )
}

export function LandingView() {
  const [scrolled, setScrolled] = useState(false)
  const { text: typed, done: typeDone } = useTypewriter(FOUNTAIN_DEMO, 22, 900)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col bg-bg-primary text-text-primary selection:bg-accent selection:text-white">
      <div className="pointer-events-none fixed inset-0 landing-hero-mesh" aria-hidden />
      <div className="pointer-events-none fixed inset-0 landing-grain opacity-[0.22] dark:opacity-[0.28]" aria-hidden />

      <nav
        className={cn(
          "fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b px-5 transition-[background-color,box-shadow,backdrop-filter] duration-300 md:px-8",
          scrolled
            ? "border-accent-muted bg-bg-primary/88 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-bg-primary/45 backdrop-blur-md"
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-accent shadow-glow">
            <Film className="size-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tighter">GUION.AI</span>
        </Link>
        <div className="flex items-center gap-3 md:gap-6">
          <div>
            <ThemeToggle />
          </div>
          <Link
            href="/login"
            className="hidden text-sm font-medium text-text-secondary transition-colors hover:text-accent sm:inline"
          >
            Iniciar sesión
          </Link>
          <Button
            asChild
            className="rounded-full bg-accent px-5 text-white shadow-glow hover:bg-accent/90"
          >
            <Link href="/dashboard">Empezar a escribir</Link>
          </Button>
        </div>
      </nav>

      <main className="relative flex-1 px-5 pb-24 pt-28 md:px-8 md:pb-32 md:pt-32">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16">
          <div className="space-y-8">
            <LandingReveal delayMs={0}>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                <Sparkles className="size-3.5" />
                Escritura asistida por IA
              </div>
            </LandingReveal>

            <LandingReveal delayMs={120}>
              <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-black leading-[0.95] tracking-tighter text-text-primary">
                Guiones con intención.
                <span className="mt-2 block text-balance text-text-muted">
                  <span className="text-accent">Cine</span> en cada página.
                </span>
              </h1>
            </LandingReveal>

            <LandingReveal delayMs={260}>
              <p className="max-w-xl text-pretty text-base font-normal leading-relaxed text-text-secondary md:text-lg">
                Fountain, modificadores de dirección y chat contextual: una sola superficie para pasar del
                rascuño al set sin perder el tono.
              </p>
            </LandingReveal>

            <LandingReveal delayMs={380} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-xl bg-accent px-8 text-lg font-semibold text-white shadow-glow"
              >
                <Link href="/dashboard">Crear mi primer proyecto</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 rounded-xl border-accent-muted px-8 text-lg text-text-primary hover:bg-bg-secondary"
              >
                <Link href="#como-funciona">Cómo funciona</Link>
              </Button>
            </LandingReveal>
          </div>

          <LandingReveal delayMs={520} className="relative min-h-[320px] lg:min-h-[380px]">
            <div className="absolute -right-6 -top-6 hidden size-40 rounded-full bg-accent/15 blur-3xl md:block" aria-hidden />
            <div
              className={cn(
                "relative flex h-full flex-col overflow-hidden rounded-2xl border border-accent-muted bg-bg-secondary/90 shadow-lg",
                "ring-1 ring-black/5 dark:ring-white/10"
              )}
            >
              <div className="flex items-center gap-2 border-b border-accent-muted bg-bg-tertiary/80 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-error/80" />
                  <span className="size-2.5 rounded-full bg-warning/80" />
                  <span className="size-2.5 rounded-full bg-success/70" />
                </div>
                <span className="ml-2 font-mono text-[10px] font-medium uppercase tracking-widest text-text-muted">
                  Vista previa · Fountain
                </span>
                <MessageSquare className="ml-auto size-4 text-text-muted" aria-hidden />
              </div>
              <div className="relative flex-1 bg-bg-canvas p-5 font-screenplay text-[13px] leading-relaxed text-text-primary dark:bg-bg-primary/40">
                <pre className="font-screenplay whitespace-pre-wrap wrap-break-word">
                  {typeDone ? (
                    <>
                      <span className="text-fountain-scene">INT. ESTUDIO — DÍA</span>
                      {"\n\n"}
                      <span className="text-fountain-action">
                        La luz entra oblicua. MARCOS mira el guion abierto.
                      </span>
                      {"\n\n"}
                      <span className="text-fountain-character">MARCOS</span>
                      {"\n"}
                      <span className="text-fountain-parenthetical">(quieto)</span>
                      {"\n"}
                      <span className="text-fountain-dialogue">No es el final. Es el corte.</span>
                    </>
                  ) : (
                    <>
                      <span className="text-fountain-dialogue">{typed}</span>
                      <span className="landing-cursor" aria-hidden />
                    </>
                  )}
                </pre>
              </div>
              <div className="border-t border-accent-muted bg-bg-secondary/80 px-4 py-2 text-[10px] uppercase tracking-widest text-text-muted">
                {typeDone ? "Sincronizado" : "Escribiendo…"}
              </div>
            </div>
          </LandingReveal>
        </section>

        {/* Features — asimetría */}
        <section
          id="features"
          className="mx-auto mt-28 max-w-6xl space-y-10 md:mt-36"
          aria-labelledby="features-heading"
        >
          <div className="max-w-2xl">
            <p id="features-heading" className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              Capacidades
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tighter text-text-primary md:text-4xl">
              Todo lo que necesitas para producción.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
            <div className="group flex flex-col justify-between rounded-3xl border border-accent-muted bg-bg-secondary p-8 transition-all duration-300 hover:border-accent/50 hover:shadow-md lg:col-span-4 lg:flex-row lg:items-center lg:gap-10">
              <div className="size-14 shrink-0 rounded-2xl bg-accent/15 p-3 text-accent transition-transform duration-300 group-hover:scale-105">
                <Wand2 className="size-full" />
              </div>
              <div className="mt-6 min-w-0 flex-1 lg:mt-0">
                <h3 className="text-xl font-bold tracking-tight">IA que entiende Fountain</h3>
                <p className="mt-2 text-pretty text-text-muted">
                  Sugerencias de diálogo y acción alineadas con el formato y con tu tono — no respuestas genéricas
                  fuera de página.
                </p>
              </div>
            </div>

            <div className="group rounded-3xl border border-accent-muted bg-bg-secondary p-8 transition-all duration-300 hover:border-accent/50 hover:shadow-md lg:col-span-2">
              <div className="mb-6 size-12 rounded-2xl bg-accent/15 p-3 text-accent transition-transform group-hover:scale-110">
                <Zap className="size-full" />
              </div>
              <h3 className="text-lg font-bold">Streaming en vivo</h3>
              <p className="mt-2 text-sm text-text-muted">
                Respuestas en flujo: ves la escena nacer en tiempo real.
              </p>
            </div>

            <div className="group rounded-3xl border border-accent-muted bg-bg-secondary p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md lg:col-span-2">
              <div className="mb-6 size-12 rounded-2xl bg-accent/15 p-3 text-accent">
                <Shield className="size-full" />
              </div>
              <h3 className="text-lg font-bold">Exportación profesional</h3>
              <p className="mt-2 text-sm text-text-muted">
                PDF y Final Draft (.fdx) listos para revisión y rodaje.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-3xl border border-accent-muted bg-linear-to-br from-accent/20 via-bg-secondary to-bg-secondary p-8 transition-all hover:border-accent/40 lg:col-span-4">
              <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-accent/25 blur-2xl" />
              <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-text-primary">Un solo flujo</h3>
                  <p className="mt-2 max-w-md text-text-secondary">
                    Chat, vista previa y exportación en la misma superficie — menos contexto perdido, más
                    continuidad creativa.
                  </p>
                </div>
                <Clapperboard className="size-16 shrink-0 text-accent/40 md:size-20" aria-hidden />
              </div>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section
          id="como-funciona"
          className="mx-auto mt-28 max-w-6xl md:mt-36"
          aria-labelledby="how-heading"
        >
          <h2 id="how-heading" className="sr-only">
            Cómo funciona
          </h2>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Cómo funciona</p>
          <p className="mt-2 max-w-2xl text-3xl font-black tracking-tighter text-text-primary md:text-4xl">
            De la idea al guion en tres pasos.
          </p>

          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Crea tu proyecto",
                body: "Abre un guion nuevo o retoma uno. El título y el logline te ayudan a mantener el foco.",
              },
              {
                step: "02",
                title: "Escribe con la IA",
                body: "Pide continuaciones, refina diálogos y mantén el formato Fountain sin salir del flujo.",
              },
              {
                step: "03",
                title: "Exporta y comparte",
                body: "Genera PDF o FDX para equipo y productores. Tu trabajo se ve como debe verse en industria.",
              },
            ].map((item) => (
              <li
                key={item.step}
                className="relative rounded-2xl border border-accent-muted bg-bg-secondary/80 p-6 pt-10 transition-transform hover:-translate-y-1"
              >
                <span className="absolute left-6 top-4 font-mono text-4xl font-black text-accent/25">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA cinematográfico */}
        <section className="mx-auto mt-28 max-w-6xl md:mt-36" aria-labelledby="cta-heading">
          <div className="relative overflow-hidden rounded-3xl border border-accent-muted bg-linear-to-br from-bg-secondary via-bg-primary to-bg-tertiary px-8 py-14 shadow-lg md:px-14 md:py-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,oklch(0.7_0.14_75/0.2),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,oklch(0.25_0.02_260/0.4),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_100%_100%,oklch(0.4_0.08_75/0.25),transparent_50%)]" />
            <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p id="cta-heading" className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
                  Siguiente toma
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tighter text-text-primary md:text-4xl">
                  ¿Listo para rodar tu historia?
                </h2>
                <p className="mt-3 max-w-lg text-text-secondary">
                  Entra al editor, prueba el chat contextual y lleva tu guion al nivel de producción.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="h-14 shrink-0 rounded-full bg-accent px-10 text-base font-bold text-white shadow-glow hover:bg-accent/90"
              >
                <Link href="/dashboard">Probar gratis</Link>
              </Button>
              <Rocket className="pointer-events-none absolute -bottom-6 right-8 size-24 text-accent/15 md:size-32" aria-hidden />
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-accent-muted bg-bg-secondary/90 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-4 md:px-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-accent">
                <Film className="size-4 text-white" />
              </div>
              <span className="font-black tracking-tighter">GUION.AI</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-text-muted">
              Editor de guiones Fountain con IA para equipos que quieren claridad visual y continuidad en el
              set.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Producto</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-text-secondary hover:text-accent">
                  Panel
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-text-secondary hover:text-accent">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link href="#como-funciona" className="text-text-secondary hover:text-accent">
                  Cómo funciona
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Legal</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="#" className="text-text-secondary hover:text-accent">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="#" className="text-text-secondary hover:text-accent">
                  Términos
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-accent-muted px-5 pt-8 text-xs text-text-muted md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} Guion Cinematográfico AI. Todos los derechos reservados.</p>
          <p className="text-text-muted/80">Hecho para guionistas y equipos de producción.</p>
        </div>
      </footer>
    </div>
  )
}
