import { useState } from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

const PEEK_ROTATE = [-10, 0, 10];
const PEEK_TRANSLATE = [-26, 0, 26];

/** A blue 3D folder (à la macOS) that tilts open on hover, peeking up to 3 item photos. */
export function AnimatedFolder({
  icon,
  previewImages = [],
  className,
}: {
  icon: React.ReactNode;
  previewImages?: (string | null)[];
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const peeks = previewImages.slice(0, 3);

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ height: 88, width: 120, perspective: 800 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* back panel */}
      <div
        className="absolute h-14 w-20 rounded-lg bg-usl-blue-dark"
        style={{
          transformOrigin: "bottom center",
          transform: hovered ? "rotateX(-15deg)" : "rotateX(0deg)",
          transition: "transform 420ms cubic-bezier(0.34,1.56,0.64,1)",
          zIndex: 10,
        }}
      />
      {/* tab */}
      <div
        className="absolute h-3 w-8 rounded-t-md bg-usl-blue-dark"
        style={{
          top: "calc(50% - 28px - 9px)",
          left: "calc(50% - 40px + 10px)",
          transformOrigin: "bottom center",
          transform: hovered ? "rotateX(-25deg) translateY(-2px)" : "rotateX(0deg)",
          transition: "transform 420ms cubic-bezier(0.34,1.56,0.64,1)",
          zIndex: 10,
        }}
      />

      {/* peeking previews */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 20 }}>
        {peeks.map((src, i) => (
          <div
            key={i}
            className="absolute h-11 w-9 overflow-hidden rounded-md border-2 border-white bg-usl-gray shadow-md"
            style={{
              left: -18,
              top: -22,
              transform: hovered
                ? `translateY(-46px) translateX(${PEEK_TRANSLATE[i]}px) rotate(${PEEK_ROTATE[i]}deg) scale(1)`
                : "translateY(0) scale(0.5)",
              opacity: hovered ? 1 : 0,
              transition: `all 480ms cubic-bezier(0.34,1.56,0.64,1) ${i * 70}ms`,
              zIndex: 10 - i,
            }}
          >
            {src ? (
              <img src={src} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-usl-gray-dark">
                <Package className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* front panel */}
      <div
        className="absolute h-14 w-20 rounded-lg bg-primary"
        style={{
          top: "calc(50% - 28px + 3px)",
          transformOrigin: "bottom center",
          transform: hovered ? "rotateX(20deg) translateY(6px)" : "rotateX(0deg)",
          transition: "transform 420ms cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: "0 6px 16px rgba(0,61,165,0.28)",
          zIndex: 30,
        }}
      />
      {/* shine */}
      <div
        className="pointer-events-none absolute h-14 w-20 overflow-hidden rounded-lg"
        style={{
          top: "calc(50% - 28px + 3px)",
          background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 55%)",
          transformOrigin: "bottom center",
          transform: hovered ? "rotateX(20deg) translateY(6px)" : "rotateX(0deg)",
          transition: "transform 420ms cubic-bezier(0.34,1.56,0.64,1)",
          zIndex: 31,
        }}
      />
      {/* category icon on the folder face */}
      <div
        className="absolute flex items-center justify-center text-primary-foreground"
        style={{
          top: "calc(50% - 28px + 3px)",
          height: 56,
          width: 80,
          transformOrigin: "bottom center",
          transform: hovered ? "rotateX(20deg) translateY(6px)" : "rotateX(0deg)",
          transition: "transform 420ms cubic-bezier(0.34,1.56,0.64,1)",
          opacity: hovered ? 0 : 1,
          zIndex: 32,
        }}
      >
        {icon}
      </div>
    </div>
  );
}
