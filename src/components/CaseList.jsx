import { useEffect, useMemo, useState } from "react";
import casesData from "../data/cases.json";

export default function CaseList({ setToast, setSelectedCase }) {
  const [cases, setCases] = useState([]);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Visas");

  // 🔹 Ielādē datus
  useEffect(() => {
    const unique = Array.from(new Map(casesData.map((c) => [c.id, c])).values());
    setCases(unique);
  }, []);

  // 🔹 Kategorijas
  const categories = useMemo(() => {
    const set = new Set(cases.map((c) => c.category).filter(Boolean));
    return ["Visas", ...Array.from(set)];
  }, [cases]);

  // 🔍 Filtrē gadījumus
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 🔍 Meklēšana */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Meklē pēc nosaukuma, apraksta vai panta..."
          className="w-full border border-gray-300 bg-white/90 backdrop-blur-md shadow-sm rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
      </div>

      {/* 🏷️ Kategorijas */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === cat
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 📄 Kartītes */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedCase(c)}
            className="bg-white/90 border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="p-5">
              <h3 className="text-base font-semibold text-indigo-700 mb-2">
                {c.title}
              </h3>

              <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line">
                {c.description}
              </p>
            </div>

            <div className="flex justify-between items-center bg-gray-50 border-t border-gray-100 px-4 py-2.5 rounded-b-2xl">
              <span className="text-xs text-gray-500 italic">{c.category}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyWithToast(c.description);
                }}
                className="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition"
              >
                📋 Kopēt
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-6 animate-fadeIn">
          Nekas netika atrasts 😔
        </div>
      )}
    </div>
  );
}
