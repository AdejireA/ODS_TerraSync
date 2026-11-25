import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
}

export function FeatureCard({ icon: Icon, title, description, onClick, disabled, badge }: FeatureCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-full w-full flex-col gap-2 rounded-lg border border-border bg-card p-4 text-left shadow-[var(--shadow-card)] transition hover:border-secondary disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-light text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        {badge && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
}
