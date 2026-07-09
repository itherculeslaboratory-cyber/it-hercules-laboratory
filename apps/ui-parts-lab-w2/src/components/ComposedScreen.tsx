import type { ScreenDef } from "../lib/types";
import { partsForScreen } from "../lib/catalog";
import { AppShell, ContentArea, PageHeader, PrimaryAction, StatePanel } from "./parts";
import { HotspotOverlay } from "./HotspotOverlay";

type ComposedScreenProps = {
  screen: ScreenDef;
  showHotspots: boolean;
  showLabels: boolean;
  onNavigate: (targetId: string) => void;
};

function primaryLabel(screen: ScreenDef): string {
  const first = screen.hotspots?.[0]?.label;
  if (first) return first.split("→")[0].trim();
  return "主アクション";
}

export function ComposedScreen({ screen, showHotspots, showLabels, onNavigate }: ComposedScreenProps) {
  const parts = partsForScreen(screen);
  const hotspots = screen.hotspots ?? [];
  const primaryTarget = hotspots[0]?.target;

  return (
    <AppShell>
      <PageHeader breadcrumb={screen.breadcrumb} title={screen.title} route={screen.route} />
      <div className="part-body">
        <PrimaryAction
          label={primaryLabel(screen)}
          onClick={() => {
            if (primaryTarget) onNavigate(primaryTarget);
          }}
        />
        <ContentArea>
          <HotspotOverlay
            mockSrc={screen.mock}
            hotspots={hotspots}
            showHotspots={showHotspots}
            showLabels={showLabels}
            onNavigate={onNavigate}
          />
        </ContentArea>
        <StatePanel parts={parts} screenId={screen.id} />
      </div>
    </AppShell>
  );
}
