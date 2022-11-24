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

    const useCache: boolean = core.getBooleanInput(Inputs.UseCache);
    utils.setBuildMode(useCache);

    const platform: string | undefined = process.env.RUNNER_OS;
    if (!platform) {
      return;
    }

    const hash: string = await utils.createHash();

    const baseKey: string | undefined = `${platform}-gatsby-build-`;
    const primaryKey: string | undefined = `${baseKey}${hash}`;
    core.debug(`primary key is ${primaryKey}`);
    core.saveState(State.CachePrimaryKey, primaryKey);

    const restoreKeys: string[] = [baseKey];
    const cachePaths: string[] = await utils.getBuildOutputPaths();
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
