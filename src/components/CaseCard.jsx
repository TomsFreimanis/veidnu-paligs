import React, { useMemo } from "react";

export default function CaseCard({ c, onClick }) {
  const wordToNumber = (w) => {
    const map = {
      viens: 1, viena: 1, vienu: 1,
      divi: 2, divu: 2,
      trīs: 3, tris: 3,
      četrpadsmit: 14, piecdesmit: 50, septiņdesmit: 70,
      simt: 100, simts: 100,
    };
    return map[w] || null;
  };
  const num = (token) => (/^\d+$/.test(token) ? parseInt(token) : wordToNumber(token));

  const extractFineFromArticle = (text) => {
    const t = text.toLowerCase();
    if (t.includes("juridisk")) return 0;
    let maxFine = 0;

    const lidz = t.match(/līdz\s([a-zāčēģīķļņōŗšūž]+|\d+)\snaudas/);
    if (lidz) maxFine = Math.max(maxFine, num(lidz[1]) || 0);

    const apmera = t.match(/([a-zāčēģīķļņōŗšūž]+|\d+)\snaudas\s(?:soda\s)?vienību\sapmērā/);
    if (apmera) maxFine = Math.max(maxFine, num(apmera[1]) || 0);

    if (t.includes("brīdinājumu") && maxFine === 0) maxFine = 1;

    return maxFine;
  };

  const totalFine = useMemo(() => {
    if (c.fine) return c.fine;
    if (!Array.isArray(c.articles)) return 0;
    let max = 0;
    for (const a of c.articles) {
      const v = extractFineFromArticle(a.text || "");
      if (v > max) max = v;
    }
    return max;
  }, [c]);

  const fineLabel =
    totalFine === 0
      ? null
      : totalFine === 1
      ? "⚠️ Brīdinājums vai naudas sods"
      : `💶 Līdz ${totalFine} vienībām (~${totalFine * 5} €)`;

  return (
    <div
      onClick={() => onClick(c)}
      className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-4 cursor-pointer relative"
    >
      {fineLabel && (
        <div className="absolute top-2 left-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-2 py-1">
          {fineLabel}
        </div>
      )}
      <h3 className="font-semibold text-blue-700 mb-2 pt-5">{c.title}</h3>
      <p className="text-xs text-gray-500 mb-1">{c.category}</p>
      <p className="text-sm text-gray-700 line-clamp-4">{c.description}</p>
      <div className="flex justify-end mt-3">
        <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md">📋 Kopēt</button>
      </div>
    </div>
  );
}
