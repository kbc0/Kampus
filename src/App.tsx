import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { ProfilePage } from './pages/ProfilePage';
import { UserProfilePage } from './pages/UserProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { MessagesPage } from './components/messages/MessagesPage';
import { LandingPage } from './pages/LandingPage';
import { ForumPage } from './pages/ForumPage';
import { TopicPage } from './pages/TopicPage';
import { NewTopicPage } from './pages/NewTopicPage';
import { MatchesPage } from './pages/MatchesPage';
import { StartHubPage } from './pages/StartHubPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminDashboard } from './components/forum/admin/AdminDashboard';
import { BannedPage } from './pages/BannedPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/banned" element={<BannedPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:conversationId" element={<MessagesPage />} />
            <Route path="/messages/group/:groupId" element={<MessagesPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/forum/topic/:topicId" element={<TopicPage />} />
            <Route path="/forum/new" element={<NewTopicPage />} />
            <Route path="/starthub" element={<StartHubPage />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}