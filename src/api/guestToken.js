const DEFAULT_BACKEND_URL = "http://localhost:5000";

export const getSupersetBackendUrl = () =>
  (import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");

export const fetchSupersetTokenData = async () => {
  const response = await fetch(`${getSupersetBackendUrl()}/api/superset-token`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

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
        `Failed to fetch Superset guest token (${response.status})`
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
