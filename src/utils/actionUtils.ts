import * as cache from "@actions/cache";
import * as core from "@actions/core";
import path from "path";
import { Gatsby, RefKey } from "../constants";

export function isGhes(): boolean {
  const url: string = process.env.GITHUB_SERVER_URL ?? "https://github.com";
  const ghUrl: URL = new URL(url);
  return ghUrl.hostname.toUpperCase() !== "GITHUB.COM";
}

export function isExactKeyMatch(key: string, cacheKey?: string): boolean {
  return !!(
    cacheKey &&
    cacheKey.localeCompare(key, undefined, {
      sensitivity: "accent",
    }) === 0
  );
}

export function logWarning(message: string): void {
  const warningPrefix = "[warning]";
  core.info(`${warningPrefix}${message}`);
}

export function isValidEvent(): boolean {
  return RefKey in process.env && Boolean(process.env[RefKey]);
}

export function getInputAsArray(
  name: string,
  options?: core.InputOptions
): string[] {
  return core
    .getInput(name, options)
    .split("\n")
    .map((s) => s.replace(/^!\s+/, "!").trim())
    .filter((x) => x !== "");
}

export function isCacheFeatureAvailable(): boolean {
  if (cache.isFeatureAvailable()) {
    return true;
  }

  if (isGhes()) {
    logWarning(
      `Cache action is only supported on GHES version >= 3.5. If you are on version >=3.5 Please check with GHES admin if Actions cache service is enabled or not.
Otherwise please upgrade to GHES version >= 3.5 and If you are also using Github Connect, please unretire the actions/cache namespace before upgrade (see https://docs.github.com/en/enterprise-server@3.5/admin/github-actions/managing-access-to-actions-from-githubcom/enabling-automatic-access-to-githubcom-actions-using-github-connect#automatic-retirement-of-namespaces-for-actions-accessed-on-githubcom)`
    );
    return false;
  }

  logWarning(
    "An internal error has occurred in cache backend. Please check https://www.githubstatus.com/ for any ongoing issue in actions."
  );
  return false;
}

export function setBuildMode(useCache: boolean): void {
  process.env[Gatsby.Env] = String(useCache);
}

export async function getBuildOutputPaths(): Promise<string[]> {
  const targetPaths: string[] = [Gatsby.CacheDir, Gatsby.PublicDir];
  const buildOutputPaths: string[] = [];

  for await (const target of targetPaths) {
    buildOutputPaths.push(path.join(process.cwd(), target));
  }

  return buildOutputPaths;
}
