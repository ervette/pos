import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa"
import "../styles/Navbar.css"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Close Sidebar when clicking outside
  const closeSidebar = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).classList.contains("navbar-overlay")) {
      setIsOpen(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken") // Clear auth token
    navigate("/login") // Redirect to login page
  }

  return (
    <>
      {/* Burger Icon */}
      <div className="burger-menu" onClick={toggleSidebar}>
        <FaBars size={24} />
      </div>

      {/* Sidebar Overlay */}
      {isOpen && <div className="navbar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar Navigation */}
      <nav className={`sidebar ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={toggleSidebar}>
          <FaTimes size={22} />
        </button>

        <ul className="nav-links">
          <li>
            <Link to="/tables" onClick={toggleSidebar}>
              Tables
            </Link>
          </li>
          <li>
            <Link to="/" onClick={toggleSidebar}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/settings" onClick={toggleSidebar}>
              Settings
            </Link>
          </li>
          <li>
            <Link to="/inventory" onClick={toggleSidebar}>
              Inventory
            </Link>
          </li>
          <li>
            <Link to="/accounting" onClick={toggleSidebar}>
              Accounting
            </Link>
          </li>
          <li>
            <Link to="/archive" onClick={toggleSidebar}>
              Archive
            </Link>
          </li>
        </ul>

        {/* Exit Button */}
        <div
          className="exit-button"
          onClick={handleLogout}
        >
          Exit <FaSignOutAlt />
        </div>
      </nav>
    </>
  )
}

export default Navbar
