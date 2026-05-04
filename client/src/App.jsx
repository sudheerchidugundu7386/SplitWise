import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage.jsx";
import GroupDashboard from "./pages/GroupDashboard.jsx";
import LoginPage from "./pages/LoginPage.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // or a spinner
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

/**
 * App root: routes
 * - "/login" → Login/Register page
 * - "/" → Create group (protected)
 * - "/group/:groupId" → Group dashboard
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/group/:groupId" 
            element={
              <ProtectedRoute>
                <GroupDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
