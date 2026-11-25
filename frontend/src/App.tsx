import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { FarmProvider } from "./contexts/FarmContext";
import { AppShell } from "./components/layout/AppShell";
import { Landing } from "./pages/Landing";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { CropDetail } from "./pages/CropDetail";
import { ReportForm } from "./pages/ReportForm";
import { Board } from "./pages/Board";
import { Voice } from "./pages/Voice";

export default function App() {
  return (
    <LanguageProvider>
      <FarmProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/crops/:cropId" element={<CropDetail />} />
              <Route path="/harvest/report" element={<ReportForm />} />
              <Route path="/harvest/board" element={<Board />} />
              <Route path="/voice" element={<Voice />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FarmProvider>
    </LanguageProvider>
  );
}
