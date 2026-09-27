import { UslLogo } from "@/components/UslLogo";
import { useVeilleVideoUrl } from "@/hooks/useVeilleVideo";

export function IdleOverlay({ onWake }: { onWake: () => void }) {
  const videoUrl = useVeilleVideoUrl();

  return (
    <div
      onClick={onWake}
      onTouchStart={onWake}
      className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center gap-6 bg-usl-blue-dark text-white"
    >
      {videoUrl ? (
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_60%)]" />
          <div className="relative flex flex-col items-center gap-6 animate-pulse">
            <UslLogo size={120} className="bg-white text-primary" />
            <p className="text-2xl font-bold">Touchez l'écran pour continuer</p>
          </div>
        </>
      )}
    </div>
  );
}
