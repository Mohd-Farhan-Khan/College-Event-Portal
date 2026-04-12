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
          
          <Route path="/college/dashboard" element={<CollegeDashboard />} />
          <Route path="/college/events/new" element={<CreateEvent />} />
          <Route path="/college/registrations" element={<ManageRegistrations />} />
          <Route path="/college/results/new" element={<PublishResults />} />
          {/* Future routes will be added here */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
