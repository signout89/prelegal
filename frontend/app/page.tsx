"use client";

import { AuthProvider, useAuth } from "./auth/AuthContext";
import AuthScreen from "./components/AuthScreen";
import Workspace from "./components/Workspace";

function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted">Loading...</div>;
  return user ? <Workspace /> : <AuthScreen />;
}

export default function Home() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
