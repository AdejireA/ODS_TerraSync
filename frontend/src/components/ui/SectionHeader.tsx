import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-section-heading text-primary">{title}</h3>
      {action}
    </div>
  );
}
