import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
    <div className={cn("flex items-center gap-4 border-b border-border bg-white px-6 py-4", className)}>
      <Button
        variant="secondary"
        size="icon"
        onClick={onBack ?? (() => navigate(-1))}
        aria-label="Retour"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold truncate">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
