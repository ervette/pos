import axios from "axios";

const API = axios.create({
  baseURL: "/api", // Backend URL
});

export const fetchHelloWorld = async () => {
  try {
    const response = await API.get("/api"); // Calls the /api route
    console.log(response.data.message); // Logs "Hello World"
  } catch (error) {
    console.error("Error fetching Hello World:", error);
  }
};
