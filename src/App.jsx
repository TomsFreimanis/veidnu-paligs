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

  useEffect(() => setQuery(""), [activeCategory]);

  // ✅ Komponents: aizpildāmā veidne
  function FillableTemplate({ template }) {
    const [fields, setFields] = useState({});

    const placeholders = Array.from(template.matchAll(/{(.*?)}/g)).map((m) => m[1]);

    const result = placeholders.reduce((txt, key) => {
      return txt.replaceAll(`{${key}}`, fields[key] || `(${key})`);
    }, template);

    return (
      <div className="mt-4 border-t pt-3">
        <h3 className="font-semibold mb-2 text-blue-700">Aizpildīt veidni</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {placeholders.map((p) => (
            <input
              key={p}
              placeholder={p}
              className="border rounded-lg p-2 text-sm"
              onChange={(e) => setFields((f) => ({ ...f, [p]: e.target.value }))}
            />
          ))}
        </div>
        <textarea
          readOnly
          value={result}
          className="w-full border rounded-lg p-2 text-sm h-48 whitespace-pre-line"
        />
        <button
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => copyWithToast(result)}
        >
          📋 Kopēt aizpildīto tekstu
        </button>
      </div>
    );
  }

  // ✅ Notikuma karte
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

  // ✅ Notikuma detaļu logs
  const CaseDetails = ({ c }) => {
    const [showFill, setShowFill] = useState(false);
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedCase(null)} />
        <div className="absolute inset-x-0 bottom-0 md:inset-0 md:m-auto md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl shadow-lg p-6 overflow-y-auto max-h-[95vh]">
          <button
            className="absolute top-3 right-4 text-gray-500 hover:text-gray-800"
            onClick={() => setSelectedCase(null)}
            aria-label="Aizvērt"
          >
            ✕
          </button>

          <h2 className="text-xl font-bold text-blue-700 mb-1">{c.title}</h2>
          {c.category && <div className="text-xs text-gray-500 mb-3">{c.category}</div>}

          <div className="mb-4">
            <h3 className="font-medium mb-1">Apraksts</h3>
            <p className="text-gray-700 mb-2 whitespace-pre-line">{c.description}</p>
           <button
  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 shadow-md w-full md:w-auto transition"
  onClick={() => copyWithToast(c.description)}
>
  📋 Kopēt aprakstu
</button>

            <button
              className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
              onClick={() => setShowFill((s) => !s)}
            >
              ✏️ {showFill ? "Paslēpt formu" : "Aizpildīt veidni"}
            </button>
            {showFill && <FillableTemplate template={c.description} />}
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
              <div className="text-sm text-gray-500">Pantu saraksts nav pievienots.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ✅ Peldošā ātrās informācijas poga
  const QuickInfoButton = () => {
    const [open, setOpen] = useState(false);
    const quickItems = [
      { id: "rights", label: "Tiesības un pienākumi" },
      { id: "mitigating", label: "Mīkstinoši apstākļi" },
      { id: "aggravating", label: "Pastiprinoši apstākļi" },
    ];

    const findText = (id) =>
      resources.find((r) => r.id === id)?.text || "Nav pievienots saturs.";

    return (
      <>
        <button
          onClick={() => setOpen((o) => !o)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg hover:bg-blue-700 transition flex items-center justify-center text-2xl z-50"
        >
          ℹ️
        </button>

        {open && (
          <div className="fixed bottom-24 right-6 bg-white border shadow-xl rounded-2xl p-4 w-72 max-h-[60vh] overflow-auto z-50">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">Ātrā informācija</h3>
            {quickItems.map((item) => (
              <div key={item.id} className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{item.label}</span>
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => copyWithToast(findText(item.id))}
                  >
                    Kopēt
                  </button>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{findText(item.id)}</p>
              </div>
            ))}
            <div className="text-right mt-4">
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Aizvērt
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  // ✅ Galvenais izkārtojums
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-[260px,1fr] gap-4 p-4 md:p-6">
        <aside className="bg-white border rounded-2xl p-4 shadow-sm h-fit sticky top-4">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Veidņu palīgs</h2>
          <nav className="space-y-2 mb-6">
            <button
              className={`block w-full text-left px-3 py-2 rounded-lg ${
                activeView === "cases"
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveView("cases")}
            >
              Notikumi
            </button>
            <button
              className={`block w-full text-left px-3 py-2 rounded-lg ${
                activeView === "resources"
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveView("resources")}
            >
              Resursi
            </button>
          </nav>

          {activeView === "cases" && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Kategorijas</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`px-3 py-1 rounded-full border text-sm ${
                      activeCategory === cat
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>

        <main className="bg-white border rounded-2xl p-6 shadow-sm overflow-hidden">
          {activeView === "cases" && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Meklēt nosaukumā, aprakstā vai pantos..."
                  className="w-full md:w-2/3 border rounded-lg px-3 py-2"
                />
                <button
                  onClick={() => setQuery("")}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Notīrīt
                </button>
                <div className="ml-auto text-sm text-gray-500">
                  Atrasti: {filteredCases.length}
                </div>
              </div>

              {filteredCases.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  Nav atbilstošu lietu. Mainiet kategoriju vai meklēšanas frāzi.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredCases.map((c) => (
                    <CaseCard key={c.id} c={c} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeView === "resources" && (
            <>
              <div className="space-y-4">
                {resources.map((r) => (
                  <div
                    key={r.id}
                    className="bg-gray-50 border rounded-xl p-4 hover:shadow-sm transition"
                  >
                    <h4 className="text-base font-semibold text-blue-700 mb-1">
                      {r.title}
                    </h4>
                    <p className="text-gray-700 mb-2 whitespace-pre-line">{r.text}</p>
                    <button
                      onClick={() => copyWithToast(r.text || "")}
                      className="text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Kopēt tekstu
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {selectedCase && <CaseDetails c={selectedCase} />}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm z-[60]">
          {toast}
        </div>
      )}

      <QuickInfoButton />
    </div>
  );
}
