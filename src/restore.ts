import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as utils from "./utils/actionUtils";
import { State, Inputs } from "./constants";

async function run(): Promise<void> {
  try {
    if (!utils.isCacheFeatureAvailable()) {
      utils.setCacheHitOutput(false);
      return;
    }

    const platform: string | undefined = process.env.RUNNER_OS;
    if (!platform) {
      return;
    }

    const useCache: boolean = core.getBooleanInput(Inputs.UseCache);
    utils.setBuildMode(useCache);

    const cachePaths: string[] = await utils.getBuildOutputPaths();

    let primaryKey: string = core.getInput(Inputs.Key);
    if (!primaryKey) {
      const fileHash: string = await utils.createHash();
      primaryKey = `${platform}-gatsby-build-${fileHash}`;
    }

    core.debug(`primary key is ${primaryKey}`);
    core.saveState(State.CachePrimaryKey, primaryKey);

    const restoreKeys: string[] = utils.getInputAsArray(Inputs.RestoreKeys);

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
