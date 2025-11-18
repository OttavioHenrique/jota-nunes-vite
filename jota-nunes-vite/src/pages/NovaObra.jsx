import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import api from "../services/axios";

export default function NovaObra() {
  const navigate = useNavigate();
  const [referentials, setReferentials] = useState([]);
  const [observations, setObservations] = useState([]);

  const [searchReferentials, setSearchReferentials] = useState("");
  const [selectedReferentials, setSelectedReferentials] = useState([]);
  const [selectedObservations, setSelectedObservations] = useState([]);

  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [aprovationObservations, setAprovationObservations] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [observationsModalOpen, setObservationsModalOpen] = useState(false);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [newRefName, setNewRefName] = useState("");
  const [newObservationDesc, setNewObservationDesc] = useState("");
  const [selectedAreasForModal, setSelectedAreasForModal] = useState([]);

  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  function updateNovaObra(data) {
    const current = JSON.parse(localStorage.getItem("novaObra")) || {};
    const updated = { ...current, ...data };
    localStorage.setItem("novaObra", JSON.stringify(updated));
  }

  useEffect(() => {
    async function fetchElements() {
      try {
        const response = await api.get("/elements/");
        const elementsList = response.data.data;
        console.log(elementsList);
        setElements(elementsList);
      } catch (error) {
        console.log("Erro ao buscar os elementos: ", error);
      }
    }
    fetchElements();
  }, []);

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

  useEffect(() => {
    async function fetchObservations() {
      try {
        const res = await api.get("/observations/");
        console.log("✅ Observations RES.DATA:", res.data);
        const list = res?.data?.data ?? [];
        console.log("✅ Observations LIST:", list);
        setObservations(list);
      } catch (err) {
        console.error("❌ Erro ao buscar observations:", err);
      }
    }

    fetchObservations();
  }, []);

  useEffect(() => {
    async function loadAux() {
      try {
        try {
          const areasRes = await api.get("/areas/");
          const areasPayload = areasRes?.data?.data ?? areasRes?.data ?? [];
          const areasArr = Array.isArray(areasPayload) ? areasPayload : [];
          setAvailableAreas(areasArr);
        } catch (e) {
          console.warn("Erro ao buscar áreas para modal:", e);
        }
        try {
          const materialsRes = await api.get("/materials/");
          const materialsPayload =
            materialsRes?.data?.data ?? materialsRes?.data ?? [];
          const materialsArr = Array.isArray(materialsPayload)
            ? materialsPayload
            : [];
          setAvailableMaterials(materialsArr);
        } catch (e) {
          console.warn("Erro ao buscar materiais para modal:", e);
        }
      } catch (err) {
        console.error("Erro loadAux:", err);
      }
    }

    loadAux();
  }, []);

  const filteredReferentials = referentials.filter(
    (r) =>
      r &&
      r.referential_name &&
      r.referential_name.name &&
      r.referential_name.name
        .toLowerCase()
        .includes(searchReferentials.toLowerCase())
  );

  function toggleSelect(id) {
    setSelectedReferentials((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleObservationSelect(id) {
    setSelectedObservations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleNext() {
    if (!projectName || !location || !description) {
      alert("Informe todos os dados gerais da obra.");
      setModalError("Informe todos os campos obrigatórios.");
      return;
    }

    if (selectedReferentials.length === 0) {
      alert("Selecione pelo menos um referencial.");
      setModalError("Selecione pelo menos um referencial.");
      return;
    }

    updateNovaObra({
      project_name: projectName,
      location: location,
      description: description,
      aprovation_observations: aprovationObservations,
      referentials: selectedReferentials,
      observations_ids: selectedObservations,
    });

    navigate("/areas");
  }

  async function createReferential() {
    setModalError("");

    if (!newRefName || !newRefName.trim()) {
      setModalError("Informe o nome do referencial.");
      return;
    }

    setModalLoading(true);

    const extractMessage = (err) => {
      const resp = err?.response;
      if (!resp) return err?.message || "Erro desconhecido";
      const data = resp.data;
      if (!data) return `Erro ${resp.status || ""}`;
      if (typeof data === "string") {
        return resp.status === 404
          ? "Endpoint não encontrado (404). Verifique a API."
          : `Erro ${resp.status}`;
      }
      if (data?.detail) return data.detail;
      if (data?.message) return data.message;
      try {
        return Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" • ");
      } catch {
        return JSON.stringify(data);
      }
    };

    try {
      const rnRes = await api.post("/referentials/name/", [
        { name: newRefName.trim() },
      ]);
      const rnPayload = rnRes?.data?.data ?? rnRes?.data ?? rnRes;
      let refNameId =
        (Array.isArray(rnPayload) ? rnPayload[0]?.id : rnPayload?.id) ?? null;
      if (!refNameId && typeof rnPayload === "object") {
        refNameId = rnPayload?.id ?? rnPayload?.pk ?? null;
      }
      if (!refNameId) {
        throw new Error(
          "Não foi possível obter referential_name_id a partir da resposta."
        );
      }

      const payload = [
        {
          referential_name_id: refNameId,
          areas_ids: Array.isArray(selectedAreasForModal)
            ? selectedAreasForModal
            : [],
          comment: "",
        },
      ];

      const res = await api.post("/referentials/", payload);
      console.log("Referential criado:", res.data);

      try {
        const listRes = await api.get("/referentials/");
        const list = listRes?.data?.data ?? listRes?.data ?? [];
        setReferentials(list);
      } catch (err) {
        console.warn("Erro ao recarregar referentials:", err);
      }

      setModalOpen(false);
      setNewRefName("");
      setSelectedAreasForModal([]);
      setModalError("");
    } catch (err) {
      console.error("Erro ao criar referential:", err);
      setModalError(extractMessage(err));
    } finally {
      setModalLoading(false);
    }
  }

  async function createObservation() {
    setModalError("");

    if (!newObservationDesc || !newObservationDesc.trim()) {
      setModalError("Informe a descrição da observação.");
      return;
    }

    setModalLoading(true);

    const extractMessage = (err) => {
      const resp = err?.response;
      if (!resp) return err?.message || "Erro desconhecido";

      const data = resp.data;

      if (!data) return `Erro ${resp.status || ""}`;

      if (typeof data === "string") {
        return resp.status === 404
          ? "Endpoint não encontrado (404). Verifique a API."
          : `Erro ${resp.status}`;
      }

      if (data?.detail) return data.detail;
      if (data?.message) return data.message;

      try {
        return Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" • ");
      } catch {
        return JSON.stringify(data);
      }
    };

    try {
      const res = await api.post("/observations/", [
        { description: newObservationDesc.trim() },
      ]);
      console.log("Observation criada:", res.data);

      try {
        const listRes = await api.get("/observations/");
        const list = listRes?.data?.data ?? listRes?.data ?? [];
        setObservations(list);
      } catch (err) {
        console.warn("Erro ao recarregar observations:", err);
      }
      setObservationsModalOpen(false);
      setNewObservationDesc("");
      setModalError("");
    } catch (err) {
      console.error("Erro ao criar observation:", err);
      setModalError(extractMessage(err));
    } finally {
      setModalLoading(false);
    }
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
            <h2 className="font-bold text-xl">Nome do referencial</h2>

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-md hover:bg-green-700 transition"
            >
              <Plus className="w-5 h-5" />
              Novo
            </button>
          </div>

          <input
            type="text"
            placeholder="Buscar referencial..."
            value={searchReferentials}
            onChange={(e) => setSearchReferentials(e.target.value)}
            className="p-3 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none"
          />

          {filteredReferentials.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {filteredReferentials.map((ref) => (
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
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-4">Nenhum referencial encontrado.</p>
          )}
        </section>

        {/* OBSERVATIONS */}
        <section className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl">Observações</h2>

            <button
              onClick={() => setObservationsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-md hover:bg-green-700 transition"
            >
              <Plus className="w-5 h-5" />
              Nova
            </button>
          </div>

          {observations.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {observations.map((obs) => (
                <div
                  key={obs.id}
                  onClick={() => toggleObservationSelect(obs.id)}
                  className={`cursor-pointer bg-white p-5 rounded-2xl border shadow transition flex flex-col gap-2 ${
                    selectedObservations.includes(obs.id)
                      ? "border-red-600 ring-2 ring-red-400"
                      : "border-gray-200"
                  }`}
                >
                  <p className="text-sm text-gray-700">
                    {obs?.description ?? "Sem descrição"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-4">Nenhuma observação encontrada.</p>
          )}
        </section>

        <button
          onClick={handleNext}
          className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700"
        >
          Próximo
        </button>

        {/* Modal: Criar Referencial */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Criar Referencial</h3>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setModalError("");
                  }}
                  className="text-gray-500"
                >
                  Fechar
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium">
                  Nome do referencial
                </label>
                <input
                  type="text"
                  placeholder="Digite o nome do novo referencial"
                  value={newRefName}
                  onChange={(e) => setNewRefName(e.target.value)}
                  className="p-3 border rounded-xl"
                />

                {modalError && (
                  <div className="text-sm text-red-600">{modalError}</div>
                )}

                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      setModalError("");
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createReferential}
                    disabled={modalLoading}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white"
                  >
                    {modalLoading ? "Criando..." : "Criar Referencial"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Criar Observação */}
        {observationsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Criar Observação</h3>
                <button
                  onClick={() => {
                    setObservationsModalOpen(false);
                    setModalError("");
                  }}
                  className="text-gray-500"
                >
                  Fechar
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium">
                  Descrição da observação
                </label>
                <textarea
                  placeholder="Digite a descrição da observação"
                  value={newObservationDesc}
                  onChange={(e) => setNewObservationDesc(e.target.value)}
                  className="p-3 border rounded-xl min-h-24"
                />

                {modalError && (
                  <div className="text-sm text-red-600">{modalError}</div>
                )}

                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => {
                      setObservationsModalOpen(false);
                      setModalError("");
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createObservation}
                    disabled={modalLoading}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white"
                  >
                    {modalLoading ? "Criando..." : "Criar Observação"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
