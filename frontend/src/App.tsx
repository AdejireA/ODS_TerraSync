import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { FarmProvider } from "./contexts/FarmContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AppShell } from "./components/layout/AppShell";
import { Landing } from "./pages/Landing";
import { Onboarding } from "./pages/Onboarding";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { CropDetail } from "./pages/CropDetail";
import { ReportForm } from "./pages/ReportForm";
import { Board } from "./pages/Board";
import { Voice } from "./pages/Voice";
import { Settings } from "./pages/Settings";
import { Knowledge } from "./pages/Knowledge";
import { Tasks } from "./pages/Tasks";
import { More } from "./pages/More";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <FarmProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/login" element={<Login />} />
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/crops/:cropId" element={<CropDetail />} />
                <Route path="/harvest/report" element={<ReportForm />} />
                <Route path="/harvest/board" element={<Board />} />
                <Route path="/voice" element={<Voice />} />
                <Route path="/knowledge" element={<Knowledge />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/more" element={<More />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </FarmProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
