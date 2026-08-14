import React from "react";
import { X, Download, FileText, FileSpreadsheet, SquareCode } from "lucide-react";

interface OutputItem {
  title: string;
  subtitle: string;
  meta: string;
  type: "pdf" | "code" | "spreadsheet";
}

interface OutputDetailScreenProps {
  onNavigate: (screen: string) => void;
  output: OutputItem | null;
}

const OutputDetailScreen: React.FC<OutputDetailScreenProps> = ({ onNavigate, output }) => {
  if (!output) return null;

  const handleDownload = () => alert(`Downloading: ${output.title}`);

  const getIconForType = () => {
    switch (output.type) {
      case "pdf":
        return FileText;
      case "spreadsheet":
        return FileSpreadsheet;
      case "code":
        return SquareCode;
      default:
        return FileText;
    }
  };

  const getIconColorForType = () => {
    switch (output.type) {
      case "pdf":
        return "var(--error-700)";
      case "spreadsheet":
        return "var(--success-700)";
      case "code":
        return "var(--purple-800)";
      default:
        return "var(--error-700)";
    }
  };

  const IconComponent = getIconForType();
  const iconColor = getIconColorForType();

  const tableRows = [
    { item: "Lead qualification calls", qty: "128", amount: "$4,220" },
    { item: "Converted opportunities", qty: "34", amount: "$18,900" },
    { item: "Follow-up sessions", qty: "76", amount: "$2,150" },
  ];

  const totalRevenue = "$25,270";

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Header bar with close and download */}
      <div className="w-full flex flex-row items-center justify-between px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={() => onNavigate("outputs")}
          className="cursor-pointer active:scale-95 transition-transform p-2"
          style={{ color: "var(--foreground)" }}
        >
          <X size={24} />
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="cursor-pointer active:scale-95 transition-transform p-2"
          style={{ color: "var(--purple-1000)" }}
        >
          <Download size={24} />
        </button>
      </div>

      {/* Title card container */}
      <div
        className="flex flex-row items-center gap-3 mx-auto px-4 mb-6"
        style={{ width: "320px", minHeight: "62px" }}
      >
        {/* PDF icon in 32x32 grey rounded square */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: "var(--grey-200)",
            borderRadius: "6px",
          }}
        >
          <IconComponent size={16} style={{ color: iconColor }} />
        </div>

        {/* Title, subtitle, date */}
        <div className="flex flex-col flex-1 min-w-0">
          <p
            className="text-sm font-semibold leading-tight truncate"
            style={{ color: "var(--foreground)" }}
          >
            {output.title}
          </p>
          <p
            className="text-xs mt-0.5 leading-tight truncate"
            style={{ color: "var(--muted-foreground)" }}
          >
            {output.subtitle}
          </p>
          <p
            className="text-xs mt-0.5 leading-tight"
            style={{ color: "var(--muted-foreground)" }}
          >
            {output.meta}
          </p>
        </div>
      </div>

      {/* Agent / Status section */}
      <div className="flex flex-row justify-between px-4 mb-6">
        <div className="flex flex-col">
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Agent
          </span>
          <span className="text-sm font-semibold mt-0.5" style={{ color: "var(--foreground)" }}>
            Revenue services
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Status
          </span>
          <span className="text-sm font-semibold mt-0.5" style={{ color: "var(--foreground)" }}>
            Completed
          </span>
        </div>
      </div>

      {/* Horizontal placeholder lines */}
      <div className="px-4 mb-6 flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              height: "8px",
              width: `${90 - i * 8}%`,
              backgroundColor: "var(--purple-100)",
              borderRadius: "4px",
            }}
          />
        ))}
      </div>

      {/* Table section */}
      <div className="flex flex-col px-4">
        {/* Table headers */}
        <div className="flex flex-row text-xs mb-2">
          <div className="flex-1" style={{ color: "var(--muted-foreground)" }}>
            Item
          </div>
          <div className="w-12 text-right" style={{ color: "var(--muted-foreground)" }}>
            Qty
          </div>
          <div className="w-20 text-right" style={{ color: "var(--muted-foreground)" }}>
            Amount
          </div>
        </div>

        {/* Table rows */}
        {tableRows.map((row) => (
          <div
            key={row.item}
            className="flex flex-row items-center py-2 text-sm font-medium"
            style={{ color: "var(--foreground)" }}
          >
            <div className="flex-1">{row.item}</div>
            <div className="w-12 text-right">{row.qty}</div>
            <div className="w-20 text-right">{row.amount}</div>
          </div>
        ))}

        {/* Divider */}
        <div className="my-3 w-full border-t" style={{ borderColor: "var(--grey-300)" }} />

        {/* Total revenue */}
        <div className="flex flex-col items-end mt-2 mb-4">
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Total revenue
          </span>
          <span className="text-lg font-bold" style={{ color: "var(--purple-1000)" }}>
            {totalRevenue}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OutputDetailScreen;
