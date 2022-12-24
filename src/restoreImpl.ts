import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as utils from "./utils/actionUtils";
import { Events, Inputs, Outputs, Platform, State } from "./constants";
import { StateProvider } from "./stateProvider";

type Runner = "Linux" | "Windows" | "macOS";

async function restoreImpl(
  stateProvider: StateProvider
): Promise<string | undefined> {
  try {
    if (!utils.isCacheFeatureAvailable()) {
      core.setOutput(Outputs.CacheHit, "false");
      return;
    }

    if (!utils.isValidEvent()) {
      const eventName: string = process.env[Events.Key] || "";
      utils.logWarning(
        `Event Validation Error: The event type ${eventName} is not supported because it's not tied to a branch or tag ref.`
      );
      return;
    }

    const useCache: boolean = core.getBooleanInput(Inputs.UseCache);
    utils.setBuildMode(useCache);

    const cachePaths: string[] = await utils.getBuildOutputPaths();
    const restoreKeys: string[] = utils.getInputAsArray(Inputs.RestoreKeys);

    let primaryKey: string = core.getInput(Inputs.Key);
    if (!primaryKey) {
      const platform: Runner = process.env[Platform.RunnerOs] as Runner;
      primaryKey = `${platform}-gatsby-build-`;
    }

    core.debug(`primary key is ${primaryKey}`);
    stateProvider.setState(State.CachePrimaryKey, primaryKey);

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

    stateProvider.setState(State.CacheMatchedKey, cacheKey);

    const isExactKeyMatch: boolean = utils.isExactKeyMatch(
      primaryKey,
      cacheKey
    );

    core.setOutput(Outputs.CacheHit, isExactKeyMatch.toString());
    core.info(`Cache restored from key: ${cacheKey}`);

    return cacheKey;
  } catch (error: unknown) {
    core.setFailed((error as Error).message);
    return;
  }
}

export default restoreImpl;
