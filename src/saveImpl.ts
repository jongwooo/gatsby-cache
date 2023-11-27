import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as utils from "./utils/actionUtils";
import { Inputs, State } from "./constants";
import { BaseStateProvider } from "./stateProvider";

process.on("uncaughtException", (e) => utils.logWarning(e.message));

async function saveImpl(
  stateProvider: BaseStateProvider,
): Promise<number | void> {
  let cacheId = -1;
  try {
    if (!utils.isCacheFeatureAvailable()) {
      return;
    }

    const state = stateProvider.getCacheState();

    const primaryKey =
      stateProvider.getState(State.CachePrimaryKey) ||
      core.getInput(Inputs.Key);

    if (!primaryKey) {
      utils.logWarning(`Key is not specified.`);
      return;
    }

    if (utils.isExactKeyMatch(primaryKey, state)) {
      core.info(
        `Cache hit occurred on the primary key ${primaryKey}, not saving cache.`,
      );
      return;
    }

    const cachePaths = await utils.getBuildOutputPaths();
    cacheId = await cache.saveCache(cachePaths, primaryKey);

    if (cacheId != -1) {
      core.info(`Cache saved with key: ${primaryKey}`);
    }
  } catch (error: unknown) {
    utils.logWarning((error as Error).message);
  }
  return cacheId;
}

export default saveImpl;
