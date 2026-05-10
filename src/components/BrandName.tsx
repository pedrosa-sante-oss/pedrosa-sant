import { cn } from "@/lib/utils";

interface BrandNameProps {
  variant?: "inline" | "stacked";
  className?: string;
}

const BrandName = ({ variant = "inline", className }: BrandNameProps) => {
  if (variant === "stacked") {
    return (
      <span
        aria-label="Pedrosa Santé"
        className={cn(
          "inline-flex flex-col items-center font-display uppercase leading-[0.95] tracking-[0.2em]",
          className
        )}
      >
        <span>PEDROSA</span>
        <span aria-hidden="true" className="my-1 block h-px w-8 bg-current opacity-70" />
        <span>SANTÉ</span>
      </span>
    );
  }

  return (
    <span
      aria-label="Pedrosa Santé"
      className={cn("font-display uppercase tracking-[0.15em] whitespace-nowrap", className)}
    >
      PEDROSA <span aria-hidden="true">—</span> SANTÉ
    </span>
  );
};

export default BrandName;
