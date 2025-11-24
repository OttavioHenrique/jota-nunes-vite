import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "react-router-dom";

import { getStandardModels } from "../services/modeloPadrao";

export default function ModeloPadrao() {
  const navigate = useNavigate();
  const [modelos, setModelos] = useState([]);
  const [search, setSearch] = useState("");
  const location = useLocation();
  const obraOriginal = location.state?.obraOriginal || null;

  useEffect(() => {
    async function fetchModelos() {
      try {
        const data = await getStandardModels();
        setModelos(data);
      } catch (err) {
        console.error("Erro ao buscar modelos:", err);
      }
    }

    fetchModelos();
  }, []);

  const filtered = modelos.filter(
    (m) => m && m.name && m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (modelo) => {
    navigate("/criacao", {
      state: {
        modeloPadrao: modelo,
        obraOriginal: obraOriginal,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center gap-4 bg-red-700 text-white px-4 py-3 shadow-md">
        <button
          onClick={() => navigate("/home")}
          className="p-2 rounded-lg hover:bg-red-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-lg">Modelos Padrão</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6 flex flex-col gap-10">
        {/* TÍTULO PRINCIPAL */}
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-gray-900">Modelos Salvos</h2>
          <p className="text-gray-600 text-sm">
            Visualize, selecione modelos existentes.
          </p>
        </div>

        {/* BARRA DE BUSCA E BOTÃO */}
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="Buscar modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none"
          />

          <button
            onClick={() => navigate("/criacao")}
            className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition text-sm font-medium shadow"
          >
            Criar modelo do zero
          </button>
        </div>

        {/* SEÇÃO DOS MODELOS */}
        <section className="flex flex-col gap-6 mt-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Modelos Disponíveis
          </h3>

          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((modelo) => (
                <div
                  onClick={() => handleSelect(modelo)}
                  className="bg-white p-5 rounded-2xl border border-gray-200 shadow hover:shadow-lg transition cursor-pointer flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {modelo.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Observações: {modelo.observations?.length || 0}
                    </p>
                  </div>

                  <span className="text-xs text-gray-500 mt-auto">
                    Última edição: {modelo.ultimaEdicao}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-4">Nenhum modelo encontrado.</p>
          )}
        </section>
      </main>
    </div>
  );
}
