import { useState } from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Displays public/logo-club.png (dropped in by the club, transparent PNG)
 * if present, falling back to a generic shield icon otherwise.
 */
export function UslLogo({ size = 72, className }: { size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <img
        src="./logo-club.png"
        alt="Logo du club"
        onError={() => setFailed(true)}
        className={cn("object-contain", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary text-primary-foreground",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Shield strokeWidth={1.5} style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
}
