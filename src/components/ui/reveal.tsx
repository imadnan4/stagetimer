"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number; // Delay in milliseconds
  duration?: number; // Duration in milliseconds
  y?: number; // Initial translateY distance in pixels
  blur?: number; // Initial blur in pixels
  as?: ElementType;
  once?: boolean;
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 800,
  y = 20,
  blur = 6,
  as: Component = "div",
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if element is already within viewport on initial load/refresh
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <Component
      ref={ref}
      className={`scroll-reveal ${inView ? "is-visible" : ""} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
        ...(!inView && {
          transform: `translate3d(0, ${y}px, 0)`,
          filter: `blur(${blur}px)`,
        }),
      }}
    >
      {children}
    </Component>
  );
}
