import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import SearchBar from "./SearchBar";
import { listProjects, type ApiProject, type ProjectStatus } from "../lib/api/project";
import { ApiError } from "../lib/api/client";

const GeneralProjectIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
    aria-hidden="true"
  >
    <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
    <path d="M14 2v5a1 1 0 0 0 1 1h5" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

const SoftwareProjectIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
    aria-hidden="true"
  >
    <path d="m18 16 4-4-4-4" />
    <path d="m6 8-4 4 4 4" />
    <path d="m14.5 4-5 16" />
  </svg>
);

const AiFlowProjectIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
    aria-hidden="true"
  >
    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
    <path d="M20 2v4" />
    <path d="M22 4h-4" />
    <circle cx="4" cy="20" r="2" />
  </svg>
);

const getProjectIcon = (project: ApiProject) => {
  switch (project.subType) {
    case "DATA_CHAT":
      return <AiFlowProjectIcon />;
    case "WEB_APP":
    case "DESKTOP_APP":
    case "API":
    case "MIGRATION":
      return <SoftwareProjectIcon />;
    default:
      return <GeneralProjectIcon />;
  }
};

export type Project = ApiProject;

interface ProjectPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  organizationId: string | null;
  selectedProject?: Project | null;
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
      style={{ minHeight: "2.25rem" }}
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
  selectedProject,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<"status" | "sort" | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_LABELS.ACTIVE!);
  const [sortOption, setSortOption] = useState<SortOption>("Last viewed");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(selectedProject?.id ?? null);

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
    setOpenDropdown(null);
    setStatusFilter(STATUS_LABELS.ACTIVE!);
    setSortOption("Last viewed");
    setSelectedProjectId(selectedProject?.id ?? null);
    fetchProjects();
  }, [isOpen, selectedProject?.id, fetchProjects]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const matches = projects.filter((project) => {
      const matchesQuery =
        !query ||
        project.name.toLowerCase().includes(query) ||
        (project.description ?? "").toLowerCase().includes(query);
      return matchesQuery && STATUS_LABELS[project.status] === statusFilter;
    });

    // Keep the active project pinned to the top when it is already selected,
    // while preserving the configured sort order for the remaining projects.
    const sorted = [...matches].sort((a, b) => {
      const aSelected = a.id === selectedProject?.id ? 0 : 1;
      const bSelected = b.id === selectedProject?.id ? 0 : 1;
      if (aSelected !== bSelected) return aSelected - bSelected;

      switch (sortOption) {
        case "Last viewed":
          return b.createdAt.localeCompare(a.createdAt);
        case "Oldest":
          return a.createdAt.localeCompare(b.createdAt);
        case "Name A-Z":
          return a.name.localeCompare(b.name);
        case "Name Z-A":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [projects, searchQuery, statusFilter, sortOption, selectedProject?.id]);

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
              setIsSearchActive={() => {}}
              placeholder="Search Projects"
              showBackButton={false}
              showFilterButton={false}
            />
          </div>

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

          <div className="flex-1 min-h-0 overflow-y-auto mt-4 pb-4">
            <div className="mx-auto w-full" style={{ width: "min(100%, 21.4375rem)", minHeight: "0" }}>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-full flex items-start gap-3 animate-pulse py-2 px-1">
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
                <div className="mt-8 flex min-h-[16rem] flex-col items-center justify-center gap-3 text-center">
                  <div className="flex aspect-square h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-[var(--grey-400)] text-[var(--grey-700)] sm:h-12 sm:w-12 md:h-14 md:w-14">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-[62.5%] w-[62.5%]"
                      aria-hidden="true"
                    >
                      <path d="m21 21-4.34-4.34" />
                      <circle cx="11" cy="11" r="8" />
                    </svg>
                  </div>
                  <p className="text-[clamp(1.3rem,2.5vw,1.75rem)] font-medium leading-none text-[var(--grey-900)]">
                    No project match {`"${searchQuery}"`}
                  </p>
                  <p className="max-w-[18rem] text-[clamp(0.75rem,1.5vw,0.875rem)] leading-5 text-[var(--grey-500)]">
                    No projects match your search. Try a different keyword or browse all projects.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredProjects.map((project) => {
                    const isSelected = selectedProjectId === project.id;
                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          onSelectProject(project);
                        }}
                        className={`w-full flex items-start gap-3 text-left touch-manipulation rounded-xl border border-[var(--grey-200)] px-3 py-3 transition-colors ${
                          isSelected ? "bg-[var(--grey-200)]" : "bg-[var(--background)] active:bg-[var(--grey-100)]"
                        }`}
                        style={{ width: "100%", minHeight: "5.4375rem", maxWidth: "21.4375rem" }}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            isSelected ? "bg-[var(--grey-100)] text-[var(--grey-700)]" : "bg-[var(--grey-200)] text-[var(--grey-700)]"
                          }`}
                        >
                          {getProjectIcon(project)}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-body-16-m text-[var(--grey-1000)]">
                            {project.name}
                          </span>
                          {project.description && (
                            <span className="mt-0.5 line-clamp-2 text-secondary-14 text-[var(--grey-700)]">
                              {project.description}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectPickerSheet;
