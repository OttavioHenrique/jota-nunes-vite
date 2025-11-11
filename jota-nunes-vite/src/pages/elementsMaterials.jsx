// src/pages/SelecionarElementos.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../services/axios";

export default function SelecionarElementos() {
  const navigate = useNavigate();

  const [allElements, setAllElements] = useState([]); // todos os elementos do backend
  const [referentialsMeta, setReferentialsMeta] = useState([]); // [{id,name}]
  const [areasByReferential, setAreasByReferential] = useState({}); // do localStorage
  const [elementsByArea, setElementsByArea] = useState({}); // {"refId-areaId": [elementId, ...]}

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  function updateNovaObra(data) {
    const current = JSON.parse(localStorage.getItem("novaObra")) || {};
    const updated = { ...current, ...data };
    localStorage.setItem("novaObra", JSON.stringify(updated));
  }

  function referentialIdFrom(r) {
    if (!r) return null;
    if (typeof r === "number") return r;
    if (r.id) return r.id;
    return null;
  }

  //
  // 🔄 Carregar dados
  //
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const stored = JSON.parse(localStorage.getItem("novaObra")) || {};

        const refRaw = stored.referentials || [];
        const referentialIds = refRaw
          .map((r) => referentialIdFrom(r))
          .filter(Boolean);

        const savedAreasMap = stored.areas_by_referential || {};
        setAreasByReferential(savedAreasMap);

        const savedElementsMap = stored.elements_by_area || {};
        setElementsByArea(savedElementsMap);

        // pegar nomes dos referenciais
        let refsMeta = [];
        if (referentialIds.length > 0) {
          try {
            const refsRes = await api.get("/referentials/");
            const payload = refsRes?.data?.data ?? refsRes?.data ?? [];
            if (Array.isArray(payload)) {
              refsMeta = payload
                .map((r) => ({
                  id: r.id,
                  name:
                    r?.referential_name?.name ??
                    r?.name ??
                    `Referential ${r.id}`,
                }))
                .filter((r) => referentialIds.includes(r.id));
            }
          } catch (err) {
            refsMeta = referentialIds.map((id) => ({
              id,
              name: `Referential ${id}`,
            }));
          }
        }

        const metaIds = refsMeta.map((r) => r.id);
        for (const id of referentialIds) {
          if (!metaIds.includes(id))
            refsMeta.push({ id, name: `Referential ${id}` });
        }
        refsMeta.sort((a, b) => a.id - b.id);
        setReferentialsMeta(refsMeta);

        // Carregar TODOS os elementos
        const elemRes = await api.get("/elements/");
        const elemPayload = elemRes?.data?.data ?? elemRes?.data ?? [];
        const elemsArr = Array.isArray(elemPayload) ? elemPayload : [];
        setAllElements(elemsArr);
      } catch (err) {
        console.error("Erro ao carregar elementos:", err);
        setAllElements([]);
        setReferentialsMeta([]);
        setAreasByReferential({});
        setElementsByArea({});
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function toggleElement(refId, areaId, elementId) {
    const areaKey = `${refId}-${areaId}`;
    setElementsByArea((prev) => {
      const current = prev[areaKey] || [];
      const nextList = current.includes(elementId)
        ? current.filter((x) => x !== elementId)
        : [...current, elementId];
      return { ...prev, [areaKey]: nextList };
    });
  }

  function handleNext() {
    updateNovaObra({ elements_by_area: elementsByArea });
    navigate("/materiais");
  }
  function elementName(e) {
    return e?.element_type?.name || "Elemento";
  }
  function areaName(a) {
    return a?.area_name?.name ?? a?.name ?? `Área ${a?.id ?? ""}`;
  }

  function matchesSearch(text) {
    if (!search) return true;
    return text.toLowerCase().includes(search.toLowerCase());
  }

  const stored = JSON.parse(localStorage.getItem("novaObra")) || {};
  const areasMap = stored.areas_by_referential || {};
  const allAreasFromStorage =
    JSON.parse(localStorage.getItem("allAreasCache")) || [];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center gap-4 bg-red-700 text-white px-4 py-3 shadow-md">
        <button
          onClick={() => navigate("/areas")}
          className="p-2 rounded-lg hover:bg-red-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-lg">Selecionar Elementos</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6 flex flex-col gap-6">
        <section className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl">Elementos disponíveis</h2>
            <p className="text-sm text-gray-500">
              Escolha os elementos (por Área / Referencial)
            </p>
          </div>

          <input
            type="text"
            placeholder="Buscar elemento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none"
          />
        </section>

        {loading ? (
          <div className="text-center text-gray-700">Carregando...</div>
        ) : (
          <>
            {referentialsMeta.map((ref) => {
              const refId = ref.id;
              const refName = ref.name ?? `Referential ${refId}`;
              const areaList = areasMap[refId] ?? [];

              return (
                <section
                  key={refId}
                  className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-6"
                >
                  <h3 className="font-semibold text-xl">
                    {refName} — Áreas ({areaList.length})
                  </h3>

                  {areaList.length === 0 ? (
                    <p className="text-gray-500">Nenhuma área selecionada.</p>
                  ) : (
                    areaList.map((areaId) => {
                      const areaData = allAreasFromStorage.find(
                        (a) => a.id === areaId
                      );
                      const titleArea = areaName(areaData);
                      const areaKey = `${refId}-${areaId}`;
                      const selectedElems = elementsByArea[areaKey] || [];

                      return (
                        <div
                          key={areaKey}
                          className="border border-gray-200 rounded-xl p-4 flex flex-col gap-4"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-lg">
                              {titleArea}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {selectedElems.length} selecionado(s)
                            </p>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            {allElements
                              .filter((el) =>
                                matchesSearch(el?.name ?? `EL ${el.id}`)
                              )
                              .map((el) => {
                                const isSel = selectedElems.includes(el.id);
                                return (
                                  <div
                                    key={`${areaKey}-${el.id}`}
                                    onClick={() =>
                                      toggleElement(refId, areaId, el.id)
                                    }
                                    className={`cursor-pointer bg-white p-5 rounded-2xl border shadow transition flex flex-col gap-2 ${
                                      isSel
                                        ? "border-red-600 ring-2 ring-red-400"
                                        : "border-gray-200"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <h5 className="text-lg font-semibold text-gray-900">
                                        {elementName(el)}
                                      </h5>
                                      <span className="text-xs text-gray-500">
                                        ID {el.id}
                                      </span>
                                    </div>

                                    {el.description && (
                                      <p className="text-xs text-gray-500 italic">
                                        {el.description}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </section>
              );
            })}

            <div className="flex justify-between items-center my-6">
              <button
                onClick={() => navigate("/areas")}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-300"
              >
                Voltar
              </button>

              <button
                onClick={handleNext}
                disabled={Object.values(elementsByArea).every(
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
