import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type StateKind = "loading" | "empty" | "error";

interface StatePanelProps {
  kind: StateKind;
  title: string;
  description?: string;
  onRetry?: () => void;
}

export function StatePanel({ kind, title, description, onRetry }: StatePanelProps) {
  return (
    <Card className="text-center" role="status" aria-live="polite">
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
      {kind === "loading" ? (
        <p className="mt-4 text-civ-muted" aria-busy="true">
          読み込み中…
        </p>
      ) : null}
      {kind === "error" && onRetry ? (
        <div className="mt-4">
          <Button variant="secondary" onClick={onRetry}>
            再試行
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
