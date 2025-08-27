export default function PreviewSection({
  jsonData,
  mappedData,
  viewMode,
  setViewMode,
}) {
  const dataToShow = mappedData.length > 0 ? mappedData : jsonData;
  if (!dataToShow.length) return null;

  const firstSheet = dataToShow[0];
  const sampleData = firstSheet.data.slice(0, 10);
  const allColumns = Object.keys(sampleData[0] || {});

  return (
    <div className="card preview-section">
      <div className="card-content">
        <h4 className="flex justify-between">
          Veri Önizleme
          <div className="view-mode-buttons">
            <button
              onClick={() => setViewMode("table")}
              className={viewMode === "table" ? "active" : ""}
            >
              🗂️ Tablo
            </button>
            <button
              onClick={() => setViewMode("json")}
              className={viewMode === "json" ? "active" : ""}
            >
              📝 JSON
            </button>
          </div>
        </h4>

        {viewMode === "table" ? (
          <div className="table-wrapper">
            <table className="preview-table">
              <thead>
                <tr>
                  {allColumns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row, i) => (
                  <tr key={i}>
                    {allColumns.map((col) => (
                      <td key={col}>{row[col] ?? "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {firstSheet.data.length > 10 && (
              <p>... ve {firstSheet.data.length - 10} satır daha</p>
            )}
          </div>
        ) : (
          <pre>{JSON.stringify(dataToShow, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
