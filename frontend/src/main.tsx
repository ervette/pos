import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { handleOrderSubmission, syncOfflineData } from "./services/sync.service.ts";
import { fetchAndCacheMenu } from "./services/menu.service.ts";
import { updateOrder, deleteOrder } from "./localdb/orders.ts"; 
import db from "./localdb/index";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).handleOrderSubmission = handleOrderSubmission;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).syncOfflineData = syncOfflineData;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).updateOrder = updateOrder;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).deleteOrder = deleteOrder;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).db = db; // Makes IndexedDB globally accessible


fetchAndCacheMenu();

window.addEventListener("online", () => {
  console.log("Network restored. Triggering offline data sync...");
  syncOfflineData();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
