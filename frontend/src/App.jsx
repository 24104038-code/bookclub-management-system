import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import RoleProtectedRoute from './components/RoleProtectedRoute';

// Public & Auth Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyCertificate from './pages/VerifyCertificate';

// Core Protected Pages
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Library from './pages/Library';
import ReadingProgress from './pages/ReadingProgress';
import ReadingGoals from './pages/ReadingGoals';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Challenges from './pages/Challenges';
import ChallengeDetails from './pages/ChallengeDetails';
import Competitions from './pages/Competitions';
import CompetitionDetails from './pages/CompetitionDetails';
import Discussions from './pages/Discussions';
import DiscussionDetails from './pages/DiscussionDetails';
import Profile from './pages/Profile';
import Achievements from './pages/Achievements';
import Activity from './pages/Activity';
import Calendar from './pages/Calendar';
import Highlights from './pages/Highlights';
import Journal from './pages/Journal';
import Leaderboards from './pages/Leaderboards';
import Messages from './pages/Messages';
import Notes from './pages/Notes';
import Notifications from './pages/Notifications';
import Recommendations from './pages/Recommendations';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';

// Role-Protected Management Pages
import AdminDashboard from './pages/AdminDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import Reports from './pages/Reports';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/index.html" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login.html" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register.html" element={<Register />} />
      <Route path="/verify-certificate" element={<VerifyCertificate />} />
      <Route path="/verify-certificate.html" element={<VerifyCertificate />} />

      {/* Main Application Layout (Protected) */}
      <Route element={<AppLayout />}>
        {/* Core Member Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard.html" element={<Dashboard />} />

        <Route path="/books" element={<Books />} />
        <Route path="/books.html" element={<Books />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/book-details" element={<BookDetails />} />
        <Route path="/book-details.html" element={<BookDetails />} />

        <Route path="/library" element={<Library />} />
        <Route path="/library.html" element={<Library />} />

        <Route path="/reading-progress" element={<ReadingProgress />} />
        <Route path="/reading-progress.html" element={<ReadingProgress />} />

        <Route path="/reading-goals" element={<ReadingGoals />} />
        <Route path="/reading-goals.html" element={<ReadingGoals />} />

        <Route path="/groups" element={<Groups />} />
        <Route path="/groups.html" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetails />} />
        <Route path="/group-details" element={<GroupDetails />} />
        <Route path="/group-details.html" element={<GroupDetails />} />

        <Route path="/events" element={<Events />} />
        <Route path="/events.html" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/event-details" element={<EventDetails />} />
        <Route path="/event-details.html" element={<EventDetails />} />

        <Route path="/challenges" element={<Challenges />} />
        <Route path="/challenges.html" element={<Challenges />} />
        <Route path="/challenges/:id" element={<ChallengeDetails />} />
        <Route path="/challenge-details" element={<ChallengeDetails />} />
        <Route path="/challenge-details.html" element={<ChallengeDetails />} />

        <Route path="/competitions" element={<Competitions />} />
        <Route path="/competitions.html" element={<Competitions />} />
        <Route path="/competitions/:id" element={<CompetitionDetails />} />
        <Route path="/competition-details" element={<CompetitionDetails />} />
        <Route path="/competition-details.html" element={<CompetitionDetails />} />

        <Route path="/discussions" element={<Discussions />} />
        <Route path="/discussions.html" element={<Discussions />} />
        <Route path="/discussions/:id" element={<DiscussionDetails />} />
        <Route path="/discussion-details" element={<DiscussionDetails />} />
        <Route path="/discussion-details.html" element={<DiscussionDetails />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/profile.html" element={<Profile />} />

        <Route path="/achievements" element={<Achievements />} />
        <Route path="/achievements.html" element={<Achievements />} />

        <Route path="/activity" element={<Activity />} />
        <Route path="/activity.html" element={<Activity />} />

        <Route path="/calendar" element={<Calendar />} />
        <Route path="/calendar.html" element={<Calendar />} />

        <Route path="/highlights" element={<Highlights />} />
        <Route path="/highlights.html" element={<Highlights />} />

        <Route path="/journal" element={<Journal />} />
        <Route path="/journal.html" element={<Journal />} />

        <Route path="/leaderboards" element={<Leaderboards />} />
        <Route path="/leaderboards.html" element={<Leaderboards />} />

        <Route path="/messages" element={<Messages />} />
        <Route path="/messages.html" element={<Messages />} />

        <Route path="/notes" element={<Notes />} />
        <Route path="/notes.html" element={<Notes />} />

        <Route path="/notifications" element={<Notifications />} />
        <Route path="/notifications.html" element={<Notifications />} />

        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/recommendations.html" element={<Recommendations />} />

        <Route path="/reviews" element={<Reviews />} />
        <Route path="/reviews.html" element={<Reviews />} />

        <Route path="/settings" element={<Settings />} />
        <Route path="/settings.html" element={<Settings />} />

        {/* Admin Management (Admin Only) */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard.html"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Organizer Management (Organizer & Admin) */}
        <Route
          path="/organizer"
          element={
            <RoleProtectedRoute allowedRoles={['admin', 'organizer']}>
              <OrganizerDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/organizer-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['admin', 'organizer']}>
              <OrganizerDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/organizer-dashboard.html"
          element={
            <RoleProtectedRoute allowedRoles={['admin', 'organizer']}>
              <OrganizerDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Reports (Organizer & Admin) */}
        <Route
          path="/reports"
          element={
            <RoleProtectedRoute allowedRoles={['admin', 'organizer']}>
              <Reports />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports.html"
          element={
            <RoleProtectedRoute allowedRoles={['admin', 'organizer']}>
              <Reports />
            </RoleProtectedRoute>
          }
        />
      </Route>

      {/* Fallback to Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
