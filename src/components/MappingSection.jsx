import React from "react";
import { Check, Eye, EyeOff, Info } from "lucide-react";
import { Tooltip } from "react-tooltip";

export default function MappingSection({
  excelHeaders,
  headerMapping,
  updateMapping,
  dynamicDbFields,
  applyMapping,
  isLoading,
  showMappedOnly,
  setShowMappedOnly,
  cardInfos,
}) {
  const getFilteredHeaders = () => {
    if (!showMappedOnly) return excelHeaders;
    return excelHeaders.filter((header) => !headerMapping[header]);
  };

  return (
    <div className="card mapping-section fade-in">
      <div className="card-content">
        <h3>
          <div className="title-part">
            <Check size={24} />
            Başlık Eşleme
          </div>

          <button
            onClick={() => setShowMappedOnly(!showMappedOnly)}
            className={`filter-button ${showMappedOnly ? "active" : ""}`}
          >
            {showMappedOnly ? <EyeOff size={16} /> : <Eye size={16} />}
            {showMappedOnly ? "Tümünü Göster" : "Eşlenmeyenleri Göster"}
          </button>
        </h3>

        <span data-tooltip-id="upload-info" className="card-info-icon">
          <Info size={18} />
        </span>
        <Tooltip
          id="upload-info"
          place="right"
          className="custom-tooltip"
          effect="solid"
        >
          {cardInfos.mapping}
        </Tooltip>

        <div className="auto-mapping-info">
          <p>
            <strong>{Object.keys(headerMapping).length}</strong> adet otomatik
            eşleme yapıldı! Eşlenmeyen alanlar Excel başlığı ile aynen
            kaydedilecek.
          </p>
        </div>

        <div className="mapping-grid">
          {getFilteredHeaders().map((header) => {
            const isMapped = !!headerMapping[header];
            const mappedField = headerMapping[header];

            return (
              <div
                key={header}
                className={`mapping-item ${isMapped ? "mapped" : ""}`}
              >
                <div className="mapping-item-header">
                  <span className="excel-header-name">📋 {header}</span>
                  {isMapped && <Check size={16} />}
                </div>

                <select
                  value={mappedField || ""}
                  onChange={(e) => updateMapping(header, e.target.value)}
                  disabled={isLoading}
                  className={`mapping-select ${isMapped ? "mapped" : ""}`}
                >
                  <option value="">-- Excel başlığı ile kaydet --</option>
                  {Object.entries(dynamicDbFields).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label} ({key})
                    </option>
                  ))}
                </select>

                {!isMapped && (
                  <div className="unmapped-info">
                    📝 Bu alan "<strong>{header}</strong>" başlığı ile
                    kaydedilecek
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="apply-mapping-container">
          <button
            onClick={applyMapping}
            disabled={isLoading}
            className="apply-mapping-button"
          >
            {isLoading ? "Uygulanıyor..." : "🔄 Eşlemeyi Uygula"}
          </button>
        </div>
      </div>
    </div>
  );
}
