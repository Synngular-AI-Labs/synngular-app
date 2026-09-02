import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Folder } from "lucide-react";
import SearchBar from "./SearchBar";
import { listProjects, type ApiProject, type ProjectStatus } from "../lib/api/project";
import { ApiError } from "../lib/api/client";

export type Project = ApiProject;

interface ProjectPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  organizationId: string | null;
}

// Only the 4 statuses the approved filter design shows chips for — projects
// coming back with PLANNING or CANCELLED (also valid per the API) simply
// won't match any of these and stay hidden until that's asked for.
const STATUS_LABELS: Partial<Record<ProjectStatus, string>> = {
  ACTIVE:    "Active",
  ARCHIVED:  "Archived",
  COMPLETED: "Completed",
  ON_HOLD:   "On hold",
};
const STATUS_OPTIONS = Object.values(STATUS_LABELS) as string[];

const SORT_OPTIONS = ["Last viewed", "Oldest", "Name A-Z", "Name Z-A"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

// ── FilterChip ────────────────────────────────────────────────────────────
// A pill that opens its own small options menu directly below itself —
// the "Active"/"Last viewed" controls in the filter row.
interface FilterChipProps {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ value, options, onChange, isOpen, onToggle }) => (
  <div className="relative">
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors touch-manipulation ${
        isOpen
          ? "bg-[var(--purple-1000)] border-[var(--purple-1000)] text-white"
          : "bg-[var(--background)] border-[var(--grey-300)] text-[var(--foreground)]"
      }`}
    >
      <span className="truncate max-w-[6.5rem]">{value}</span>
      <ChevronDown
        className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>

    {isOpen && (
      <div
        className="absolute left-0 z-10 min-w-[9.5rem] overflow-hidden rounded-xl border border-[var(--grey-200)] bg-white py-1 shadow-lg"
        style={{ top: "calc(100% + 0.375rem)" }}
      >
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors touch-manipulation ${
                selected
                  ? "bg-[var(--purple-1000)] font-semibold text-white"
                  : "text-[var(--foreground)] active:bg-[var(--grey-100)]"
              }`}
            >
              <Check className={`w-3.5 h-3.5 shrink-0 ${selected ? "opacity-100" : "opacity-0"}`} />
              <span className="truncate">{option}</span>
            </button>
          );
        })}
      </div>
    )}
  </div>
);

