import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Notification from './components/Notification';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import Recognition from './pages/Recognition';
import Library from './pages/Library';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import AuthPage from './pages/AuthPage';
import SubmissionPage from './pages/SubmissionPage';

function App() {
  const [notification, setNotification] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('viltrumite_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleNotify = (notify) => {
    setNotification(notify);
  };

  const handleLogout = () => {
    localStorage.removeItem('viltrumite_token');
    localStorage.removeItem('viltrumite_user');
    setUser(null);
    handleNotify({
      type: 'success',
      message: 'Logged out successfully',
      duration: 3000
    });
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    handleNotify({
      type: 'success',
      message: `Welcome back, ${userData.username}!`,
      duration: 3000
    });
  };

  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isLibraryPage = location.pathname === '/library';
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  return (
    <div className="min-h-screen relative selection:bg-[#ec4899] selection:text-white bg-[#0f172a]">
      {/* Background Ambience & Image */}
      {!isHomePage && !isLibraryPage && !isAuthPage && !['/about', '/faq', '/contact', '/recognize', '/submit'].includes(location.pathname) && (
        <div className="fixed inset-0 -z-20 bg-[#0f172a]">
          {/* Abstract Dark Tech Background */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2560&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/90 to-transparent"></div>
        </div>
      )}

      <Header user={user} onLogout={handleLogout} />
      <ScrollToTop />

      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recognize" element={<Recognition user={user} onNotify={handleNotify} />} />
          <Route path="/submit" element={user ? <SubmissionPage user={user} onNotify={handleNotify} /> : <Navigate to="/login" />} />
          <Route path="/library" element={<Library user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<AuthPage onAuthSuccess={handleAuthSuccess} onNotify={handleNotify} />} />
          <Route path="/signup" element={<AuthPage onAuthSuccess={handleAuthSuccess} onNotify={handleNotify} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Notifications / Toast */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}

export default App;
