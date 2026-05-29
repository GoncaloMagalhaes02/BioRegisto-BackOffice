import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";

import Login from "./page/Login/Login";

const routes = createBrowserRouter(
  createRoutesFromElements(<Route path="/" element={<Login />} />),
);

const router = createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={routes} />
  </StrictMode>,
);
