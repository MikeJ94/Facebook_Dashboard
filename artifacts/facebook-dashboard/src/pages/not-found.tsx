import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-foreground">404 — Página no encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">La página que buscas no existe.</p>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline text-sm font-medium">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
