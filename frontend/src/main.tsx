import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { handleOrderSubmission } from "./services/sync.service.ts";
import { syncOfflineData } from "./services/sync.service.ts"; // Import the sync logic

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).handleOrderSubmission = handleOrderSubmission;

window.addEventListener("online", () => {
  console.log("Network restored. Triggering offline data sync...");
  syncOfflineData();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
