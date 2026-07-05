import { Navigate, Route, Routes } from "react-router-dom";
import { screensData } from "./lib/catalog";
import { ScreenPage } from "./pages/ScreenPage";
import { PartsCatalogPage } from "./pages/PartsCatalogPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/s/O1" replace />} />
      <Route path="/s/:screenId" element={<ScreenPage />} />
      <Route path="/parts" element={<PartsCatalogPage />} />
      <Route path="*" element={<Navigate to={`/s/${screensData.defaultScreen}`} replace />} />
    </Routes>
  );
}
