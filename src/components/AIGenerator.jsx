import { useState } from "react";
import { openai } from "../utils/openaiClient";
import casesData from "../data/cases.json";
import trainingData from "../data/training_examples.json";
import { normalizeCases } from "../utils/normalizeCases";

export default function AIGenerator({ setToast, setSelectedCase }) {
  const [inputText, setInputText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchedCase, setMatchedCase] = useState(null);
  const [fineText, setFineText] = useState(null);
  const [autoFormData, setAutoFormData] = useState({});

  const cases = normalizeCases(casesData);

  // 🔑 Sinonīmu / locījumu aizvietojumi
  const synonyms = {
    "pieminekļa": "piemineklis",
    "pieminekli": "piemineklis",
    "piemineklis": "piemineklis",
    "necieņu": "necieņa",
    "necieņa": "necieņa",
    "smēķēja": "smēķēšana",
    "pīpēja": "smēķēšana",
    "smēķē": "smēķēšana",
    "dzēra": "alkohols",
    "dzērienu": "alkohols",
    "dzēriens": "alkohols",
    "rotaļu": "rotaļlaukums",
    "rotaļlaukumā": "rotaļlaukums",
    "rotaļlaukums": "rotaļlaukums",
    "parka": "parks",
    "parkā": "parks",
    "skvērā": "parks",
    "skvērs": "parks",
  };

  // 🔍 Pārkāpuma meklēšana
  const findMatchingCase = (text) => {
    let normalized = text.toLowerCase();
    for (const [from, to] of Object.entries(synonyms)) {
      normalized = normalized.replaceAll(from, to);
    }

    let bestMatch = null;
    let bestScore = 0;

    for (const c of cases) {
      const title = c.title.toLowerCase();
      const category = c.category.toLowerCase();
      let score = 0;

      if (normalized.includes(title)) score += 5;
      if (normalized.includes(category)) score += 3;

      const words = title.split(/[ ,()]+/);
      for (const w of words) {
        if (w.length > 4 && normalized.includes(w)) score++;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = c;
      }
    }

    return bestScore >= 2 ? bestMatch : null;
  };

  // 💰 Soda apmēra noteikšana
  const extractFineFromArticles = (articles = []) => {
    for (const a of articles) {
      if (a.text.toLowerCase().includes("naudas sodu")) {
        const match = a.text.match(/naudas sodu[^.]+[\.]/i);
        if (match) return match[0];
      }
    }
    return null;
  };

  // 🧩 Automātiska lauku atpazīšana no ģenerētā teksta
  const extractFieldsFromText = (text) => {
    const result = {};
    const patterns = {
      datums: /\b(\d{4}\.\s*\w+\s*\d{1,2}|\d{1,2}\.\d{1,2}\.\d{4})\b/i,
      laiks: /\b(\d{1,2}[:.]\d{2})\b/,
      adrese: /(rīga|iela|bulvāris|iela\s+\d+)/i,
      epasts: /[\w.-]+@[\w.-]+\.\w+/i,
      pilsonis: /\b[a-zāčēģīķļņšūž]+ [a-zāčēģīķļņšūž]+/i,
      kamera: /kamera\s?[a-z0-9\-]+/i,
      axis_nr: /axis\s?[a-z0-9\-]+/i,
    };
    for (const [key, regex] of Object.entries(patterns)) {
      const match = text.match(regex);
      if (match) result[key] = match[0];
    }
    return result;
  };

  // 🤖 AI ģenerēšana
  const generateDescription = async () => {
    if (!inputText.trim()) return setToast("Ievadi aprakstu vispirms!");
    try {
      setLoading(true);
      setGeneratedText("⏳ Ģenerēju...");
      setMatchedCase(null);
      setFineText(null);
      setAutoFormData({});

      const now = new Date();
      const date = now.toLocaleDateString("lv-LV", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const time = now.toLocaleTimeString("lv-LV", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const fullPrompt = `
Tu esi Latvijas administratīvo pārkāpumu procesa asistents.

Izveido juridiska stila aprakstu par šo notikumu:
"${inputText}"

Izmanto šodienas datumu un laiku:
🗓 Datums: ${date}
🕒 Laiks: ${time}

Pamato aprakstu ar likumiem tikai no vietnes https://likumi.lv
Neizdomā jaunus pantus.

Formatē līdzīgi kā šajos piemēros:
${trainingData.map((t) => t.example_output).join("\n\n")}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Tu esi Latvijas likumu asistenta sistēma." },
          { role: "user", content: fullPrompt },
        ],
        temperature: 0.2,
      });

      const result = completion.choices[0].message.content;
      setGeneratedText(result);

      const match = findMatchingCase(inputText + " " + result);
      if (match) {
        console.log("✅ Atrasts pārkāpums:", match.title);
        setMatchedCase(match);

        const fine = extractFineFromArticles(match.articles);
        if (fine) setFineText(fine);

        const fields = extractFieldsFromText(inputText + " " + result);
        setAutoFormData(fields);
      } else {
        console.log("❌ Pārkāpums netika atrasts");
      }
    } catch (e) {
      console.error(e);
      setGeneratedText("❌ Kļūda ģenerējot aprakstu");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text) => {
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
    <div className="bg-white/80 border rounded-2xl shadow-sm p-5 mb-6">
      <h3 className="font-semibold text-blue-700 mb-2">
        🤖 Automātiska apraksta ģenerēšana
      </h3>

      <input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Ieraksti īsu notikuma aprakstu..."
        className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
      />

      <button
        onClick={generateDescription}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        {loading ? "Ģenerēju..." : "Ģenerēt aprakstu"}
      </button>

      {generatedText && (
        <div className="mt-4 bg-gray-50 border rounded-lg p-3 text-sm whitespace-pre-line">
          {generatedText}

          <div className="mt-3 flex justify-end">
            <button
              onClick={() => copyText(generatedText)}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md"
            >
              📋 Kopēt
            </button>
          </div>

          {matchedCase && (
            <>
              <hr className="my-4 border-gray-300" />

              <div className="mt-2">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-green-600 text-lg">✅</span>
                  <h4 className="font-semibold text-blue-700">
                    Atrasts pārkāpums: {matchedCase.title}
                  </h4>
                </div>

                {fineText && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-3 rounded-md text-sm mb-3">
                    💰 <strong>Soda apmērs:</strong> {fineText}
                  </div>
                )}

                <h5 className="font-medium text-gray-700 mb-2">
                  🧾 Panti, kas attiecas uz šo pārkāpumu:
                </h5>

                {matchedCase.articles?.length > 0 ? (
                  matchedCase.articles.map((a) => (
                    <div
                      key={a.id ?? a.text}
                      className="flex justify-between items-start bg-gray-50 border rounded-lg px-3 py-2 mb-2 shadow-sm"
                    >
                      <span className="text-sm">{a.text}</span>
                      <button
                        onClick={() => copyText(a.text)}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        📋
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">
                    Šim pārkāpumam pantu saraksts nav pievienots.
                  </div>
                )}

                <button
                  onClick={() =>
                    setSelectedCase({
                      ...matchedCase,
                      autoFormData,
                    })
                  }
                  className="mt-4 w-full bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700"
                >
                  📄 Atvērt pārkāpuma karti
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
