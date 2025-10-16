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
      setToast("Neizdevās kopēt ❌");
    } finally {
      setTimeout(() => setToast(null), 1300);
    }
  };

  useEffect(() => {
    setQuery("");
  }, [activeCategory]);

  // 🧩 Case details modālais logs
  const CaseDetails = ({ c }) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({});

    const fields = [
      "datums",
      "laiks",
      "vieta",
      "pilsonis",
      "personas_kods",
      "epasts",
      "modelis",
      "reg_nr",
      "marsruts",
      "pasazieris",
    ];

    const handleChange = (key, value) => {
      setFormData({ ...formData, [key]: value });
    };

    const filledDescription = useMemo(() => {
      let text = c.description;
      for (const key in formData) {
        text = text.replaceAll(`{${key}}`, formData[key] || `{${key}}`);
      }
      return text;
    }, [formData, c.description]);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Background */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setSelectedCase(null)}
        />

        {/* Modal window */}
        <div className="relative bg-white w-full md:w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-lg p-6 animate-fadeIn">
          <button
            className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl"
            onClick={() => setSelectedCase(null)}
          >
            ✕
          </button>

          <h2 className="text-xl font-bold text-blue-700 mb-2">{c.title}</h2>
          {c.category && (
            <div className="text-xs text-gray-500 mb-3">{c.category}</div>
          )}

          <div className="mb-4">
            <h3 className="font-medium mb-1">Apraksts:</h3>
            <p className="text-gray-700 whitespace-pre-line mb-2 text-sm">
              {filledDescription}
            </p>

            <div className="flex flex-wrap gap-2">
  <button
    className="px-2 py-1 text-xs sm:text-sm bg-blue-600 text-white rounded-md sm:rounded-lg hover:bg-blue-700 transition"
    onClick={() => copyWithToast(filledDescription)}
  >
    📋 Kopēt
  </button>

  <button
    className="px-2 py-1 text-xs sm:text-sm bg-gray-600 text-white rounded-md sm:rounded-lg hover:bg-gray-700 transition"
    onClick={() => setShowForm((s) => !s)}
  >
    ✏️ {showForm ? "Paslēpt" : "Veidne"}
  </button>
</div>

          </div>

          {showForm && (
            <div className="border-t pt-3 mt-4">
              <h3 className="font-medium text-blue-700 mb-2">Aizpildīt veidni</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {fields.map((f) => (
                  <input
                    key={f}
                    type="text"
                    value={formData[f] || ""}
                    onChange={(e) => handleChange(f, e.target.value)}
                    placeholder={f}
                    className="border rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-medium mb-2">Panti:</h3>
            {Array.isArray(c.articles) && c.articles.length > 0 ? (
              c.articles.map((a) => (
                <div
                  key={a.id ?? a.text}
                  className="flex justify-between items-center bg-gray-50 border rounded-lg px-3 py-2 mb-2"
                >
                  <span className="text-sm">{a.text}</span>
                  <button
                    className="text-blue-600 text-sm font-medium hover:underline"
                    onClick={() => copyWithToast(a.text)}
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
  };

  // 🧩 Galvenā struktūra
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/90 border-b sticky top-0 z-50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full px-4 sm:px-10 py-3 gap-2">
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
            {/* Meklēšana */}
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
                <span className="text-sm text-gray-500">
                  Atrasti: {filteredCases.length}
                </span>
              </div>
            </div>

            {/* Kategorijas */}
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

            {/* Notikumu kartiņas */}
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
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Resursi
            </h2>
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
