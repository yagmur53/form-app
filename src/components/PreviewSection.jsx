import React from "react";
import { Info } from "lucide-react";
import { Tooltip } from "react-tooltip";

export default function PreviewSection({
  mappedData,
  jsonData,
  viewMode,
  setViewMode,
  cardInfos,
}) {
  const renderTableView = () => {
    const dataToShow = mappedData.length > 0 ? mappedData : jsonData;
    if (!dataToShow.length) return null;

    const firstSheet = dataToShow[0];
    const sampleData = firstSheet.data.slice(0, 10);

    if (!sampleData.length) return <p>Gösterilecek veri yok</p>;

    const allColumns = Object.keys(sampleData[0] || {});

    return (
      <div className="preview-wrapper">
        <div className="table-info-header">
          <span>
            📋 <strong>{firstSheet.sheetName}</strong> | Toplam:{" "}
            <strong>{firstSheet.data.length}</strong> satır | Gösterilen:{" "}
            <strong>{sampleData.length}</strong> satır
          </span>
        </div>

        <div className="table-wrapper">
          <table className="preview-table">
            <thead>
              <tr>
                {allColumns.map((column, index) => (
                  <th key={index}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {allColumns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {row[column] !== null && row[column] !== undefined
                        ? typeof row[column] === "object"
                          ? JSON.stringify(row[column])
                          : String(row[column])
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {firstSheet.data.length > 10 && (
          <div className="table-footer">
            ... ve {firstSheet.data.length - 10} satır daha
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card preview-section fade-in">
      <div className="card-content">
        <h4>
          Veri Önizleme
          <div className="view-mode-buttons">
            <button
              onClick={() => setViewMode("table")}
              className={`view-mode-button ${
                viewMode === "table" ? "active" : ""
              }`}
            >
              🗂️ Tablo
            </button>
            <button
              onClick={() => setViewMode("json")}
              className={`view-mode-button ${
                viewMode === "json" ? "active" : ""
              }`}
            >
              📝 JSON
            </button>
          </div>
        </h4>

        <span data-tooltip-id="upload-info" className="card-info-icon">
          <Info size={18} />
        </span>
        <Tooltip
          id="upload-info"
          place="right"
          className="custom-tooltip"
          effect="solid"
        >
          {cardInfos.preview}
        </Tooltip>

        {viewMode === "table" ? (
          renderTableView()
        ) : (
          <pre className="json-preview">
            {JSON.stringify(
              mappedData.length > 0 ? mappedData : jsonData,
              null,
              2
            )}
          </pre>
        )}
      </div>
    </div>
  );
}
