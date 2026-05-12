import { useEffect, useRef, useState } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import { fetchSupersetTokenData } from "../api/guestToken";

const REFERENCE_DASHBOARD_WIDTH = 1880;

export default function SupersetDashboard({ className = "", style }) {
  const wrapperRef = useRef(null);
  const containerRef = useRef(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;

    const updateScale = () => {
      const availableWidth = wrapper.clientWidth || REFERENCE_DASHBOARD_WIDTH;
      setScale(Math.min(1, availableWidth / REFERENCE_DASHBOARD_WIDTH));
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(wrapper);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const mountPoint = containerRef.current;
    if (!mountPoint) return undefined;

    let cancelled = false;

    async function mountDashboard() {
      setError("");
      setIsLoading(true);
      mountPoint.innerHTML = "";

      try {
        const initialData = await fetchSupersetTokenData();

        await embedDashboard({
          id: initialData.dashboardUuid,
          supersetDomain: initialData.supersetDomain,
          mountPoint,
          fetchGuestToken: async () => {
            const data = await fetchSupersetTokenData();
            return data.token;
          },
          dashboardUiConfig: {
            hideTitle: true,
            filters: { expanded: false },
          },
        });

        if (!cancelled) {
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to embed Superset dashboard");
          setIsLoading(false);
        }
      }
    }

    mountDashboard();

    return () => {
      cancelled = true;
      mountPoint.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "700px",
        overflow: "hidden",
        ...style,
      }}
    >
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.86)",
            color: "#64748b",
            fontSize: "15px",
            zIndex: 1,
          }}
        >
          Loading dashboard...
        </div>
      )}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fee2e2",
            borderBottom: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "13px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          width: `${REFERENCE_DASHBOARD_WIDTH}px`,
          height: `${100 / scale}%`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      />
    </div>
  );
}
