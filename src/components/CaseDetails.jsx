import { useMemo, useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

export default function CaseDetails({ c, onClose }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState("");

  // ======== Lauku padomi ========
  const fieldHints = {
    datums: { label: "Datums", example: "09.11.2025" },
    laiks: { label: "Laiks", example: "12:04" },
    adrese: { label: "Adrese", example: "Rīga, Brīvības laukums 1" },
    pilsonis: { label: "Persona", example: "Jānis Bērziņš" },
    personas_kods: { label: "Personas kods", example: "010199-12345" },
    dzimsanas_datums: { label: "Dzimšanas datums", example: "01.01.1999" },
    dzivesvieta: { label: "Dzīvesvieta", example: "Rīga, Daugavas iela 5" },
    epasts: { label: "E-pasts", example: "janis@inbox.lv" },
    kamera_vieta: { label: "Kameras vieta", example: "Brīvības piemineklis" },
    kamera_nr: { label: "Kameras Nr.", example: "213123" },
  };

  // Automātiska datuma/laika aizpilde
  useEffect(() => {
    setFormData((f) => ({
      ...f,
      datums: new Date().toLocaleDateString("lv-LV"),
      laiks: new Date().toLocaleTimeString("lv-LV", { hour: "2-digit", minute: "2-digit" }),
    }));
  }, []);

  const fields = useMemo(() => {
    const text = c.description || c.example_output || "";
    const matches = Array.from(text.matchAll(/\{(.*?)\}/g)).map((m) => m[1]);
    return matches.length ? [...new Set(matches)] : Object.keys(fieldHints);
  }, [c]);

  const handleChange = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const filledDescription = useMemo(() => {
    let text = c.example_output || c.description || "";
    for (const key in formData) {
      text = text.replaceAll(`{${key}}`, formData[key] || `{${key}}`);
    }
    return text;
  }, [formData, c]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const copyWithToast = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("✅ Nokopēts!");
    } catch {
      showToast("❌ Neizdevās kopēt!");
    }
  };

  // ======== SODS ========
  const wordToNumber = (w) => {
    const map = {
      viens: 1, viena: 1, vienu: 1,
      divi: 2, divu: 2,
      trīs: 3, tris: 3,
      četri: 4, cetri: 4,
      pieci: 5,
      seši: 6, sesi: 6,
      septiņi: 7,
      astoņi: 8,
      deviņi: 9,
      desmit: 10,
      simts: 100,
      tūkstots: 1000,
    };
    return map[w] || null;
  };

  const num = (token) => (/^\d+$/.test(token) ? parseInt(token) : wordToNumber(token));

  const extractFineFromArticle = (text) => {
    const t = text.toLowerCase();
    if (t.includes("juridisk")) return 0;
    let maxFine = 0;
    const range = t.match(/no\s([a-zāčēģīķļņōŗšūž]+|\d+)\s(?:līdz|lidz)\s([a-zāčēģīķļņōŗšūž]+|\d+)\snaudas/);
    if (range) maxFine = Math.max(maxFine, num(range[2]) || 0);
    const lidz = t.match(/līdz\s([a-zāčēģīķļņōŗšūž]+|\d+)\snaudas/);
    if (lidz) maxFine = Math.max(maxFine, num(lidz[1]) || 0);
    if (t.includes("brīdinājumu") && maxFine === 0) maxFine = 1;
    return maxFine;
  };

  const totalFine = useMemo(() => {
    if (c.fine) return c.fine;
    if (!Array.isArray(c.articles)) return 0;
    let max = 0;
    for (const a of c.articles) {
      const v = a.fine || extractFineFromArticle(a.text || "");
      if (v > max) max = v;
    }
    return max;
  }, [c]);

  const fineLabel =
    c.fine_text ||
    (totalFine
      ? totalFine === 1
        ? "⚠️ Brīdinājums vai naudas sods"
        : `💶 Līdz ${totalFine} vienībām (~${totalFine * 5} €)`
      : null);

  // ======== UI ========
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 50, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="relative bg-white/90 backdrop-blur-lg border border-white/50 rounded-2xl 
                     w-full md:w-[700px] max-h-[90vh] overflow-y-auto shadow-2xl p-6"
        >
          <button
            className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl transition"
            onClick={onClose}
          >
            ✕
          </button>

          <h2 className="text-xl font-bold text-blue-700 mb-1">{c.title}</h2>
          <div className="text-sm text-gray-500 mb-3">{c.category}</div>

          {fineLabel && (
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 
                            border border-green-200 rounded-lg px-3 py-2">
              {fineLabel}
            </div>
          )}

          <p className="text-gray-700 whitespace-pre-line mb-4 text-sm leading-relaxed">
            {filledDescription}
          </p>

          <div className="flex flex-wrap gap-3 mb-5">
            <button
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 
                         text-white rounded-lg transition shadow-sm hover:shadow-md active:scale-95"
              onClick={() => copyWithToast(filledDescription)}
            >
              📋 Kopēt
            </button>
            <button
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-800 
                         text-white rounded-lg transition shadow-sm hover:shadow-md active:scale-95"
              onClick={() => setShowForm((s) => !s)}
            >
              ✏️ {showForm ? "Paslēpt laukus" : "Aizpildīt laukus"}
            </button>
          </div>

          {showForm && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {fields.map((f) => {
                const hint = fieldHints[f];
                return (
                  <div key={f} className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">{hint?.label || f}</label>
                    <input
                      type="text"
                      value={formData[f] || ""}
                      onChange={(e) => handleChange(f, e.target.value)}
                      placeholder={hint?.example || f}
                      className="border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 
                                 focus:ring-blue-500 outline-none"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <h3 className="font-semibold text-gray-800 mb-3 text-base">📘 Panti:</h3>
          {Array.isArray(c.articles) && c.articles.length > 0 ? (
            c.articles.map((a) => (
              <div
                key={a.id ?? a.text}
                className="bg-gray-50/70 border border-gray-200 rounded-xl px-4 py-3 mb-3 shadow-sm 
                           hover:shadow-md transition-all flex justify-between items-center gap-3"
              >
                <span className="text-sm text-gray-700 leading-snug">{a.text}</span>
                <button
                  onClick={() => copyWithToast(a.text)}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-medium border border-blue-500 
                             text-blue-600 rounded-md hover:bg-blue-50 transition-colors active:scale-95 shadow-sm"
                >
                  📋 Kopēt
                </button>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">Pantu saraksts nav pievienots.</div>
          )}
        </motion.div>

        {/* Toast ziņojums */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-6 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
