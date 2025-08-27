import React from "react";
import { Download } from "lucide-react";
import { Tooltip } from "react-tooltip";

export default function SaveSection({
  saveToBackend,
  isLoading,
  isMappingApplied,
  cardInfos,
}) {
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
      <span data-tooltip-id="upload-info" className="card-info-icon" />
      <Tooltip
        id="upload-info"
        place="right"
        className="custom-tooltip"
        effect="solid"
      >
        {cardInfos.save}
      </Tooltip>
    </div>
  );
}
