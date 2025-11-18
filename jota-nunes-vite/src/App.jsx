import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "../src/pages/login";
import Home from "./pages/home";
import ModeloPadrao from "./pages/modeloPadrao";
import NovaObra from "./pages/NovaObra";
import SelecionarAreas from "./pages/areas";
import ElementsMaterialsPage from "./pages/elementsMaterials";
import Materials from "./pages/materials";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROTA PÚBLICA */}
        <Route path="/" element={<LoginPage />} />

        {/* ROTAS PROTEGIDAS */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/modeloPadrao"
          element={
            <ProtectedRoute>
              <ModeloPadrao />
            </ProtectedRoute>
          }
        />

        <Route
          path="/areas"
          element={
            <ProtectedRoute>
              <SelecionarAreas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/criacao"
          element={
            <ProtectedRoute>
              <NovaObra />
            </ProtectedRoute>
          }
        />

        <Route
          path="/elementos"
          element={
            <ProtectedRoute>
              <ElementsMaterialsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/materiais"
          element={
            <ProtectedRoute>
              <Materials />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
