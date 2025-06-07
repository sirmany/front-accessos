
import { LoginForm } from "@/components/auth/LoginForm";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="mb-8 text-center">
        {/* Es podria afegir un logo aquí si estigués disponible */}
        <h1 className="text-4xl font-bold tracking-tight text-primary">{APP_NAME}</h1>
        <p className="text-muted-foreground">Sistema de Gestió de Sol·licituds</p>
      </div>
      <LoginForm />
    </main>
  );
}
