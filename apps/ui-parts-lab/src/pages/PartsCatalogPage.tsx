import { Link } from "react-router-dom";
import { composedParts, groupScreens } from "../lib/catalog";
import { LabSidebar } from "../components/LabSidebar";
import { useState } from "react";

export function PartsCatalogPage() {
  const [showHotspots, setShowHotspots] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const screens = groupScreens();

  const byMock = new Map<string, typeof composedParts>();
  for (const p of composedParts) {
    const key = p.mock_file ?? "(unknown)";
    if (!byMock.has(key)) byMock.set(key, []);
    byMock.get(key)!.push(p);
  }

  return (
    <div className="lab-layout">
      <LabSidebar
        showHotspots={showHotspots}
        showLabels={showLabels}
        onToggleHotspots={setShowHotspots}
        onToggleLabels={setShowLabels}
      />
      <main className="lab-main catalog-page">
        <h2>QUANTUM composed-parts カタログ</h2>
        <p className="lab-meta">
          {composedParts.length} 部品 · {Object.values(screens).flat().length} 画面 · プリミティブ 5 種（AppShell ·
          PageHeader · PrimaryAction · ContentArea · StatePanel）
        </p>
        {[...byMock.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([mock, parts]) => {
            const screenId = Object.values(screens)
              .flat()
              .find((s) => s.mock.endsWith(mock))?.id;
            return (
              <section key={mock} className="catalog-mock-group">
                <h3>
                  {mock}{" "}
                  {screenId && (
                    <Link to={`/s/${screenId}`} style={{ fontSize: "0.85rem" }}>
                      → 画面打鍵
                    </Link>
                  )}
                </h3>
                <div className="catalog-grid">
                  {parts.map((p) => (
                    <article key={p.id} className="catalog-card">
                      <h4>{p.region}</h4>
                      <p className="meta">
                        {p.id}
                        <br />
                        reuse: {p.reuse} · {p.primitive}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
      </main>
    </div>
  );
}
