"use client";
import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";

export interface DockItem {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}

export const FloatingDock = ({
  items,
  className,
}: {
  items: DockItem[];
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto flex h-16 items-end gap-3 rounded-2xl border border-border bg-white/90 px-4 pb-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  onClick,
  active,
}: DockItem & { mouseX: MotionValue }) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 64, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 64, 40]);
  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [18, 28, 18]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [18, 28, 18]);

  const springCfg = { mass: 0.1, stiffness: 150, damping: 12 };
  const width = useSpring(widthTransform, springCfg);
  const height = useSpring(heightTransform, springCfg);
  const widthIcon = useSpring(widthTransformIcon, springCfg);
  const heightIcon = useSpring(heightTransformIcon, springCfg);

  const [hovered, setHovered] = useState(false);

  return (
    <button type="button" onClick={onClick} aria-label={title}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative flex aspect-square items-center justify-center rounded-full transition-colors",
          active ? "bg-primary text-primary-foreground" : "bg-usl-gray text-foreground"
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 6, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 4, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit whitespace-pre rounded-md border border-border bg-white px-2 py-0.5 text-xs font-medium text-foreground shadow-sm"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div style={{ width: widthIcon, height: heightIcon }} className="flex items-center justify-center">
          {icon}
        </motion.div>
        {active && (
          <span className="absolute -bottom-2.5 h-1 w-1 rounded-full bg-primary" aria-hidden="true" />
        )}
      </motion.div>
    </button>
  );
}
