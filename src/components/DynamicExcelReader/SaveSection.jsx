import React from "react";
import { Download } from "lucide-react";

const SaveSection = ({
  jsonData,
  mappedData,
  isLoading,
  isMappingApplied,
  saveToBackend,
}) => {
  if (jsonData.length === 0 && mappedData.length === 0) return null;

  return (
    <div className="save-section">
      <button
        onClick={saveToBackend}
        disabled={isLoading || !isMappingApplied}
        className={`save-button ${!isMappingApplied ? "disabled" : ""}`}
      >
        <Download size={20} />
        {isLoading ? "Kaydediliyor..." : "Veri Tabanına Kaydet"}
      </button>
    </div>
  );
};

export default SaveSection;
