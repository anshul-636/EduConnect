import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import OAuthCallback from './pages/auth/OAuthCallback';
import { AdminDashboard, SchoolDashboard, TeacherDashboard, StudentDashboard } from './pages/dashboard/index';
import SchoolManage from './pages/dashboard/SchoolManage';
import Schools from './pages/Schools';
import SchoolDetail from './pages/SchoolDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import Resources from './pages/Resources';
import ResourceDetail from './pages/ResourceDetail';
import UploadResource from './pages/UploadResource';
import Leaderboard from './pages/Leaderboard';
import EventLeaderboard from './pages/EventLeaderboard';
import Certificates from './pages/Certificates';
import Forum from './pages/Forum';
import ForumPost from './pages/ForumPost';
import Unauthorized from './pages/Unauthorized';
import StudyAssistant from './pages/ai/StudyAssistant';
import PlatformBot from './pages/ai/PlatformBot';
import StudyPlanner from './pages/ai/StudyPlanner';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<Navigate to='/login' replace />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/verify-email' element={<VerifyEmail />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/auth/callback' element={<OAuthCallback />} />
      <Route path='/unauthorized' element={<Unauthorized />} />

      <Route path='/schools' element={<ProtectedRoute><Schools /></ProtectedRoute>} />
      <Route path='/schools/:id' element={<ProtectedRoute><SchoolDetail /></ProtectedRoute>} />
      <Route path='/events' element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path='/events/create' element={<ProtectedRoute><RoleRoute roles={['SCHOOL']}><CreateEvent /></RoleRoute></ProtectedRoute>} />
      <Route path='/events/:id' element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
      <Route path='/resources' element={<ProtectedRoute><Resources /></ProtectedRoute>} />
      <Route path='/resources/upload' element={<ProtectedRoute><RoleRoute roles={['SCHOOL','TEACHER']}><UploadResource /></RoleRoute></ProtectedRoute>} />
      <Route path='/resources/:id' element={<ProtectedRoute><ResourceDetail /></ProtectedRoute>} />
      <Route path='/leaderboard' element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      <Route path='/leaderboard/:eventId' element={<ProtectedRoute><EventLeaderboard /></ProtectedRoute>} />
      <Route path='/certificates' element={<ProtectedRoute><RoleRoute roles={['STUDENT']}><Certificates /></RoleRoute></ProtectedRoute>} />
      <Route path='/forum' element={<ProtectedRoute><Forum /></ProtectedRoute>} />
      <Route path='/forum/:id' element={<ProtectedRoute><ForumPost /></ProtectedRoute>} />

      <Route path='/ai/study' element={<ProtectedRoute><StudyAssistant /></ProtectedRoute>} />
      <Route path='/ai/bot' element={<ProtectedRoute><PlatformBot /></ProtectedRoute>} />
      <Route path='/ai/planner' element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />

      <Route path='/dashboard/student' element={<ProtectedRoute><RoleRoute roles={['STUDENT']}><StudentDashboard /></RoleRoute></ProtectedRoute>} />
      <Route path='/dashboard/teacher' element={<ProtectedRoute><RoleRoute roles={['TEACHER']}><TeacherDashboard /></RoleRoute></ProtectedRoute>} />
      <Route path='/dashboard/school' element={<ProtectedRoute><RoleRoute roles={['SCHOOL']}><SchoolDashboard /></RoleRoute></ProtectedRoute>} />
      <Route path='/dashboard/school/manage' element={<ProtectedRoute><RoleRoute roles={['SCHOOL']}><SchoolManage /></RoleRoute></ProtectedRoute>} />
      <Route path='/dashboard/admin' element={<ProtectedRoute><RoleRoute roles={['ADMIN']}><AdminDashboard /></RoleRoute></ProtectedRoute>} />
      <Route path='*' element={<Navigate to='/login' replace />} />
    </Routes>
  </BrowserRouter>
);
export default App;
