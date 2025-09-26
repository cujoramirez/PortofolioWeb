import React, { useEffect, useMemo, useRef, useState } from "react";

const formatBytes = (bytes) => {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) return "n/a";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(value > 10 ? 0 : 1)} ${units[i]}`;
};

const defaultPollInterval = 4000;
const storageKey = "enableMemoryOverlay";

const MemoryMonitor = ({ pollInterval = defaultPollInterval }) => {
  const [enabled, setEnabled] = useState(false);
  const [memory, setMemory] = useState(null);
  const [limit, setLimit] = useState(null);
  const [error, setError] = useState(null);
  const supportsDetailed = useMemo(
    () => typeof performance !== "undefined" && "measureUserAgentSpecificMemory" in performance,
    []
  );
  const pollingRef = useRef();
  const lastConsoleLog = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialEnabled = import.meta.env.DEV || window.localStorage.getItem(storageKey) === "true";
    setEnabled(initialEnabled);

    const api = {
      enable() {
        window.localStorage.setItem(storageKey, "true");
        setEnabled(true);
      },
      disable() {
        window.localStorage.removeItem(storageKey);
        setEnabled(false);
      },
      toggle() {
        const willEnable = window.localStorage.getItem(storageKey) !== "true";
        if (willEnable) {
          this.enable();
        } else {
          this.disable();
        }
      }
    };

    window.memoryProfiler = api;

    return () => {
      if (window.memoryProfiler === api) {
        delete window.memoryProfiler;
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setMemory(null);
      setLimit(null);
      setError(null);
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = undefined;
      }
      return undefined;
    }

    let cancelled = false;

    const sample = async () => {
      try {
        if (supportsDetailed) {
          const result = await performance.measureUserAgentSpecificMemory();
          if (!cancelled) {
            setMemory({
              used: result.bytes,
              breakdown: result.breakdown || []
            });
            setLimit(null);
          }
        } else if (performance && performance.memory) {
          const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
          if (!cancelled) {
            setMemory({ used: usedJSHeapSize });
            setLimit(jsHeapSizeLimit);
          }
        } else if (!cancelled) {
          setError("Memory API unsupported");
        }
        if (!cancelled) setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to read memory usage");
        }
      } finally {
        if (!cancelled) {
          pollingRef.current = setTimeout(sample, pollInterval);
        }
      }
    };

    sample();

    return () => {
      cancelled = true;
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = undefined;
      }
    };
  }, [enabled, pollInterval, supportsDetailed]);

  useEffect(() => {
    if (!enabled || !memory) return;
    const now = performance.now();
    if (now - lastConsoleLog.current > pollInterval * 1.5) {
      lastConsoleLog.current = now;
      const context = {
        used: formatBytes(memory.used),
        limit: limit ? formatBytes(limit) : "n/a",
      };
      // eslint-disable-next-line no-console
      console.table(context);
      if (memory.breakdown?.length) {
        const breakdown = memory.breakdown
          .map((entry) => ({
            type: entry.types?.join(" · ") || entry.type || "unknown",
            bytes: formatBytes(entry.bytes)
          }))
          .slice(0, 5);
        // eslint-disable-next-line no-console
        console.table(breakdown);
      }
    }
  }, [enabled, memory, limit, pollInterval]);

  if (!enabled || !memory) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        background: "rgba(9, 12, 23, 0.88)",
        color: "#e2e8f0",
        borderRadius: 12,
        padding: "12px 16px",
        fontSize: 12,
        lineHeight: 1.4,
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.35)",
        zIndex: 2000,
        pointerEvents: "none",
        backdropFilter: "blur(8px)",
        maxWidth: 220,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Memory usage</div>
      <div>
        Used: <strong>{formatBytes(memory.used)}</strong>
      </div>
      {limit && (
        <div>
          Limit: <strong>{formatBytes(limit)}</strong>
        </div>
      )}
      {supportsDetailed && memory.breakdown?.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <div style={{ opacity: 0.7, marginBottom: 2 }}>Top contributors:</div>
          {memory.breakdown.slice(0, 3).map((entry, idx) => (
            <div key={`${entry.types?.join('-') || entry.type || idx}`}
              style={{ display: "flex", justifyContent: "space-between", gap: 8 }}
            >
              <span style={{ opacity: 0.75, flex: 1 }}>{entry.types?.join(" · ") || entry.type || `Entry ${idx + 1}`}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatBytes(entry.bytes)}</span>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div style={{ marginTop: 6, color: "#f87171" }}>⚠ {error}</div>
      )}
    </div>
  );
};

export default MemoryMonitor;
