import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Campaign } from './pages/Campaign';
import { CampaignForm } from './pages/CampaignForm';
import { Analytics } from './pages/Analytics';
import { AIMonitor } from './pages/AIMonitor';
import { Creative } from './pages/Creative';
import { Team } from './pages/Team';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout currentPage="/">
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/campaign" element={
            <ProtectedRoute>
              <Layout currentPage="/campaign">
                <Campaign />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/campaign/new" element={
            <ProtectedRoute>
              <Layout currentPage="/campaign">
                <CampaignForm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/campaign/:id/edit" element={
            <ProtectedRoute>
              <Layout currentPage="/campaign">
                <CampaignForm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout currentPage="/analytics">
                <Analytics />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/ai-monitor" element={
            <ProtectedRoute>
              <Layout currentPage="/ai-monitor">
                <AIMonitor />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/creative" element={
            <ProtectedRoute>
              <Layout currentPage="/creative">
                <Creative />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/team" element={
            <ProtectedRoute>
              <Layout currentPage="/team">
                <Team />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;