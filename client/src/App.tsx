import React from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient"; // Adjust based on your project structure
import { Switch, Route } from "wouter";
import { AuthProvider } from "@/hooks/use-auth"; // Adjust path as necessary
import AuthPage from "./pages/auth-page"; // Adjust path as necessary
import HomePage from "./pages/home-page"; // Adjust path as necessary
import ExplorePage from "./pages/explore-page"; // Import the ExplorePage component
import NotFound from "./pages/not-found"; // Adjust path as necessary
import ProtectedRoute from "@/lib/protected-route"; // Import the ProtectedRoute component
import GamePage from "./pages/game-page"; // Import the GamePage component

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/auth" component={AuthPage} /> {/* Auth page */}
          <ProtectedRoute>
            <Route path="/" component={HomePage} /> {/* Protected Home page */}
            <Route path="/explore" component={ExplorePage} /> {/* Protected Explore page */}
            <Route path="/game/:type" component={GamePage} /> {/* Game page route */}
          </ProtectedRoute>
          <Route component={NotFound} /> {/* 404 page */}
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;