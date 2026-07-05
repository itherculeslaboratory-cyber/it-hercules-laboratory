import type { ComponentType } from "react";
import { COMPONENT_OVERRIDES } from "./overrides";
import { GENERATED_CATALOG_MAP } from "../generated/catalog-map";
import type { W2ComponentProps } from "../types/w2";

export type CatalogComponent = ComponentType<W2ComponentProps>;

export function resolveCatalogComponent(componentId: string): CatalogComponent | null {
  return COMPONENT_OVERRIDES[componentId] ?? GENERATED_CATALOG_MAP[componentId] ?? null;
}

export function listCatalogIds(): string[] {
  const ids = new Set([...Object.keys(COMPONENT_OVERRIDES), ...Object.keys(GENERATED_CATALOG_MAP)]);
  return [...ids].sort();
}
