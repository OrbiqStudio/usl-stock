import { UslLogo } from "@/components/UslLogo";

/** Écran de veille : fond blanc uni avec le logo du club en grand. Un toucher réveille l'app. */
export function IdleOverlay({ onWake }: { onWake: () => void }) {
  const size = Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.7);

  return (
    <div
      onClick={onWake}
      onTouchStart={onWake}
      className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-white"
    >
      <UslLogo size={size} />
    </div>
  );
}