// ── ProjectPickerSheet ──────────────────────────────────────────────────
// The "Choose a Project" bottom sheet, reusing the same SearchBar already
// used across Agents/Outputs for a consistent search pattern app-wide, and
// the same drag-handle bottom-sheet chrome as FilterBottomSheet. The list
// itself is fetched live from GET /api/projects (see lib/api/project.ts) —
// no seeded/static data — and scrolls independently of the sheet's own
// header/search/filter row so it stays usable once a project has many rows.
const ProjectPickerSheet: React.FC<ProjectPickerSheetProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  organizationId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterRowOpen, setIsFilterRowOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"status" | "sort" | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_LABELS.ACTIVE!);
  const [sortOption, setSortOption] = useState<SortOption>("Last viewed");

  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      setError("No organization found for this account.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await listProjects({ organizationId });
      setProjects(response.projects ?? []);
    } catch (err) {
      console.error("listProjects failed:", err);
      if (err instanceof ApiError) {
        const body = err.body as { error?: string; details?: string } | undefined;
        setError(body?.details ?? body?.error ?? "Something went wrong");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  // The sheet stays mounted between opens now (to animate in/out — see the
  // transform below), so its filter/search state would otherwise carry over
  // from the last time it was open. Reset to defaults on every open instead.
  useEffect(() => {
    if (!isOpen) return;
    setSearchQuery("");
    setIsFilterRowOpen(false);
    setOpenDropdown(null);
    setStatusFilter(STATUS_LABELS.ACTIVE!);
    setSortOption("Last viewed");
    fetchProjects();
  }, [isOpen, fetchProjects]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const matches = projects.filter((project) => {
      const matchesQuery =
        !query ||
        project.name.toLowerCase().includes(query) ||
        (project.description ?? "").toLowerCase().includes(query);
      return matchesQuery && STATUS_LABELS[project.status] === statusFilter;
    });

    // The API has no "last viewed" timestamp — createdAt is the closest
    // proxy available until one exists.
    const sorted = [...matches];
    switch (sortOption) {
      case "Last viewed":
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "Oldest":
        sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      case "Name A-Z":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Name Z-A":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    return sorted;
  }, [projects, searchQuery, statusFilter, sortOption]);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-40 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* ── Sheet — always mounted so it can slide up/down on isOpen instead of
          just popping in/out (matches the Logout sheet's transform pattern). ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose a Project"
        className={`fixed bottom-0 left-0 z-[51] w-full bg-[var(--background)] rounded-t-3xl flex flex-col mx-auto shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          maxWidth:      "min(28rem, 100%)",
          // Fixed, not a cap — otherwise the flex column shrinks to hug
          // whatever's shortest (a narrow filter match, "No projects found",
          // the loading skeleton, etc.), so the sheet visibly jumps size as
          // you filter. Holding it steady lets the list scroll inside instead.
          height:        "85dvh",
          paddingBottom: "max(var(--safe-bottom), 0.75rem)",
        }}
      >
        {/* Drag handle */}
        <div
          className="w-full flex items-center justify-center py-2 cursor-pointer flex-shrink-0"
          onClick={onClose}
        >
          <div className="w-10 h-1.5 bg-[var(--grey-300)] rounded-full" />
        </div>

        <div className="px-[var(--spacing-16)] flex flex-col min-h-0 flex-1">
          <h2 className="text-card-title-20 font-semibold text-[var(--foreground)] flex-shrink-0">
            Choose a Project
          </h2>

          <div className="mt-3 flex-shrink-0">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              // This sheet has no separate "collapsed" header to fall back to like
              // Agents/Outputs do — the search bar is always shown here, so the
              // back arrow it renders just closes the whole sheet instead.
              setIsSearchActive={(active) => {
                if (!active) onClose();
              }}
              placeholder="Search"
              isFilterActive={isFilterRowOpen}
              onFilterClick={() => {
                setIsFilterRowOpen((open) => !open);
                setOpenDropdown(null);
              }}
            />
          </div>

          {isFilterRowOpen && (
            <div className="mt-3 flex items-center gap-2 flex-shrink-0">
              <FilterChip
                value={statusFilter}
                options={STATUS_OPTIONS}
                onChange={(value) => {
                  setStatusFilter(value);
                  setOpenDropdown(null);
                }}
                isOpen={openDropdown === "status"}
                onToggle={() => setOpenDropdown((d) => (d === "status" ? null : "status"))}
              />
              <FilterChip
                value={sortOption}
                options={SORT_OPTIONS}
                onChange={(value) => {
                  setSortOption(value as SortOption);
                  setOpenDropdown(null);
                }}
                isOpen={openDropdown === "sort"}
                onToggle={() => setOpenDropdown((d) => (d === "sort" ? null : "sort"))}
              />
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto mt-4 flex flex-col gap-4 pb-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-full flex items-start gap-3 animate-pulse">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full bg-[var(--grey-200)] mt-0.5" />
                  <div className="flex flex-col gap-2 flex-1 mt-1">
                    <div className="h-3.5 w-2/5 rounded-full bg-[var(--grey-200)]" />
                    <div className="h-3 w-4/5 rounded-full bg-[var(--grey-100)]" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="text-center mt-4">
                <p className="text-secondary-14 text-[var(--error-600)]">{error}</p>
                <button
                  type="button"
                  onClick={fetchProjects}
                  className="text-secondary-14 text-[var(--purple-800)] font-medium mt-2 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : filteredProjects.length === 0 ? (
              <p className="text-secondary-14 text-[var(--grey-500)] text-center mt-4">
                No projects found.
              </p>
            ) : (
              filteredProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onSelectProject(project)}
                  className="w-full flex items-start gap-3 text-left touch-manipulation rounded-xl p-1 -m-1 active:bg-[var(--grey-100)] transition-colors"
                >
                  <div className="w-8 h-8 flex-shrink-0 rounded-full bg-[var(--grey-200)] flex items-center justify-center mt-0.5">
                    <Folder className="w-4 h-4 text-[var(--grey-700)]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-body-16-m text-[var(--grey-1000)] truncate">
                      {project.name}
                    </span>
                    {project.description && (
                      <span className="text-secondary-14 text-[var(--grey-700)] mt-0.5 line-clamp-2">
                        {project.description}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectPickerSheet;
