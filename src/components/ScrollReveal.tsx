import { useEffect, useRef, type ReactNode, type HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "up" | "left" | "right" | "scale";
  stagger?: boolean;
  delay?: number;
}

const classMap = {
  up: "scroll-reveal",
  left: "scroll-reveal-left",
  right: "scroll-reveal-right",
  scale: "scroll-reveal-scale",
};

const ScrollReveal = ({ children, variant = "up", stagger, delay, className = "", ...rest }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) {
            setTimeout(() => el.classList.add("scroll-revealed"), delay);
          } else {
            el.classList.add("scroll-revealed");
          }
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const cls = stagger ? `stagger-children ${classMap[variant]}` : classMap[variant];

  return (
    <div ref={ref} className={`${cls} ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default ScrollReveal;
