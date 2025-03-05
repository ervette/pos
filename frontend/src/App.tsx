import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar"; // Import Navbar

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <>
                <Navbar /> {/* Navbar is now part of the layout */}
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  {/* Add other protected routes here */}
                </Routes>
              </>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
