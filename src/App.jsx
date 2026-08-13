import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Resume from "./pages/Resume";
import SkillGap from "./pages/SkillGap";
import Roadmap from "./pages/Roadmap";
import Projects from "./pages/Projects";
import Interview from "./pages/Interview";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";

import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>

      <div className="app">

        <Navbar />

        <div className="app-body">

          <Sidebar />

          <main className="main-content">

            <Routes>
              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/"
                element={<Navigate to="/dashboard" />}
              />

              <Route
                path="/resume"
                element={
                  <ProtectedRoute>
                    <Resume />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/skill-gap"
                element={
                  <ProtectedRoute>
                    <SkillGap />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/roadmap"
                element={
                  <ProtectedRoute>
                    <Roadmap />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <Projects />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/interview"
                element={
                  <ProtectedRoute>
                    <Interview />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/progress"
                element={
                  <ProtectedRoute>
                    <Progress />
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

            </Routes>

          </main>

        </div>

      </div>

    </BrowserRouter>
  );
}

export default App;