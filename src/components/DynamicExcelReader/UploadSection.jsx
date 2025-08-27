import { Upload, Info } from "lucide-react";
import { Tooltip } from "react-tooltip";

export default function UploadSection({ onFileUpload, isLoading }) {
  return (
    <div className="card upload-section">
      <div className="card-content">
        <h2 className="flex items-center gap-3">
          <Upload size={24} /> Excel Dosyası Yükle
          <a href="/ornek-excel.xlsx" download className="sample-link">
            📂 Örnek Excel
          </a>
        </h2>
        <span data-tooltip-id="upload-info" className="card-info-icon">
          <Info size={18} />
        </span>
        <Tooltip id="upload-info">📂 Excel dosyanızı seçip yükleyin.</Tooltip>

        <div className="upload-zone">
          <input
            type="file"
            id="fileInput"
            onChange={onFileUpload}
            accept=".xlsx,.xls"
            hidden
          />
          <label
            htmlFor="fileInput"
            className={`upload-button ${isLoading ? "disabled" : ""}`}
          >
            {isLoading ? "Yükleniyor..." : "Dosya Seç"}
          </label>
        </div>
      </div>
    </div>
  );
}
