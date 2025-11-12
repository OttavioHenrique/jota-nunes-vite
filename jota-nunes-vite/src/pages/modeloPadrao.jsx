import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getStandardModels } from "../services/modeloPadrao"; // ajuste o caminho

export default function ModeloPadrao() {
  const navigate = useNavigate();
  const [modelos, setModelos] = useState([]);
  const [search, setSearch] = useState("");

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

  const handleSelect = (id) => {
    navigate(`/modeloPadrao/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="flex items-center gap-4 bg-red-700 text-white px-4 py-3 shadow-md">
        <button
          onClick={() => navigate("/home")}
          className="p-2 rounded-lg hover:bg-red-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-lg">Modelos Padrão</h1>
      </header>

      <main className="max-w-5xl mx-auto p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Selecione um modelo existente
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Input de busca */}
          <input
            type="text"
            placeholder="Buscar modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none"
          />

          {/* Botão criar modelo */}
          <button
            onClick={() => navigate("/criacao")}
            className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition"
          >
            Criar modelo do zero
          </button>
        </div>

        {filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            {filtered.map((modelo) => (
              <div
                key={modelo.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow hover:shadow-md transition cursor-pointer flex flex-col gap-2"
                onClick={() => handleSelect(modelo.id)}
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {modelo.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Observações: {modelo.observations?.length || 0}
                </p>
                <span className="text-xs text-gray-500">
                  Última edição: {modelo.ultimaEdicao}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-4">Nenhum modelo encontrado.</p>
        )}
      </main>
    </div>
  );
}
