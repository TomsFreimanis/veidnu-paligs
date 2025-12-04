export function normalizeCases(data) {
  return data.map((c) => {
    const fields =
      c.fields ||
      Array.from(
        new Set(
          [...(c.description || "").matchAll(/\{(.*?)\}/g)].map((m) => m[1])
        )
      );
    return {
      ...c,
      fields,
      category: c.category || "Nezināma",
      articles: c.articles || [],
    };
  });
}
