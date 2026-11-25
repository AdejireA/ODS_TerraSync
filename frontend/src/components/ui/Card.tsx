import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card)] ${className}`}
      {...props}
    />
  );
}
