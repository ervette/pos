import { Navigate } from "react-router-dom";
import { getToken } from "../services/auth.service";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  return getToken() ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
