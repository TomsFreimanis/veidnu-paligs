import { useMemo, useState, useEffect } from "react";
import casesData from "./data/cases.json";
import resourcesData from "./data/resources.json";

export default function App() {
  const [activeView, setActiveView] = useState("cases");
  const [selectedCase, setSelectedCase] = useState(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Visas");
  const [toast, setToast] = useState(null);

  const [cases] = useState(casesData);
  const [resources] = useState(resourcesData);

  const categories = useMemo(() => {
    const set = new Set(cases.map((c) => c.category).filter(Boolean));
    return ["Visas", ...Array.from(set)];
  }, [cases]);

  const filteredCases = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases.filter((c) => {
      const catOk = activeCategory === "Visas" || c.category === activeCategory;
      if (!catOk) return false;
      if (!q) return true;
      const inTitle = c.title?.toLowerCase().includes(q);
      const inDesc = c.description?.toLowerCase().includes(q);
      const inArts = Array.isArray(c.articles)
        ? c.articles.some((a) => a.text?.toLowerCase().includes(q))
        : false;
      return inTitle || inDesc || inArts;
    });
  }, [cases, query, activeCategory]);

  const copyWithToast = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Nokopēts ✅");
    } catch {
      setToast("Neizdevās kopēt");
    } finally {
      setTimeout(() => setToast(null), 1300);
    }
  };

  useEffect(() => {
    setQuery("");
  }, [activeCategory]);

  const CaseCard = ({ c }) => (
    <div
      className="p-4 bg-white border rounded-xl shadow-sm hover:shadow-md cursor-pointer transition"
      onClick={() => setSelectedCase(c)}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-blue-700">{c.title}</h3>
        {c.category && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border">
            {c.category}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{c.description}</p>
    </div>
  );

  const CaseDetails = ({ c }) => (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setSelectedCase(null)}
      />
      <div className="absolute inset-x-0 bottom-0 md:inset-0 md:m-auto md:max-w-lg
                      bg-white rounded-t-2xl md:rounded-2xl shadow-lg p-6">
        <button
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-800"
          onClick={() => setSelectedCase(null)}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-blue-700 mb-1">{c.title}</h2>
        {c.category && (
          <div className="text-xs text-gray-500 mb-3">{c.category}</div>
        )}

        <div className="mb-4">
          <h3 className="font-medium mb-1">Apraksts</h3>
          <p className="text-gray-700 mb-2 whitespace-pre-line">
            {c.description}
          </p>
          <button
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 shadow-md w-full md:w-auto transition"
            onClick={() => copyWithToast(c.description || "")}
          >
            📋 Kopēt aprakstu
          </button>
        </div>

        <div>
          <h3 className="font-medium mb-2">Panti</h3>
          {Array.isArray(c.articles) && c.articles.length > 0 ? (
            c.articles.map((a) => (
              <div
                key={a.id ?? a.text}
                className="flex justify-between items-center bg-gray-50 border rounded-lg px-3 py-2 mb-2"
              >
                <span className="text-sm">{a.text}</span>
                <button
                  className="text-blue-600 text-sm font-medium hover:underline"
                  onClick={() => copyWithToast(a.text || "")}
                >
                  Kopēt
                </button>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">
              Pantu saraksts nav pievienots.
            </div>
          )}
        </div>
      </div>
    </div>
  );

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 flex flex-col">
    {/* Header */}
    <header className="backdrop-blur-md bg-white/80 border-b sticky top-0 z-50 shadow-sm">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full px-4 sm:px-8 py-3 gap-2 sm:gap-0">
    <h1 className="text-xl font-bold text-blue-700 tracking-tight text-center sm:text-left">
      Veidņu palīgs
    </h1>

    <div className="flex justify-center sm:justify-end gap-2">
      <button
        onClick={() => setActiveView("cases")}
        className={`px-5 py-2 rounded-full text-sm font-medium transition ${
          activeView === "cases"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-white text-gray-700 border hover:bg-blue-50"
        }`}
      >
        Notikumi
      </button>
      <button
        onClick={() => setActiveView("resources")}
        className={`px-5 py-2 rounded-full text-sm font-medium transition ${
          activeView === "resources"
            ? "bg-gray-200 text-gray-700 shadow-md"
            : "bg-white text-gray-500 border hover:bg-gray-100"
        }`}
      >
        Resursi
      </button>
    </div>
  </div>
</header>


    {/* Main */}
    <main className="flex-1 w-full px-4 sm:px-10 py-6">
  {activeView === "cases" && (
    <>
      {/* Meklēšana un info */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Meklēt nosaukumā, aprakstā vai pantos..."
          className="w-full border border-gray-300 rounded-full px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
        />
        <div className="flex items-center justify-between md:justify-start gap-3">
          <button
            onClick={() => setQuery("")}
            className="px-4 py-2 text-sm rounded-full bg-gray-100 hover:bg-gray-200 border text-gray-600"
          >
            Notīrīt
          </button>
          <span className="text-sm text-gray-500">Atrasti: {filteredCases.length}</span>
        </div>
      </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCases.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition p-5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-semibold text-blue-700 mb-2">
                    {c.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {c.description}
                  </p>
                </div>
                {c.category && (
                  <div className="text-xs text-gray-500 mt-3 italic">
                    {c.category}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {activeView === "resources" && (
        <section className="px-4 md:px-10">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Resursi</h2>
          <p className="text-sm text-gray-500 mb-8">
            Šī sadaļa ir informatīva — tajā apkopoti tiesību panti, pienākumi
            un atbildību mīkstinoši/pastiprinoši apstākļi.
          </p>

          <div className="space-y-6">
            {resources.map((r) => (
              <div
                key={r.id}
                className="bg-white/80 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition"
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {r.title}
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>

    {toast && (
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm z-[60]">
        {toast}
      </div>
    )}

    {selectedCase && <CaseDetails c={selectedCase} />}
  </div>
);



}
