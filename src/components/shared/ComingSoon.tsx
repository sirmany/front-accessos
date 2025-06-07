import { Construction } from 'lucide-react';

interface ComingSoonProps {
  pageName: string;
}

export function ComingSoon({ pageName }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg shadow-lg bg-card">
      <Construction className="w-16 h-16 mb-6 text-primary" />
      <h2 className="text-3xl font-bold mb-2">Properament!</h2>
      <p className="text-lg text-muted-foreground">
        La pàgina de <span className="font-semibold text-foreground">{pageName}</span> està en construcció.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">Estem treballant per oferir-te la millor experiència. Torna aviat!</p>
    </div>
  );
}
