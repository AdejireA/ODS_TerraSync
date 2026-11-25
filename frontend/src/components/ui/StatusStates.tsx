import type { ReactNode } from "react";
import { Card } from "./Card";

export function LoadingState({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground">{label}</p>;
}

export function ErrorState({ label }: { label: string }) {
  return (
    <Card className="border-destructive bg-destructive-surface text-destructive">
      <p className="text-sm">{label}</p>
    </Card>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <Card className="bg-muted text-muted-foreground">
      <p className="text-sm">{label}</p>
    </Card>
  );
}

// Used for dashboard modules whose backend endpoint is not implemented yet.
// Makes the gap visible instead of showing fabricated data.
export function NotAvailableState({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <Card className="border-dashed bg-muted/50 text-muted-foreground">
      <p className="text-sm">{label}</p>
      {children}
    </Card>
  );
}
