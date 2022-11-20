import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as utils from "./utils/actionUtils";
import { State } from "./constants";

process.on("uncaughtException", (error: unknown) =>
  utils.logWarning((error as Error).message)
);

async function run(): Promise<void> {
  try {
    if (!utils.isCacheFeatureAvailable()) {
      return;
    }

    const state: string | undefined = utils.getCacheState();

    const primaryKey: string = core.getState(State.CachePrimaryKey);
    if (!primaryKey) {
      utils.logWarning(`Error retrieving key from state.`);
      return;
    }

    if (utils.isExactKeyMatch(primaryKey, state)) {
      core.info(
        `Cache hit occurred on the primary key ${primaryKey}, not saving cache.`
      );
      return;
    }

    const cachePaths: string[] = await utils.getBuildOutputPaths();
    const cacheId: number = await cache.saveCache(cachePaths, primaryKey);

    if (cacheId != -1) {
      core.info(`Cache saved with key: ${primaryKey}`);
    }
  } catch (error: unknown) {
    utils.logWarning((error as Error).message);
  }
}

void run();
