import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

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

            </Routes>

          </main>

        </div>

      </div>

    </BrowserRouter>
  );
}

export default App;