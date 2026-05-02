const SectionSymbol = ({ className = "" }: { className?: string }) => (
  <span
    className={`pointer-events-none select-none font-barlow font-extrabold text-gold opacity-[0.05] ${className}`}
    aria-hidden="true"
  >
    §
  </span>
);

export default SectionSymbol;
