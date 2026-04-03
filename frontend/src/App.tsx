import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./state/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { JobTrackerPage } from "./pages/JobTrackerPage";
import { ResumeAnalyzerPage } from "./pages/ResumeAnalyzerPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { InterviewPrepPage } from "./pages/InterviewPrepPage";
import { ProfilePage } from "./pages/ProfilePage";

function Protected({ children }: { children: React.ReactElement }) { const { token } = useAuth(); return token ? children : <Navigate to="/login" replace />; }

export default function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/" element={<Protected><AppLayout /></Protected>}>
      <Route index element={<DashboardPage />} /><Route path="jobs" element={<JobTrackerPage />} /><Route path="resume" element={<ResumeAnalyzerPage />} /><Route path="analytics" element={<AnalyticsPage />} /><Route path="interview-prep" element={<InterviewPrepPage />} /><Route path="profile" element={<ProfilePage />} />
    </Route>
  </Routes>;
}
