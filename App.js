import React from "react";
import AppNavigator from "./navigation";
import { AuthProvider } from "./context/authcontext";

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
