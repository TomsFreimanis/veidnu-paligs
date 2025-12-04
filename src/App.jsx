import { useState } from "react";
import CaseList from "./components/CaseList";
import ResourceList from "./components/ResourceList";

import Toast from "./components/Toast";
import CaseDetails from "./components/CaseDetails";

export default function App() {
  const [activeView, setActiveView] = useState("cases");
  const [lang, setLang] = useState("lv");
  const [toast, setToast] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center px-6 py-3">
          <h1 className="text-xl font-bold text-blue-700">Veidņu palīgs</h1>

          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeView === "cases" ? "bg-blue-600 text-white" : "border"
              }`}
              onClick={() => setActiveView("cases")}
            >
              Notikumi
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeView === "resources" ? "bg-blue-600 text-white" : "border"
              }`}
              onClick={() => setActiveView("resources")}
            >
              Resursi
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {activeView === "cases" && (
          <>
        
           

            {/* 📂 Notikumu saraksts */}
            <CaseList setToast={setToast} setSelectedCase={setSelectedCase} />
          </>
        )}

        {activeView === "resources" && (
          <ResourceList lang={lang} setLang={setLang} />
        )}
      </main>

      {/* 🔔 Toast ziņojumi */}
      {toast && <Toast message={toast} />}

      {/* 🧾 Modālais logs ar pārkāpuma detaļām */}
      {selectedCase && <CaseDetails c={selectedCase} onClose={() => setSelectedCase(null)} />}
    </div>
  );
}
