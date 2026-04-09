import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MoreVertical, Clock, Film } from "lucide-react";
import Link from "next/link";

interface ProjectCardProps {
  id: string;
  title: string;
  updatedAt: Date;
  sceneCount: number;
}

export function ProjectCard({ id, title, updatedAt, sceneCount }: ProjectCardProps) {
  return (
    <Card className="hover:border-accent transition-all group bg-bg-secondary border-accent-muted">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-text-primary group-hover:text-accent">
          {title}
        </CardTitle>
        <MoreVertical className="h-4 w-4 text-text-muted" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Clock className="h-3 w-3" />
          <span>Editado hace {new Date().getDate() - updatedAt.getDate()} días</span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-tighter">
          <Film className="h-3 w-3" />
          <span>{sceneCount} Escenas</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="secondary" className="w-full text-xs h-8">
          <Link href={`/editor/${id}`}>Abrir Editor</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
