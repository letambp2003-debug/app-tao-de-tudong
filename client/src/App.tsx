import React from "react";
import { AuthProvider } from "./contexts/AuthContext.js";
import { NotificationProvider } from "./contexts/NotificationContext.js";
import { ProjectProvider } from "./contexts/ProjectContext.js";
import { AppRouter } from "./router.js";

export const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ProjectProvider>
          <AppRouter />
        </ProjectProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};
