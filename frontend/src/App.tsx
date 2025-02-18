import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./components/Login"
import PrivateRoute from "./components/PrivateRoute"
import Dashboard from "./components/Dashboard"
// import Hello from "./components/hello"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
