import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Resume from "./pages/Resume";
import SkillGap from "./pages/SkillGap";
import Roadmap from "./pages/Roadmap";
import Projects from "./pages/Projects";
import Interview from "./pages/Interview";
import Progress from "./pages/Progress";

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
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/"
                element={<Navigate to="/dashboard" />}
              />

              <Route
                path="/resume"
                element={<Resume />}
              />

              <Route
                path="/skill-gap"
                element={<SkillGap />}
              />

              <Route
                path="/roadmap"
                element={<Roadmap />}
              />

              <Route
                path="/projects"
                element={<Projects />}
              />

              <Route
                path="/interview"
                element={<Interview />}
              />

              <Route
                path="/progress"
                element={<Progress />}
              />

              <Route 
                path="/roadmap" 
                element={<Roadmap />} 
              />

            </Routes>

          </main>

        </div>

      </div>

    </BrowserRouter>
  );
}

export default App;