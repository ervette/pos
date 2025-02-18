import React, { useState } from "react"
import { login } from "../services/auth.service"
import { useNavigate } from "react-router-dom"
import "../styles/Login.css"
import LogoHeader from "../components/LogoHeader"

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(username, password)
      navigate("/")
    } catch (err) {
      setError("Invalid credentials")
      console.log(err)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <LogoHeader />
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="input-box"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-box"
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="button-container">
            <button type="submit" className="login-button">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
