import { useCallback, useEffect, useRef, useState } from "react";
import type { Hotspot } from "../lib/types";

type HotspotOverlayProps = {
  hotspots: Hotspot[];
  showHotspots: boolean;
  showLabels: boolean;
  onNavigate: (targetId: string) => void;
  mockSrc: string;
};

export function HotspotOverlay({
  hotspots,
  showHotspots,
  showLabels,
  onNavigate,
  mockSrc,
}: HotspotOverlayProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0, top: 0, left: 0 });

  const layout = useCallback(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img || !img.complete) return;
    const wrapRect = wrap.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    setBox({
      width: imgRect.width,
      height: imgRect.height,
      top: imgRect.top - wrapRect.top + wrap.scrollTop,
      left: imgRect.left - wrapRect.left,
    });
  }, []);

  useEffect(() => {
    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, [layout, mockSrc]);

  if (!showHotspots) {
    return (
      <div ref={wrapRef} style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
        <img ref={imgRef} className="mock" src={mockSrc} alt="" onLoad={layout} />
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
      <img ref={imgRef} className="mock" src={mockSrc} alt="" onLoad={layout} />
      <div
        className={`hotspot-layer${showLabels ? " show-labels" : ""}`}
        style={{
          width: box.width,
          height: box.height,
          top: box.top,
          left: box.left,
          position: "absolute",
        }}
      >
        {hotspots.map((z, i) => (
          <button
            key={`${z.target}-${i}`}
            type="button"
            className="zone"
            title={z.stub ? "(stub)" : z.label}
            style={{ left: `${z.x}%`, top: `${z.y}%`, width: `${z.w}%`, height: `${z.h}%` }}
            onClick={() => onNavigate(z.target)}
          >
            <span>{z.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
