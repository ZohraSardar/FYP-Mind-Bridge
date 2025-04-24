import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ClipLoader } from "react-spinners"; // Import the spinner

interface ProtectedRouteProps {
  children: React.ReactNode; // Accept children instead of component
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth(); // Add loading state
  const [, setLocation] = useLocation();

  // If authentication state is still loading, show a loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ClipLoader color="#3B82F6" size={50} /> {/* Use ClipLoader as the spinner */}
      </div>
    );
  }

  // If user is not authenticated, redirect to AuthPage
  if (!user) {
    setLocation("/auth");
    return null; // Prevent rendering until redirect occurs
  }

  // Render the children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;