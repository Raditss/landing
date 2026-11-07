import { releasesUrl } from "./site";

let cached: Promise<string | null> | undefined;

/**
 * The latest stable release, read once per build from GitHub's redirect (it skips
 * pre-releases and has no API rate limit). A release dispatches a site deploy, so
 * this stays current. Null when GitHub cannot be reached: a build must not fail for it.
 */
export function latestAppVersion(): Promise<string | null> {
  cached ??= fetch(`${releasesUrl}/latest`, { redirect: "manual", signal: AbortSignal.timeout(5000) })
    .then((response) => /\/releases\/tag\/v([^/?#]+)$/.exec(response.headers.get("location") ?? "")?.[1] ?? null)
    .catch(() => null);
  return cached;
}

/** One installer per platform, or the releases page when the version is unknown. */
export function appDownloads(version: string | null) {
  const file = (suffix: string) =>
    version ? `${releasesUrl}/download/v${version}/Vizier_${version}_${suffix}` : `${releasesUrl}/latest`;
  return {
    windows: file("x64-setup.exe"),
    macos: file("universal.dmg"),
    linuxX64: file("amd64.AppImage"),
    linuxArm64: file("aarch64.AppImage"),
  };
}
