export function autoMapHeaders(headers, dbFields) {
  const autoMapping = {};

  headers.forEach((excelHeader) => {
    const normalizedExcelHeader = excelHeader.toLowerCase().trim();

    Object.entries(dbFields).forEach(([dbKey, dbLabel]) => {
      const normalizedDbKey = dbKey.toLowerCase();
      const normalizedDbLabel = dbLabel.toLowerCase();

      if (
        normalizedExcelHeader === normalizedDbKey ||
        normalizedExcelHeader === normalizedDbLabel ||
        normalizedExcelHeader.includes(normalizedDbKey) ||
        normalizedDbLabel.includes(normalizedExcelHeader)
      ) {
        autoMapping[excelHeader] = dbKey;
      }
    });

    if (!autoMapping[excelHeader]) {
      const similarities = {
        name: "ad",
        title: "ad",
        başlık: "ad",
        isim: "ad",
        date: "baslama",
        tarih: "baslama",
        type: "tur",
        tür: "tur",
        participant: "katilimci",
        katılımcı: "katilimci",
        budget: "butce",
        butçe: "butce",
        cost: "butce",
        maliyet: "butce",
      };

      Object.entries(similarities).forEach(([keyword, dbKey]) => {
        if (normalizedExcelHeader.includes(keyword)) {
          if (dbFields[dbKey]) {
            autoMapping[excelHeader] = dbKey;
          }
        }
      });
    }
  });

  return autoMapping;
}
