const DEFAULT_BACKEND_URL = "http://localhost:5000";
const BACKEND_URL_PLACEHOLDER = "https://your-backend-domain.com";

export const getSupersetBackendUrl = () => {
  const configuredUrl = import.meta.env.VITE_BACKEND_URL?.trim();

  if (import.meta.env.PROD && (!configuredUrl || configuredUrl === BACKEND_URL_PLACEHOLDER)) {
    throw new Error("VITE_BACKEND_URL is not configured in Vercel");
  }

  return (configuredUrl || DEFAULT_BACKEND_URL).replace(/\/+$/, "");
};

export const fetchSupersetTokenData = async () => {
  const backendUrl = getSupersetBackendUrl();
  const tokenEndpoint = `${backendUrl}/api/superset-token`;
  let response;

  try {
    response = await fetch(tokenEndpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch {
    throw new Error(
      `Could not reach backend at ${backendUrl}. Check VITE_BACKEND_URL in Vercel and FRONTEND_ORIGIN in Railway.`
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Failed to fetch Superset guest token from ${tokenEndpoint} (${response.status})`
    );
  }

  if (!data?.token || !data?.dashboardUuid || !data?.supersetDomain) {
    throw new Error("Superset token response is missing dashboard embed details");
  }

  return data;
};

export const fetchDashboardGuestToken = async () => {
  const data = await fetchSupersetTokenData();

  return {
    token: data.token,
    dashboardUuid: data.dashboardUuid,
    supersetDomain: data.supersetDomain,
    raw: data,
  };
};
