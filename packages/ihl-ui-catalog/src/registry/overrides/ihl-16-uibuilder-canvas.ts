import { createBuilderPart } from "../../components/features/_shared/BuilderParts";
import type { CatalogComponent } from "../overrides.types";

/** @owner 16 — UI builder O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-16-uibuilder-canvas__BuilderShell": createBuilderPart("BuilderShell", "ihl-16-uibuilder-canvas__BuilderShell"),
  "ihl-16-uibuilder-canvas__CanvasDropZone": createBuilderPart("CanvasDropZone", "ihl-16-uibuilder-canvas__CanvasDropZone"),
  "ihl-16-uibuilder-canvas__LintPanel": createBuilderPart("LintPanel", "ihl-16-uibuilder-canvas__LintPanel"),
  "ihl-16-uibuilder-canvas__PartsPalette": createBuilderPart("PartsPalette", "ihl-16-uibuilder-canvas__PartsPalette"),
  "ihl-16-uibuilder-canvas__SaveBar": createBuilderPart("SaveBar", "ihl-16-uibuilder-canvas__SaveBar"),
};
