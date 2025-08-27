import { Check, Eye, EyeOff, Info } from "lucide-react";
import { Tooltip } from "react-tooltip";

export default function MappingSection({
  excelHeaders,
  headerMapping,
  setHeaderMapping,
  applyMapping,
  showMappedOnly,
  setShowMappedOnly,
  dbFields,
  isLoading,
}) {
  const updateMapping = (excelHeader, dbField) => {
    setHeaderMapping((prev) => ({ ...prev, [excelHeader]: dbField }));
  };

  const filteredHeaders = showMappedOnly
    ? excelHeaders.filter((h) => !headerMapping[h])
    : excelHeaders;

  return (
    <div className="card mapping-section">
      <div className="card-content">
        <h3 className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Check size={24} /> Başlık Eşleme
          </span>
          <button
            onClick={() => setShowMappedOnly(!showMappedOnly)}
            className="filter-button"
          >
            {showMappedOnly ? <EyeOff size={16} /> : <Eye size={16} />}
            {showMappedOnly ? "Tümünü Göster" : "Eşlenmeyenleri Göster"}
          </button>
        </h3>

        <span data-tooltip-id="map-info" className="card-info-icon">
          <Info size={18} />
        </span>
        <Tooltip id="map-info">
          📑 Başlıkları eşleyin. Boş bırakırsanız Excel başlığı ile kaydedilir.
        </Tooltip>

        <div className="mapping-grid">
          {filteredHeaders.map((header) => (
            <div
              key={header}
              className={`mapping-item ${
                headerMapping[header] ? "mapped" : ""
              }`}
            >
              <div className="mapping-item-header">
                <span>📋 {header}</span>
                {headerMapping[header] && <Check size={16} />}
              </div>
              <select
                value={headerMapping[header] || ""}
                onChange={(e) => updateMapping(header, e.target.value)}
                disabled={isLoading}
              >
                <option value="">-- Excel başlığı ile kaydet --</option>
                {Object.entries(dbFields).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label} ({key})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button
          onClick={applyMapping}
          disabled={isLoading}
          className="apply-mapping-button"
        >
          {isLoading ? "Uygulanıyor..." : "🔄 Eşlemeyi Uygula"}
        </button>
      </div>
    </div>
  );
}
