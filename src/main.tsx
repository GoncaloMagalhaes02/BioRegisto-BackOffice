import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { AuthProvider } from "./hooks/useAuth";

// Pages
import Dashboard from "./page/Dashboard";
import Observations from "./page/Observations";
import Species from "./page/Species";
import Users from "./page/Users";
import MapPage from "./page/MapPage";
import Statistics from "./page/Statistics";
import Login from "./page/Login";
import ProtectedLayout from "./layout/ProtectedLayout";
import ValidateObservation from "./page/ValidateObservation";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      {/* Rotas protegidas — todas partilham o Layout */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/observations" element={<Observations />} />
        <Route path="/observations/:id" element={<ValidateObservation />} />
        <Route path="/species" element={<Species />} />
        <Route path="/users" element={<Users />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/statistics" element={<Statistics />} />
      </Route>
    </>,
  ),
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
