import { UslLogo } from "@/components/UslLogo";

export function IdleOverlay({ onWake }: { onWake: () => void }) {
  return (
    <div
      onClick={onWake}
      onTouchStart={onWake}
      className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-white"
    >
      <UslLogo size={Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.6)} />
    </div>
  );
}
