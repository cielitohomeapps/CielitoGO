export function resolveBackendAssetUrl(
  assetPath: string | null | undefined,
  configuredBaseUrl = process.env.API_BASE_URL,
): string | null {
  const value = assetPath?.trim();
  const configured = configuredBaseUrl?.trim();
  if (!value || !configured || value.startsWith("//")) return null;

  let baseUrl: URL;
  try {
    baseUrl = new URL(configured);
  } catch {
    return null;
  }

  if (
    !["http:", "https:"].includes(baseUrl.protocol) ||
    baseUrl.username ||
    baseUrl.password
  ) {
    return null;
  }

  try {
    const resolved = new URL(value, `${baseUrl.origin}/`);
    const isCloudinaryImage =
      resolved.protocol === "https:" &&
      resolved.hostname === "res.cloudinary.com" &&
      /^\/[a-zA-Z0-9_-]+\/image\/upload\//.test(resolved.pathname);
    if (
      (resolved.origin !== baseUrl.origin && !isCloudinaryImage) ||
      !["http:", "https:"].includes(resolved.protocol)
    ) {
      return null;
    }
    return resolved.toString();
  } catch {
    return null;
  }
}
