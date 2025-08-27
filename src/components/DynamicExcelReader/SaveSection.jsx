import { Download } from "lucide-react";

export default function SaveSection({
  saveToBackend,
  isLoading,
  isMappingApplied,
}) {
  return (
    <div className="save-section">
      <button
        onClick={saveToBackend}
        disabled={isLoading || !isMappingApplied}
        className="save-button"
      >
        <Download size={20} />
        {isLoading ? "Kaydediliyor..." : "Veri Tabanına Kaydet"}
      </button>
    </div>
  );
}
