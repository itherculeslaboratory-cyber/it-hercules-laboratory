"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface AuthenticatedImageProps {
  /** Relative API path, e.g. `/api/v1/observation/{id}/image`. */
  src: string;
  alt: string;
  className?: string;
  "data-testid"?: string;
}

/**
 * Loads observation blobs via authenticated fetch (X-IHL-Session).
 * Plain `<img src>` cannot send session headers on cross-origin api.it-hercules.uk.
 */
export function AuthenticatedImage({
  src,
  alt,
  className,
  "data-testid": testId,
}: AuthenticatedImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let blobUrl: string | null = null;
    setFailed(false);
    setObjectUrl(null);

    void api
      .fetchBlob(src)
      .then((url) => {
        if (!active) {
          URL.revokeObjectURL(url);
          return;
        }
        blobUrl = url;
        setObjectUrl(url);
      })
      .catch(() => {
        if (active) {
          setFailed(true);
        }
      });

    return () => {
      active = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [src]);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center text-xs text-civ-muted ${className ?? ""}`}
        data-testid={testId ? `${testId}-error` : undefined}
        role="img"
        aria-label={alt}
      >
        写真を読み込めません
      </div>
    );
  }

  if (!objectUrl) {
    return (
      <div
        className={`flex items-center justify-center text-xs text-civ-muted ${className ?? ""}`}
        data-testid={testId ? `${testId}-loading` : undefined}
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={objectUrl} alt={alt} className={className} data-testid={testId} />
  );
}
