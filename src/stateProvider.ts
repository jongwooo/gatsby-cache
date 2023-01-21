import * as core from "@actions/core";
import { State } from "./constants";

export interface BaseStateProvider {
  getCacheState(): string | undefined;
  getState(key: string): string;
  setState(key: string, value: string): void;
}

export class StateProvider implements BaseStateProvider {
  getCacheState(): string | undefined {
    const cacheKey = this.getState(State.CacheMatchedKey);
    if (cacheKey) {
      core.debug(`Cache state/key: ${cacheKey}`);
      return cacheKey;
    }

    return undefined;
  }

  getState = core.getState;
  setState = core.saveState;
}
