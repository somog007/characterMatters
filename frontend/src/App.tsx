import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Services from './pages/Services';
import Team from './pages/Team';
import Contact from './pages/Contact';
import Products from './pages/Products';
import Videos from './pages/Videos';
import VideoDetail from './pages/VideoDetail';
import EBooks from './pages/EBooks';
import EBookDetail from './pages/EBookDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminManagement from './pages/AdminManagement';
import GalleryWithSearch from './pages/GalleryWithSearch';
import AnalyticsTracker from './components/AnalyticsTracker';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AnalyticsTracker />
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/team" element={<Team />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/products" element={<Products />} />
              <Route
                path="/videos"
                element={
                  <ProtectedRoute>
                    <Videos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/videos/:id"
                element={
                  <ProtectedRoute>
                    <VideoDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ebooks"
                element={<EBooks />}
              />
              <Route
                path="/ebooks/:id"
                element={
                  <ProtectedRoute>
                    <EBookDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gallery"
                element={
                  <ProtectedRoute>
                    <GalleryWithSearch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/manage"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;