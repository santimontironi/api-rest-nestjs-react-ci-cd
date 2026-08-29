const GoBack = ({ label, onBack }: { label: string; onBack: () => void }) => {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-tertiary/60 outline-none transition-colors duration-150 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <i className="bi bi-arrow-left text-base" aria-hidden="true" />
      {label}
    </button>
  );
};

export default GoBack;
