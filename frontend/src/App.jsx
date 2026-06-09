import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Auth
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboards
import { StudentDashboard, TeacherDashboard, SchoolDashboard, AdminDashboard } from './pages/dashboard/index';

// Core platform
import Events         from './pages/Events';
import EventDetail    from './pages/EventDetail';
import CreateEvent    from './pages/CreateEvent';
import Resources      from './pages/Resources';
import ResourceDetail from './pages/ResourceDetail';
import UploadResource from './pages/UploadResource';
import Leaderboard    from './pages/Leaderboard';
import Certificates   from './pages/Certificates';
import Forum          from './pages/Forum';
import ForumPost      from './pages/ForumPost';
import Schools        from './pages/Schools';
import SchoolDetail   from './pages/SchoolDetail';
import Settings       from './pages/dashboard/Settings';

// Academic features (new)
import Classes          from './pages/classes';
import ClassDetail      from './pages/classDetail';
import Timetable        from './pages/Timetable';
import Assignments      from './pages/assignments';
import AssignmentDetail from './pages/AssignmentDeatil';
import Attendance       from './pages/attendance';
import Announcements    from './pages/announcements';

// AI
import StudyBot    from './pages/ai/StudyAssistant';
import StudyPlanner from './pages/ai/StudyPlanner';
import PlatformBot from './pages/ai/PlatformBot';

// School admin
import ManageSchool from './pages/dashboard/SchoolManage';
import Notifications from './pages/Notifications';

const DASHBOARD = {
  ADMIN:   <AdminDashboard/>,
  SCHOOL:  <SchoolDashboard/>,
  TEACHER: <TeacherDashboard/>,
  STUDENT: <StudentDashboard/>,
};

const ProtectedRoute = ({ children }) => {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace/>;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, token } = useAuthStore();
  if (token && user) return <Navigate to={`/dashboard/${user.role.toLowerCase()}`} replace/>;
  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace/>;
  return <Navigate to={`/dashboard/${user.role.toLowerCase()}`} replace/>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<PublicRoute><Login/></PublicRoute>}/>
        <Route path="/register" element={<PublicRoute><Register/></PublicRoute>}/>

        {/* Dashboard redirect */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect/></ProtectedRoute>}/>

        {/* Role dashboards */}
        <Route path="/dashboard/student" element={<ProtectedRoute><StudentDashboard/></ProtectedRoute>}/>
        <Route path="/dashboard/teacher" element={<ProtectedRoute><TeacherDashboard/></ProtectedRoute>}/>
        <Route path="/dashboard/school"  element={<ProtectedRoute><SchoolDashboard/></ProtectedRoute>}/>
        <Route path="/dashboard/admin"   element={<ProtectedRoute><AdminDashboard/></ProtectedRoute>}/>
        <Route path="/dashboard/school/manage" element={<ProtectedRoute><ManageSchool/></ProtectedRoute>}/>

        {/* Core platform */}
        <Route path="/schools"           element={<ProtectedRoute><Schools/></ProtectedRoute>}/>
        <Route path="/schools/:id"       element={<ProtectedRoute><SchoolDetail/></ProtectedRoute>}/>
        <Route path="/events"            element={<ProtectedRoute><Events/></ProtectedRoute>}/>
        <Route path="/events/create"     element={<ProtectedRoute><CreateEvent/></ProtectedRoute>}/>
        <Route path="/events/:id"        element={<ProtectedRoute><EventDetail/></ProtectedRoute>}/>
        <Route path="/resources"         element={<ProtectedRoute><Resources/></ProtectedRoute>}/>
        <Route path="/resources/upload"  element={<ProtectedRoute><UploadResource/></ProtectedRoute>}/>
        <Route path="/resources/:id"     element={<ProtectedRoute><ResourceDetail/></ProtectedRoute>}/>
        <Route path="/leaderboard"       element={<ProtectedRoute><Leaderboard/></ProtectedRoute>}/>
        <Route path="/certificates"      element={<ProtectedRoute><Certificates/></ProtectedRoute>}/>
        <Route path="/forum"             element={<ProtectedRoute><Forum/></ProtectedRoute>}/>
        <Route path="/forum/:id"         element={<ProtectedRoute><ForumPost/></ProtectedRoute>}/>
        <Route path="/notifications"     element={<ProtectedRoute><Notifications/></ProtectedRoute>}/>
        <Route path="/settings"          element={<ProtectedRoute><Settings/></ProtectedRoute>}/>

        {/* Academic — new */}
        <Route path="/classes"           element={<ProtectedRoute><Classes/></ProtectedRoute>}/>
        <Route path="/classes/:id"       element={<ProtectedRoute><ClassDetail/></ProtectedRoute>}/>
        <Route path="/timetable"         element={<ProtectedRoute><Timetable/></ProtectedRoute>}/>
        <Route path="/assignments"       element={<ProtectedRoute><Assignments/></ProtectedRoute>}/>
        <Route path="/assignments/:id"   element={<ProtectedRoute><AssignmentDetail/></ProtectedRoute>}/>
        <Route path="/attendance"        element={<ProtectedRoute><Attendance/></ProtectedRoute>}/>
        <Route path="/announcements"     element={<ProtectedRoute><Announcements/></ProtectedRoute>}/>

        {/* AI */}
        <Route path="/ai/study"   element={<ProtectedRoute><StudyBot/></ProtectedRoute>}/>
        <Route path="/ai/planner" element={<ProtectedRoute><StudyPlanner/></ProtectedRoute>}/>
        <Route path="/ai/bot"     element={<ProtectedRoute><PlatformBot/></ProtectedRoute>}/>

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
        <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
      </Routes>
    </BrowserRouter>
  );
}
