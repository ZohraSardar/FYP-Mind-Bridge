import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { auth } from "@/lib/firebase"; // Import Firebase auth
import { User, onAuthStateChanged, signOut } from "firebase/auth";

// Define the shape of the user object
interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  // Add other Firebase user properties as needed
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean; // Add loading state
  logout: () => Promise<void>; // Update logout to use Firebase
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Map Firebase user to your app's user object
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        setUser(null); // No user is signed in
      }
      setLoading(false); // Set loading to false after auth state is determined
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  // Logout function using Firebase
  const logout = async () => {
    try {
      await signOut(auth); // Sign out using Firebase
      setUser(null); // Clear the user state
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Provide the auth context to the app
  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};