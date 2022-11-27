import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as utils from "./utils/actionUtils";
import { State, Inputs } from "./constants";

type Platform = "Linux" | "Windows" | "macOS";
type BaseKey = `${Platform}-gatsby-build-`;

async function run(): Promise<void> {
  try {
    if (!utils.isCacheFeatureAvailable()) {
      utils.setCacheHitOutput(false);
      return;
    }

    const useCache: boolean = core.getBooleanInput(Inputs.UseCache);
    utils.setBuildMode(useCache);

    const cachePaths: string[] = await utils.getBuildOutputPaths();
    const restoreKeys: string[] = utils.getInputAsArray(Inputs.RestoreKeys);

    let primaryKey: string = core.getInput(Inputs.Key);
    if (!primaryKey) {
      const platform: Platform = process.env.RUNNER_OS as Platform;
      const baseKey: BaseKey = `${platform}-gatsby-build-`;
      const fileHash: string = await utils.createHash();

      restoreKeys.push(baseKey);
      primaryKey = `${baseKey}${fileHash}`;
    }

    core.debug(`primary key is ${primaryKey}`);
    core.saveState(State.CachePrimaryKey, primaryKey);

    const cacheKey: string | undefined = await cache.restoreCache(
      cachePaths,
      primaryKey,
      restoreKeys
    );

    if (!cacheKey) {
      core.info(
        `Cache not found for keys: ${[primaryKey, ...restoreKeys].join(", ")}`
      );

      return;
    }

    utils.setCacheState(cacheKey);

    const isExactKeyMatch: boolean = utils.isExactKeyMatch(
      primaryKey,
      cacheKey
    );

    utils.setCacheHitOutput(isExactKeyMatch);
    core.info(`Cache restored from key: ${cacheKey}`);
  } catch (error: unknown) {
    core.setFailed((error as Error).message);
  }
}

void run();
