import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { MedicalProvider } from './contexts/MedicalContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import HealthProfile from './pages/HealthProfile';
import Pharmacy from './pages/Pharmacy';
import ReportAnalysis from './pages/ReportAnalysis';
import Chat from './pages/Chat';
import Wellness from './pages/Wellness';

// New/Refactored Pages
import Feedback from './pages/Feedback';
import MedicalSearchPage from './pages/MedicalSearchPage';
import ClaimsDetector from './pages/ClaimsDetector';
import Symptoms from './pages/Symptoms';
import Conditions from './pages/Conditions';
import Emergency from './pages/Emergency';
import Hospitals from './pages/Hospitals';
import Doctors from './pages/Doctors';
import Appointment from './pages/Appointment';
import SymptomBodyMap from './pages/SymptomBodyMap';
import TestUpload from './pages/TestUpload';
import Prescriptions from './pages/Prescriptions';
import MyAppointments from './pages/MyAppointments';

import RequireAuth from './components/layout/RequireAuth';

import { AnimatePresence } from 'framer-motion';

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Global Layout */}
        <Route element={<AppLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/scan-medicine" element={<MedicalSearchPage />} />
          <Route path="/conditions" element={<Conditions />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/body-map" element={<SymptomBodyMap />} />
          <Route path="/test-upload" element={<TestUpload />} />

          {/* Protected Routes */}
          <Route element={<RequireAuth />}>
            <Route path="/reports" element={<ReportAnalysis />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/claims" element={<ClaimsDetector />} />
            <Route path="/symptoms" element={<Symptoms />} />
            <Route path="/wellness" element={<Wellness />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/health-profile" element={<HealthProfile />} />
            <Route path="/settings" element={<Feedback />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
          </Route>

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider>
        <NotificationProvider>
          <AuthProvider>
            <ThemeProvider>
              <LanguageProvider>
                <MedicalProvider>
                  <Router>
                    <AppRoutes />
                    <Toaster
                      position="bottom-center"
                      containerStyle={{ pointerEvents: 'none' }}
                      toastOptions={{
                        duration: 3000,
                        style: { background: '#333', color: '#fff', pointerEvents: 'auto' }
                      }}
                    />
                  </Router>
                </MedicalProvider>
              </LanguageProvider>
            </ThemeProvider>
          </AuthProvider>
        </NotificationProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
