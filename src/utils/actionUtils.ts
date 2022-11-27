import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as glob from "@actions/glob";
import crypto from "crypto";
import fs from "fs";
import stream from "stream";
import util from "util";
import path from "path";
import { Outputs, State } from "../constants";

const WORKSPACE: string = process.cwd() || "";

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

export function setBuildMode(useCache: boolean): void {
  process.env.GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES = String(useCache);
}

export function setCacheState(state: string): void {
  core.saveState(State.CacheMatchedKey, state);
}

export function setCacheHitOutput(isCacheHit: boolean): void {
  core.setOutput(Outputs.CacheHit, isCacheHit.toString());
}

export function getCacheState(): string | undefined {
  const cacheKey: string = core.getState(State.CacheMatchedKey);
  if (cacheKey) {
    core.debug(`Cache state/key: ${cacheKey}`);
    return cacheKey;
  }

  return undefined;
}

export function logWarning(message: string): void {
  core.info(`[warning]${message}`);
}

export function isCacheFeatureAvailable(): boolean {
  if (!cache.isFeatureAvailable()) {
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

  return true;
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

export async function getBuildOutputPaths(): Promise<string[]> {
  const targetPaths: string[] = [".cache", "public"];
  const buildOutputPaths: string[] = [];

  for await (const target of targetPaths) {
    buildOutputPaths.push(path.join(WORKSPACE, target));
  }

  return buildOutputPaths;
}

export async function createHash(): Promise<string> {
  const targetFilePatterns = [
    "package.json",
    "gatsby-config.(j|t)s",
    "gatsby-node.(j|t)s",
  ];
  const patterns: string[] = [];

  for await (const targetFile of targetFilePatterns) {
    patterns.push(path.join(WORKSPACE, targetFile));
  }

  const globber: glob.Globber = await glob.create(patterns.join("\n"), {
    followSymbolicLinks: false,
  });

  const hasher: crypto.Hash = crypto.createHash("sha256");
  let hasMatch = false;

  for await (const file of globber.globGenerator()) {
    core.debug(`Processing ${file}`);

    const hash: crypto.Hash = crypto.createHash("sha256");
    const pipeline: (
      readStream: fs.ReadStream,
      hash: crypto.Hash
    ) => Promise<void> = util.promisify(stream.pipeline);
    await pipeline(fs.createReadStream(file), hash);

    hasher.write(hash.digest());
    hasMatch = true;
  }

  hasher.end();

  if (hasMatch) {
    return hasher.digest("hex");
  }

  return "";
}
