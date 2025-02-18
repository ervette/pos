import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./components/Login"
import PrivateRoute from "./components/PrivateRoute"
import Hello from "./components/hello"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <div>
                <Hello />
                You are In
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
