import React from "react";

const SummarySection = ({
  mappedData,
  headerMapping,
  dbFields,
  excelHeaders,
}) => {
  if (mappedData.length === 0) return null;

  return (
    <div className="card summary-section fade-in">
      <div className="card-content">
        <h5>✅ Eşleme Özeti</h5>
        <div className="summary-grid">
          {Object.entries(headerMapping).map(([excel, db]) => (
            <div key={excel} className="summary-item">
              <span className="excel-name">{excel}</span>
              <span className="arrow">→</span>
              <span className="db-name">
                {dbFields[db] || db} ({db})
              </span>
            </div>
          ))}

          {/* Eşleşmeyen alanları göster */}
          {excelHeaders
            .filter((header) => !headerMapping[header])
            .map((header) => (
              <div key={header} className="summary-item unmapped">
                <span className="excel-name">{header}</span>
                <span className="arrow">→</span>
                <span className="db-name">Excel başlığı ile kaydedilecek</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SummarySection;
