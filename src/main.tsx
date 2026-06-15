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
import Statistics from "./page/Statistics";
import Login from "./page/Login";
import ProtectedLayout from "./layout/ProtectedLayout";
import ValidateObservation from "./page/ValidateObservation";
import DetailUser from "./page/DetailUser";
import CreateSpecies from "./page/CreateSpecie";
import EditSpecies from "./page/EditSpecies";
import { Toaster } from "./components/ui/sonner";
import Map from "./page/Map";
import { StatsProvider } from "./hooks/useObservationsStats";

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
        <Route path="/species/:id" element={<EditSpecies />} />
        <Route path="/species-create" element={<CreateSpecies />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<DetailUser />} />
        <Route path="/map" element={<Map />} />
        <Route path="/statistics" element={<Statistics />} />
      </Route>
    </>,
  ),
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <StatsProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </StatsProvider>
    </AuthProvider>
  </StrictMode>,
);
