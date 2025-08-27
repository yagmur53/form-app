export default function SummarySection({
  excelHeaders,
  headerMapping,
  dbFields,
}) {
  return (
    <div className="card summary-section">
      <div className="card-content">
        <h5>✅ Eşleme Özeti</h5>
        <div className="summary-grid">
          {Object.entries(headerMapping).map(([excel, db]) => (
            <div key={excel} className="summary-item">
              <span>{excel}</span> → <span>{dbFields[db] || db}</span>
            </div>
          ))}
          {excelHeaders
            .filter((h) => !headerMapping[h])
            .map((h) => (
              <div key={h} className="summary-item unmapped">
                <span>{h}</span> → Excel başlığı ile kaydedilecek
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
