import React from "react";
import { Upload, Info } from "lucide-react";
import { Tooltip } from "react-tooltip";

const UploadSection = ({ handleFileUpload, isLoading, cardInfos }) => {
  return (
    <div className="card upload-section">
      <div className="card-content">
        <h2 className="flex items-center gap-3">
          <Upload size={24} />
          Excel Dosyası Yükle
          <a
            href="/ornek-excel.xlsx"
            download="ornek-excel.xlsx"
            className="sample-link"
          >
            📂 Örnek Excel Dosyası
          </a>
        </h2>
        <span data-tooltip-id="upload-info" className="card-info-icon">
          <Info size={18} />
        </span>
        <Tooltip
          id="upload-info"
          place="right"
          className="custom-tooltip"
          effect="solid"
        >
          {cardInfos.upload}
        </Tooltip>

        <div className="upload-zone">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".xlsx,.xls"
            disabled={isLoading}
            className="upload-input"
            id="fileInput"
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
};

export default UploadSection;
