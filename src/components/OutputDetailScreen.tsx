import React, { useCallback, useEffect, useMemo, useState } from "react";
import { X, Download } from "lucide-react";
import { isTauri } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { getOutput, type OutputBlock, type OutputSummary } from "../lib/api/outputs";
import { ApiError } from "../lib/api/client";

interface OutputDetailScreenProps {
  onNavigate: (screen: string) => void;
  output: OutputSummary | null;
  projectId: string;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, "_").trim() || "output";
}

// Blocks are already raw HTML fragments (see BlockView below) — downloading the
// output means bundling them back into one standalone document, since that's the
// actual format this content exists in server-side; there's no separate source
// file the API exposes to download instead.
function buildExportHtml(title: string, blocks: OutputBlock[]): string {
  const sections = blocks
    .map((block) => `<section><h2>${escapeHtml(block.title)}</h2>${block.html}</section>`)
    .join("\n<hr />\n");
  return `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>${escapeHtml(title)}</title></head>
<body>
<h1>${escapeHtml(title)}</h1>
${sections}
</body>
</html>`;
}

/* ── Rendered block ──
   Blocks come back as raw HTML from the backend. They're rendered inside a
   sandboxed iframe rather than dangerouslySetInnerHTML, so block content can never
   execute script in the app's context — sandbox grants allow-same-origin only,
   never allow-scripts, so the parent can read contentDocument (to auto-size the
   iframe to its real content) while the block's own <script> tags still never run.
   Using a blob: URL for `src` instead of `srcDoc` — some WebView builds (notably
   older Android system WebViews) mishandle srcDoc on a locked-down sandboxed
   iframe and can crash the renderer process; blob: URLs are the more broadly
   supported way to hand a sandboxed iframe raw HTML. */
const BlockView: React.FC<{ block: OutputBlock }> = ({ block }) => {
  const [iframeHeight, setIframeHeight] = useState(200);

  const blobUrl = useMemo(() => {
    const blob = new Blob([block.html], { type: "text/html" });
    return URL.createObjectURL(blob);
  }, [block.html]);

  useEffect(() => {
    return () => URL.revokeObjectURL(blobUrl);
  }, [blobUrl]);

  return (
    <div className="mb-6">
      <p className="text-body-14-sb text-[var(--grey-1000)] mb-2">{block.title}</p>
      <iframe
        title={block.title}
        src={blobUrl}
        sandbox="allow-same-origin"
        className="w-full border-0 rounded-lg"
        style={{ height: iframeHeight, backgroundColor: "var(--grey-100)" }}
        onLoad={(e) => {
          try {
            const doc = e.currentTarget.contentDocument;
            if (doc) setIframeHeight(Math.max(doc.documentElement.scrollHeight, 100));
          } catch {
            // in case the doc is ever unreadable for another reason — keep the fallback height
          }
        }}
      />
    </div>
  );
};

const OutputDetailScreen: React.FC<OutputDetailScreenProps> = ({ onNavigate, output, projectId }) => {
  const [blocks, setBlocks] = useState<OutputBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!output) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getOutput(projectId, output.name);
      setBlocks(response.data?.blocks ?? []);
    } catch (err) {
      console.error("getOutput failed:", err);
      if (err instanceof ApiError) {
        const body = err.body as { error?: string; details?: string } | undefined;
        setError(body?.details ?? body?.error ?? "Something went wrong");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [output, projectId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!output || blocks.length === 0 || isDownloading) return;
    const filename = `${sanitizeFilename(output.title)}.html`;
    const html = buildExportHtml(output.title, blocks);

    setIsDownloading(true);
    try {
      if (isTauri()) {
        const path = await save({
          defaultPath: filename,
          filters: [{ name: "HTML", extensions: ["html"] }],
        });
        if (path) await writeTextFile(path, html);
      } else {
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!output) return null;

  return (
    <div
      className="w-full h-full flex flex-col bg-[var(--background)] pt-[max(var(--safe-top),2.75rem)] pb-[max(var(--safe-bottom),2.125rem)]"
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
          disabled={blocks.length === 0 || isDownloading}
          className="cursor-pointer active:scale-95 transition-transform p-2 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ color: "var(--purple-1000)" }}
        >
          <Download size={24} />
        </button>
      </div>

      {/* Title */}
      <div className="px-4 mb-4">
        <p className="text-body-16-sb text-[var(--grey-1000)]">{output.title}</p>
        {output.description && (
          <p className="text-secondary-14 text-[var(--grey-500)] mt-1">{output.description}</p>
        )}
      </div>

      {/* Blocks */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4">
        {isLoading && (
          <p className="text-secondary-14 text-[var(--grey-500)] text-center mt-4">Loading artifact...</p>
        )}

        {!isLoading && error && (
          <div className="text-center mt-4">
            <p className="text-secondary-14 text-[var(--error-600)]">{error}</p>
            <button
              type="button"
              onClick={fetchDetail}
              className="text-secondary-14 text-[var(--purple-800)] font-medium mt-2 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && blocks.length === 0 && (
          <p className="text-secondary-14 text-[var(--grey-500)] text-center mt-4">No content in this artifact.</p>
        )}

        {!isLoading && !error && blocks.map((block) => (
          <BlockView key={block.blockId} block={block} />
        ))}
      </div>
    </div>
  );
};

export default OutputDetailScreen;
