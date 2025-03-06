import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./components/Login"
import PrivateRoute from "./components/PrivateRoute"
import Dashboard from "./components/Dashboard"
import Navbar from "./components/Navbar"
import TablesPage from "./components/TablesPage"
import TableOrderPage from "./components/TableOrderPage"

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
                  <Route path="/tables" element={<TablesPage />} />
                  <Route
                    path="/table/:tableNumber"
                    element={<TableOrderPage />}
                  />
                  {/* Add other protected routes here */}
                </Routes>
              </>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
