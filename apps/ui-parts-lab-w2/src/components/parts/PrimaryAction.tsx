type PrimaryActionProps = {
  label: string;
  onClick?: () => void;
};

/** QUANTUM primitive · region PrimaryAction · max 1 per screen */
export function PrimaryAction({ label, onClick }: PrimaryActionProps) {
  return (
    <div className="part-primary-action" data-part="PrimaryAction">
      <button type="button" onClick={onClick}>
        {label}
      </button>
    </div>
  );
}
