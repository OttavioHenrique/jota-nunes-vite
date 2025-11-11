import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import api from "../services/axios";

export default function NovaObra() {
  const navigate = useNavigate();
  const [referentials, setReferentials] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedReferentials, setSelectedReferentials] = useState([]);

  // ▸ states locais da obra
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [observations, setObservations] = useState("");
  const [aprovationObservations, setAprovationObservations] = useState("");

  function updateNovaObra(data) {
    const current = JSON.parse(localStorage.getItem("novaObra")) || {};
    const updated = { ...current, ...data };
    localStorage.setItem("novaObra", JSON.stringify(updated));
  }

  useEffect(() => {
    async function fetchReferentials() {
      try {
        const res = await api.get("/referentials/");

        console.log("✅ RES.DATA:", res.data);
        const list = res?.data?.data ?? [];

        console.log("✅ LIST:", list);

        setReferentials(list);
      } catch (err) {
        console.error("❌ Erro ao buscar referentials:", err);
      }
    }

    fetchReferentials();
  }, []);

  const filtered = referentials.filter(
    (r) =>
      r &&
      r.referential_name &&
      r.referential_name.name &&
      r.referential_name.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggleSelect(id) {
    setSelectedReferentials((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleNext() {
    updateNovaObra({
      project_name: projectName,
      location,
      description,
      observations,
      aprovation_observations: aprovationObservations,
      referentials: selectedReferentials,
    });

    navigate("/areas");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="flex items-center gap-4 bg-red-700 text-white px-4 py-3 shadow-md">
        <button
          onClick={() => navigate("/home")}
          className="p-2 rounded-lg hover:bg-red-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-lg">Criar Obra</h1>
      </header>

      <main className="max-w-5xl mx-auto p-6 flex flex-col gap-6">
        {/* DADOS GERAIS */}
        <section className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-4">
          <h2 className="font-bold text-xl">Dados Gerais</h2>

          <input
            type="text"
            placeholder="Nome da obra"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none"
          />

          <input
            type="text"
            placeholder="Localização"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none"
          />

          <textarea
            placeholder="Descrição do empreendimento"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none min-h-32"
          />
        </section>

        {/* REFERENCIAIS */}
        <section className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl">Referenciais</h2>

            <button
              onClick={() => navigate("/referenciais/new")}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-md hover:bg-green-700 transition"
            >
              <Plus className="w-5 h-5" />
              Novo
            </button>
          </div>

          <input
            type="text"
            placeholder="Buscar referencial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none"
          />

          {filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {filtered.map((ref) => (
                <div
                  key={ref.id}
                  onClick={() => toggleSelect(ref.id)}
                  className={`cursor-pointer bg-white p-5 rounded-2xl border shadow transition flex flex-col gap-2 ${
                    selectedReferentials.includes(ref.id)
                      ? "border-red-600 ring-2 ring-red-400"
                      : "border-gray-200"
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {ref?.referential_name?.name ?? "Sem nome"}
                  </h3>

                  <p className="text-sm text-gray-600">
                    Áreas: {ref?.areas?.length ?? 0}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-4">Nenhum referencial encontrado.</p>
          )}
        </section>

        {/* Observações */}
        <section className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-4">
          <h2 className="font-bold text-xl">Observações</h2>

          <textarea
            placeholder="Observações gerais"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none min-h-24"
          />

          <textarea
            placeholder="Observações de aprovação"
            value={aprovationObservations}
            onChange={(e) => setAprovationObservations(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none min-h-24"
          />
        </section>

        <button
          onClick={handleNext}
          className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700"
        >
          Próximo
        </button>
      </main>
    </div>
  );
}
