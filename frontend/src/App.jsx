import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home/Home';
import { Login } from './pages/Login/Login';
import { Signup } from './pages/Signup/Signup';
import { EventListing } from './pages/EventListing/EventListing';
import { EventDetail } from './pages/EventDetail/EventDetail';
import { Profile } from './pages/Profile/Profile';

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
          {/* Future routes will be added here */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
