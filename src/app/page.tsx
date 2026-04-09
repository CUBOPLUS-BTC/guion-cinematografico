import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Film, Wand2, Zap, Shield, Rocket } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary selection:bg-accent selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-bg-primary/80 backdrop-blur-md border-b border-accent-muted px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-accent rounded-lg flex items-center justify-center">
            <Film className="text-white size-5" />
          </div>
          <span className="font-bold text-xl tracking-tighter">GUION.AI</span>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium hover:text-accent transition-colors">Iniciar Sesión</Link>
          <Button asChild className="bg-accent hover:bg-accent/90 text-white rounded-full px-6">
            <Link href="/dashboard">Empezar a Escribir</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1 pt-32 pb-20 px-6">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
            <Sparkles className="size-3" />
            Escritura Potenciada por IA
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
            ESCRIBE <span className="text-accent underline decoration-4 underline-offset-8">HISTORIAS</span> <br />
            QUE MERECEN SER VISTAS.
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-text-muted font-medium">
            El primer editor de guiones que integra metadatos cinematográficos y modelos de lenguaje avanzados para llevar tu cortometraje o película al siguiente nivel.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 bg-accent text-white text-lg rounded-xl shadow-glow">
              <Link href="/dashboard">Crear mi primer proyecto</Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 border-accent-muted text-lg rounded-xl">
              Ver Demo
            </Button>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="max-w-6xl mx-auto mt-40 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-8 rounded-3xl bg-bg-secondary border border-accent-muted hover:border-accent/50 transition-all flex flex-col justify-between group">
            <div className="size-12 bg-accent/20 rounded-2xl flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform">
              <Wand2 className="size-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Editor con IA Contextual</h3>
              <p className="text-text-muted">La IA entiende el formato Fountain y sabe cuándo sugerir diálogos o acciones basadas en tus plugins de dirección.</p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-bg-secondary border border-accent-muted hover:border-accent/50 transition-all flex flex-col justify-between group">
             <div className="size-12 bg-accent/20 rounded-2xl flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform">
              <Zap className="size-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Streaming SSE</h3>
              <p className="text-text-muted">Sin esperas. Mira cómo tu escena se escribe palabra por palabra a la velocidad del pensamiento.</p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-bg-secondary border border-accent-muted hover:border-accent/50 transition-all flex flex-col justify-between group">
             <div className="size-12 bg-accent/20 rounded-2xl flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform">
              <Shield className="size-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Formato Estándar</h3>
              <p className="text-text-muted">Exporta a PDF profesional o Final Draft (.fdx) listo para producción.</p>
            </div>
          </div>

           <div className="md:col-span-2 p-8 rounded-3xl bg-accent text-white border border-accent-muted flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-sm text-center md:text-left">
              <h3 className="text-3xl font-black mb-4 tracking-tight uppercase">¿Listo para el set?</h3>
              <p className="text-white/80 mb-6">Únete a cientos de guionistas que ya están transformando la forma de escribir cine.</p>
              <Button asChild className="bg-white text-accent hover:bg-white/90 rounded-full px-8 font-bold">
                <Link href="/dashboard">PROBAR GRATIS</Link>
              </Button>
            </div>
            <div className="flex-1 flex justify-center">
              <Rocket className="size-32 opacity-20" />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 border-t border-accent-muted bg-bg-secondary">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-text-muted text-sm">
          <p>© 2026 Guion Cinematográfico AI. Todos los derechos reservados.</p>
          <div className="flex gap-6">
             <Link href="#" className="hover:text-accent">Privacidad</Link>
             <Link href="#" className="hover:text-accent">Términos</Link>
             <Link href="#" className="hover:text-accent">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
