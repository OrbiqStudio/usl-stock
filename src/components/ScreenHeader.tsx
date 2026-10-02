import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  className?: string;
}

export function ScreenHeader({ title, subtitle, onBack, right, className }: ScreenHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className={cn("flex items-center gap-4 bg-white px-6 py-5", className)}>
      <button
        onClick={onBack ?? (() => navigate(-1))}
        aria-label="Retour"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-usl-gray-dark transition-colors hover:bg-usl-gray hover:text-primary"
      >
        <ArrowLeft strokeWidth={1.5} className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
