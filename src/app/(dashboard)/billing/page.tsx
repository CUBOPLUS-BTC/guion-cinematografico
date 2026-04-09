import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Para guionistas que están empezando.",
      features: ["3 Proyectos", "IA básica (Llama 3)", "Exportación PDF"],
      current: true,
    },
    {
      name: "Pro",
      price: "$19",
      description: "Para guionistas serios y profesionales.",
      features: ["Proyectos Ilimitados", "IA Avanzada (Claude 3.5)", "Exportación FDX", "Plugins Premium"],
      current: false,
    },
    {
      name: "Studio",
      price: "$49",
      description: "Para productoras y equipos de guion.",
      features: ["Todo en Pro", "Colaboración en tiempo real", "Roles de Usuario", "Soporte Prioritario"],
      current: false,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Suscripción y Facturación</h1>
        <p className="text-text-muted">Gestiona tu plan y accede a potentes herramientas de escritura.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={`bg-bg-secondary border-accent-muted flex flex-col ${plan.name === 'Pro' ? 'border-accent shadow-glow' : ''}`}>
            <CardHeader>
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-2xl font-black text-text-primary">{plan.price}<span className="text-sm font-normal text-text-muted">/mes</span></CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-text-muted">{plan.description}</p>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check className="h-4 w-4 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className={`w-full ${plan.current ? 'bg-accent-muted text-accent cursor-not-allowed' : 'bg-accent text-white hover:bg-accent/90'}`}
                disabled={plan.current}
              >
                {plan.current ? "Plan Actual" : `Elegir ${plan.name}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <section className="p-6 rounded-xl border border-accent-muted bg-bg-tertiary">
        <h3 className="text-lg font-bold mb-4">Método de Pago</h3>
        <p className="text-sm text-text-muted mb-4">No tienes métodos de pago registrados.</p>
        <Button variant="outline" className="border-accent-muted">Añadir Tarjeta</Button>
      </section>
    </div>
  );
}
