// src/pages/SelecionarAreas.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../services/axios";

export default function SelecionarAreas() {
  const navigate = useNavigate();

  const [allAreas, setAllAreas] = useState([]); // todas as áreas do backend
  const [referentialsMeta, setReferentialsMeta] = useState([]); // [{id, name}]
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // objeto: { "<refId>": [areaId, ...] }
  const [areasByReferential, setAreasByReferential] = useState({});

  function updateNovaObra(data) {
    const current = JSON.parse(localStorage.getItem("novaObra")) || {};
    const updated = { ...current, ...data };
    localStorage.setItem("novaObra", JSON.stringify(updated));
  }

  // helper: extrai id de um referential object ou retorna o number
  function referentialIdFrom(ref) {
    if (!ref) return null;
    if (typeof ref === "number") return ref;
    if (ref.id) return ref.id;
    return null;
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const stored = JSON.parse(localStorage.getItem("novaObra")) || {};
        console.log("📦 LOCALSTORAGE (novaObra):", stored);

        const storedReferentials = stored.referentials || [];
        console.log("➡ storedReferentials:", storedReferentials);

        // normaliza referentials: pode ser array de ids ou array de objects
        const referentialIds = storedReferentials
          .map((r) => referentialIdFrom(r))
          .filter(Boolean);

        console.log("✅ referentialIds normalizados:", referentialIds);

        // fetch todas as areas
        const areasRes = await api.get("/areas/");
        const areasPayload = areasRes?.data?.data ?? areasRes?.data ?? [];
        const areasArr = Array.isArray(areasPayload) ? areasPayload : [];

        console.log("📍 GET /areas:", areasArr);

        // fetch referentials somente para obter nomes
        let refsMeta = [];
        if (referentialIds.length > 0) {
          try {
            const refsRes = await api.get("/referentials/");
            const refsPayload = refsRes?.data?.data ?? refsRes?.data ?? [];
            console.log("📍 GET /referentials:", refsPayload);

            if (Array.isArray(refsPayload)) {
              refsMeta = refsPayload
                .map((r) => ({
                  id: r.id,
                  name:
                    r?.referential_name?.name ??
                    r?.name ??
                    `Referential ${r.id}`,
                }))
                .filter(Boolean)
                .filter((r) => referentialIds.includes(r.id));
            }
          } catch (err) {
            console.warn("⚠ Erro ao consultar /referentials, fallback");
            refsMeta = referentialIds.map((id) => ({
              id,
              name: `Referential ${id}`,
            }));
          }
        }

        console.log("✅ refsMeta FINAL:", refsMeta);

        // garantir que todos os referentialIds estejam no meta
        const metaIds = refsMeta.map((r) => r.id);
        for (const id of referentialIds) {
          if (!metaIds.includes(id))
            refsMeta.push({ id, name: `Referential ${id}` });
        }

        // inicializar areasByReferential
        const saved = JSON.parse(localStorage.getItem("novaObra")) || {};
        const savedAreasByRef = saved.areas_by_referential || {};

        console.log("📦 savedAreasByRef:", savedAreasByRef);

        const initialMap = {};
        for (const refId of referentialIds) {
          initialMap[refId] = Array.isArray(savedAreasByRef[refId])
            ? savedAreasByRef[refId]
            : [];
        }

        console.log("✅ AreasByReferential (initialMap):", initialMap);

        setAllAreas(areasArr);
        setReferentialsMeta(refsMeta);
        setAreasByReferential(initialMap);
      } catch (err) {
        console.error("❌ Erro ao carregar áreas/referenciais:", err);
        setAllAreas([]);
        setReferentialsMeta([]);
        setAreasByReferential({});
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // toggle de seleção de área dentro de um referential
  function toggleAreaForReferential(refId, areaId) {
    setAreasByReferential((prev) => {
      const cur = prev[refId] || [];
      const nextForRef = cur.includes(areaId)
        ? cur.filter((x) => x !== areaId)
        : [...cur, areaId];
      const next = { ...prev, [refId]: nextForRef };
      // não salvar ainda no localStorage global — só no próximo botão (mas podemos salvar já)
      return next;
    });
  }

  function handleNext() {
    // salvar mapping no localStorage.novaObra e avançar
    updateNovaObra({ areas_by_referential: areasByReferential });
    navigate("/ElementosMaterials");
  }

  function areaTitle(a) {
    return a?.area_name?.name ?? a?.name ?? `Área ${a?.id ?? ""}`;
  }

  function matchesSearch(text) {
    if (!search) return true;
    return text.toLowerCase().includes(search.toLowerCase());
  }

  // ui render
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center gap-4 bg-red-700 text-white px-4 py-3 shadow-md">
        <button
          onClick={() => navigate("/nova-obra")}
          className="p-2 rounded-lg hover:bg-red-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-lg">Selecionar Áreas</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6 flex flex-col gap-6">
        <section className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl">Áreas disponíveis</h2>
            <p className="text-sm text-gray-500">
              Escolha áreas para cada referential selecionado
            </p>
          </div>

          <input
            type="text"
            placeholder="Buscar área..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none"
          />
        </section>

        {loading ? (
          <div className="text-center text-gray-700">Carregando...</div>
        ) : (
          <>
            {/* Para cada referential selecionado, mostramos a lista completa de áreas */}
            {referentialsMeta.map((ref) => {
              const refId = ref.id;
              const title = ref.name ?? `Referential ${refId}`;
              const selectedForRef = areasByReferential[refId] || [];

              return (
                <section
                  key={refId}
                  className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <span className="text-sm text-gray-500">
                      {selectedForRef.length} selecionada(s)
                    </span>
                  </div>

                  {allAreas.length === 0 ? (
                    <p className="text-gray-500">Nenhuma área disponível.</p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4 mt-2">
                      {allAreas
                        .filter((a) => matchesSearch(areaTitle(a)))
                        .map((a) => {
                          const isSel = selectedForRef.includes(a.id);
                          const elementsCount = Array.isArray(a.elements)
                            ? a.elements.length
                            : a.elements_count ?? 0;
                          return (
                            <div
                              key={`${refId}-${a.id}`}
                              onClick={() =>
                                toggleAreaForReferential(refId, a.id)
                              }
                              className={`cursor-pointer bg-white p-5 rounded-2xl border shadow transition flex flex-col gap-2 ${
                                isSel
                                  ? "border-red-600 ring-2 ring-red-400"
                                  : "border-gray-200"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {areaTitle(a)}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  ID {a.id}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Elementos: {elementsCount}
                              </p>
                              {a.description && (
                                <p className="text-xs text-gray-500 italic">
                                  {a.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </section>
              );
            })}

            <div className="flex justify-between items-center gap-4">
              <button
                onClick={() => navigate("/criacao")}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-300"
              >
                Voltar
              </button>

              <button
                onClick={handleNext}
                disabled={Object.values(areasByReferential).every(
                  (arr) => !arr || arr.length === 0
                )}
                className="bg-red-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700"
              >
                Próximo
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
