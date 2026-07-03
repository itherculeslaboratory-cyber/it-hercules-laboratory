import type { ComposedPart, ScreenDef, ScreensData } from "./types";
import screensJson from "../data/screens.json";
import partsJson from "../data/composed-parts.json";

export const screensData = screensJson as ScreensData;
export const composedParts = partsJson as ComposedPart[];

export function getScreen(id: string): ScreenDef | undefined {
  return screensData.screens[id];
}

export function listScreens(): ScreenDef[] {
  return Object.values(screensData.screens);
}

export function groupScreens(): Record<string, ScreenDef[]> {
  const groups: Record<string, ScreenDef[]> = {};
  for (const s of listScreens()) {
    if (!groups[s.group]) groups[s.group] = [];
    groups[s.group].push(s);
  }
  return groups;
}

export function partsForMock(mockFile: string): ComposedPart[] {
  return composedParts.filter((p) => p.mock_file === mockFile);
}

export function mockFileFromScreen(screen: ScreenDef): string | null {
  const m = screen.mock.match(/\/([^/]+\.png)$/);
  return m?.[1] ?? null;
}

export function partsForScreen(screen: ScreenDef): ComposedPart[] {
  const mock = mockFileFromScreen(screen);
  return mock ? partsForMock(mock) : [];
}
