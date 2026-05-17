const defaultProductionBaseUrl = "https://ahlamy.nodeteam.site";
const defaultDevelopmentBackendUrl = "http://localhost:5000";

const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

function getRequestTarget() {
  return (
    process.env.NEXT_PUBLIC_REQUEST_TARGET ||
    process.env.REQUEST_TARGET ||
    process.env.NODE_ENV ||
    "development"
  ).toLowerCase();
}

function usesProductionServer() {
  return ["production", "prod", "deployed", "remote"].includes(getRequestTarget());
}

function getBackendBaseUrl() {
  const explicitBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || process.env.BACKEND_BASE_URL;
  if (explicitBaseUrl) {
    return trimTrailingSlash(explicitBaseUrl);
  }

  const productionBaseUrl =
    process.env.NEXT_PUBLIC_PRODUCTION_BACKEND_URL ||
    process.env.PRODUCTION_BACKEND_URL ||
    defaultProductionBaseUrl;

  const localBaseUrl =
    process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL ||
    process.env.LOCAL_BACKEND_URL ||
    defaultDevelopmentBackendUrl;

  return trimTrailingSlash(usesProductionServer() ? productionBaseUrl : localBaseUrl);
}

export function getBackendApiBaseUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL;
  if (explicitUrl) {
    const normalized = trimTrailingSlash(explicitUrl);
    return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
  }

  return `${getBackendBaseUrl()}/api`;
}

export function getSocketBaseUrl() {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return trimTrailingSlash(process.env.NEXT_PUBLIC_SOCKET_URL);
  }

  if (process.env.SOCKET_URL) {
    return trimTrailingSlash(process.env.SOCKET_URL);
  }

  return getBackendBaseUrl();
}
