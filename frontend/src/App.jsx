import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home/Home';
import { Login } from './pages/Login/Login';
import { Signup } from './pages/Signup/Signup';
import { EventListing } from './pages/EventListing/EventListing';
import { EventDetail } from './pages/EventDetail/EventDetail';
import { Profile } from './pages/Profile/Profile';
import { Results } from './pages/Results/Results';
import { CollegeDashboard } from './pages/CollegeDashboard/CollegeDashboard';
import { CreateEvent } from './pages/CreateEvent/CreateEvent';
import { ManageRegistrations } from './pages/ManageRegistrations/ManageRegistrations';
import { PublishResults } from './pages/PublishResults/PublishResults';
import { AdminUsersList } from './pages/Admin/AdminUsersList';
import { AdminUserDetail } from './pages/Admin/AdminUserDetail';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AdminCreateEvent } from './pages/Admin/AdminCreateEvent';
import { AdminRegistrations } from './pages/Admin/AdminRegistrations';
import { AdminPublishResults } from './pages/Admin/AdminPublishResults';
import { AdminCollegesList } from './pages/Admin/AdminCollegesList';
import { AdminCollegeCreate } from './pages/Admin/AdminCollegeCreate';
import { StudentRegistrations } from './pages/StudentRegistrations/StudentRegistrations';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/events" element={<EventListing />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/me" element={<Profile />} />
          <Route path="/results" element={<Results />} />
          
          <Route path="/student/registrations" element={<StudentRegistrations />} />

          <Route path="/college/dashboard" element={<CollegeDashboard />} />
          <Route path="/college/events/new" element={<CreateEvent />} />
          <Route path="/college/registrations" element={<ManageRegistrations />} />
          <Route path="/college/results/new" element={<PublishResults />} />

          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersList />} />
          <Route path="/admin/users/:id" element={<AdminUserDetail />} />
          <Route path="/admin/events/new" element={<AdminCreateEvent />} />
          <Route path="/admin/registrations" element={<AdminRegistrations />} />
          <Route path="/admin/results/new" element={<AdminPublishResults />} />
          <Route path="/admin/colleges" element={<AdminCollegesList />} />
          <Route path="/admin/colleges/new" element={<AdminCollegeCreate />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

