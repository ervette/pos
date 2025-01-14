import React, { useEffect } from "react";
import { fetchHelloWorld } from "../services/api";

const Hello: React.FC = () => {
  useEffect(() => {
    fetchHelloWorld(); // Fetches "Hello World" on component mount
  }, []);

  return <div>Hello from React Frontend</div>;
};

export default Hello;
