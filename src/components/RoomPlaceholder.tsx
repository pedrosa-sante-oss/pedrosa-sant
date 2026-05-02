const RoomPlaceholder = ({ label }: { label?: string }) => (
  <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-surface overflow-hidden">
    <span className="font-barlow font-extrabold text-[8rem] md:text-[12rem] text-gold opacity-[0.06] absolute">§</span>
    {label && <span className="relative z-10 text-xs text-muted-foreground font-inter">{label}</span>}
  </div>
);

export default RoomPlaceholder;
