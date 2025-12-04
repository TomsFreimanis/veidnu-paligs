import resourcesLV from "../data/resources.json";
import resourcesEN from "../data/resources_en.json";

export default function ResourceList({ lang, setLang }) {
  const data = lang === "lv" ? resourcesLV : resourcesEN;

  return (
    <section className="max-w-5xl mx-auto mt-4 space-y-6">
      {/* 🔘 Tulkojuma poga augšpusē */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setLang(lang === "lv" ? "en" : "lv")}
          className="px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow hover:scale-105 transition"
        >
          {lang === "lv" ? "EN" : "LV"}
        </button>
      </div>

      {data.map((group) => (
        <div
          key={group.id}
          className="bg-white/80 border rounded-2xl shadow-sm p-5"
        >
          <h3 className="text-lg font-bold text-blue-700 mb-3">
            {group.title}
          </h3>
          {group.items.map((item) => (
            <details key={item.id} className="border rounded mb-2">
              <summary className="cursor-pointer bg-gray-50 px-4 py-2 font-medium">
                {item.title}
              </summary>
              <div className="px-4 py-3 text-sm text-gray-700 bg-white whitespace-pre-line">
                {item.text}
              </div>
            </details>
          ))}
        </div>
      ))}
    </section>
  );
}
