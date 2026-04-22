import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface BackButtonProps {
  className?: string;
  label?: string;
  fallbackPath?: string;
}

const BackButton = ({ className = "", label = "Back", fallbackPath = "/" }: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // idx > 0 means there's an in-app history entry to go back to
    const idx = (location as { key?: string; state?: unknown } & { idx?: number }).idx
      ?? (window.history.state && (window.history.state as { idx?: number }).idx)
      ?? 0;

    if (idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath, { replace: true });
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors mb-6 group ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
