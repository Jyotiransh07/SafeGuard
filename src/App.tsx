import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Emergency from './pages/Emergency';
import Contacts from './pages/Contacts';
import LocationPage from './pages/Location';
import History from './pages/History';
import Accessibility from './pages/Accessibility';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { EmergencyProvider } from './context/EmergencyContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <EmergencyProvider>
          <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/location" element={<LocationPage />} />
              <Route path="/history" element={<History />} />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </EmergencyProvider>
    </AccessibilityProvider>
  </AuthProvider>
  );
}

export default App;