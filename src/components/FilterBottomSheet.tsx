import React, { useRef, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

const defaultFromDate = "2026-05-08";
const defaultToDate = "2026-05-08";

const formatDisplayDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-");
  return month && day && year ? `${month}/${day}/${year}` : "";
};

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");

  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);

  const openFromPicker = () => {
    try {
      fromDateRef.current?.showPicker?.();
    } catch (e) {
      fromDateRef.current?.click();
    }
  };

  const openToPicker = () => {
    try {
      toDateRef.current?.showPicker?.();
    } catch (e) {
      toDateRef.current?.click();
    }
  };

  const applyPreset = (label: string) => {
    const today = new Date();
    const toValue = today.toISOString().split("T")[0];
    let fromValue = toValue;

    if (label === "1 week") {
      const priorWeek = new Date(today);
      priorWeek.setDate(today.getDate() - 7);
      fromValue = priorWeek.toISOString().split("T")[0];
    } else if (label === "1 month") {
      const priorMonth = new Date(today);
      priorMonth.setMonth(today.getMonth() - 1);
      fromValue = priorMonth.toISOString().split("T")[0];
    }

    setFromDate(fromValue);
    setToDate(toValue);
    setSelectedPreset(label);
  };

  const resetDateFilter = () => {
    setFromDate(defaultFromDate);
    setToDate(defaultToDate);
    setSelectedPreset("");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex flex-col justify-end transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full bg-[var(--background)] rounded-t-3xl px-4 pt-3 flex flex-col justify-between mx-auto shadow-xl transition-transform duration-300 ease-in-out"
        style={{ maxWidth: "min(375px, 100%)", paddingBottom: "max(var(--safe-bottom), 0.75rem)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div>
          {/* Drag handle */}
          <div
            className="w-full flex items-center justify-center py-2 cursor-pointer"
            onClick={onClose}
          >
            <div className="w-10 h-1.5 bg-[var(--grey-300)] rounded-full" />
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2">
              Filter by:
            </p>

            {/* Date header */}
            <div className="flex flex-row justify-between items-center mt-4 mb-2">
              <p className="text-sm font-bold text-[var(--foreground)]">Date</p>
              <button
                type="button"
                onClick={resetDateFilter}
                className="text-xs font-semibold text-[var(--purple-1000)] cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* From / To labels */}
            <div className="flex flex-row justify-between w-full mt-4 mb-1.5">
              <span className="text-xs font-semibold text-[var(--foreground)] w-1/2 text-left">
                From
              </span>
              <span className="text-xs font-semibold text-[var(--foreground)] w-1/2 text-left">
                To
              </span>
            </div>

            {/* Date pickers */}
            <div className="flex flex-row justify-between gap-3 mb-3">
              {/* From */}
              <div
                className="relative flex-1 h-[54px] border border-[var(--grey-300)] rounded-xl px-3 flex flex-row items-center justify-between bg-[var(--background)] cursor-pointer"
                onClick={openFromPicker}
              >
                <input
                  ref={fromDateRef}
                  type="date"
                  value={fromDate}
                  onChange={(event) => {
                    setFromDate(event.target.value);
                    setSelectedPreset("");
                  }}
                  className="absolute inset-0 opacity-0 pointer-events-none"
                />
                <span className="w-full text-xs font-medium text-[var(--foreground)]">
                  {formatDisplayDate(fromDate)}
                </span>
                <div className="w-10 h-10 bg-[var(--grey-300)] rounded-lg flex items-center justify-center flex-shrink-0 pointer-events-none">
                  <Calendar className="w-4 h-4 text-[var(--foreground)]" />
                </div>
              </div>

              {/* To */}
              <div
                className="relative flex-1 h-[54px] border border-[var(--grey-300)] rounded-xl px-3 flex flex-row items-center justify-between bg-[var(--background)] cursor-pointer"
                onClick={openToPicker}
              >
                <input
                  ref={toDateRef}
                  type="date"
                  value={toDate}
                  onChange={(event) => {
                    setToDate(event.target.value);
                    setSelectedPreset("");
                  }}
                  className="absolute inset-0 opacity-0 pointer-events-none"
                />
                <span className="w-full text-xs font-medium text-[var(--foreground)]">
                  {formatDisplayDate(toDate)}
                </span>
                <div className="w-10 h-10 bg-[var(--grey-300)] rounded-lg flex items-center justify-center flex-shrink-0 pointer-events-none">
                  <Calendar className="w-4 h-4 text-[var(--foreground)]" />
                </div>
              </div>
            </div>

            {/* Preset buttons */}
            <div className="flex flex-row justify-between gap-2 mb-4">
              {["Today", "1 week", "1 month"].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => applyPreset(label)}
                  className={`flex-1 h-11 rounded-xl flex items-center justify-center text-xs font-medium cursor-pointer transition-all ${
                    selectedPreset === label
                      ? "border border-[var(--purple-1000)] text-[var(--purple-1000)]"
                      : "border border-[var(--grey-300)] text-[var(--foreground)]"
                  } bg-white`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-full border-t border-[var(--grey-300)] my-4" />

            {/* Department header */}
            <div className="flex flex-row justify-between items-center mb-3">
              <p className="text-sm font-bold text-[var(--foreground)]">Department</p>
              <button
                type="button"
                onClick={() => setSelectedDepartment("")}
                className="text-xs font-semibold text-[var(--purple-1000)] cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Department dropdown */}
            <div className="relative w-full h-10 bg-[var(--grey-200)] rounded-xl">
              <div className="w-full h-full px-4 flex flex-row items-center justify-between pointer-events-none">
                <span className="text-xs font-medium text-[var(--foreground)]">
                  {selectedDepartment || "Select Department"}
                </span>
                <div className="w-6 h-6 bg-[var(--grey-400)] rounded-lg flex items-center justify-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-[var(--grey-700)]" />
                </div>
              </div>
              <select
                value={selectedDepartment}
                onChange={(event) => setSelectedDepartment(event.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                <option value="">Select Department</option>
                <option value="Sales">Sales</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Finance">Finance</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>
          </div>
        </div>

        {/* â”€â”€ Apply button â€” 343 Fill × 37 Hug, only corners rounded â”€â”€ */}
        <button
          type="button"
          onClick={() => {
            onApply();
            onClose();
          }}
          className="w-full rounded-xl border border-[var(--purple-1000)] text-[var(--purple-1000)] bg-transparent font-bold text-sm flex items-center justify-center cursor-pointer hover:bg-[var(--purple-1000)] hover:text-white transition-all"
          style={{
            maxWidth: "min(343px, 100%)",
            padding: "0.625rem 0",   /* vertical padding drives the 37 Hug height */
            marginTop: "1.5rem",
            marginBottom: "1rem",
            marginLeft: "auto",
            marginRight: "auto",
            alignSelf: "center",
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterBottomSheet;