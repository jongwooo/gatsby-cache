export enum Inputs {
  UseCache = "use-cache",
  Key = "key",
  RestoreKeys = "restore-keys",
}

export enum Outputs {
  CacheHit = "cache-hit",
}

export enum State {
  CachePrimaryKey = "CACHE_KEY",
  CacheMatchedKey = "CACHE_RESULT",
}

export enum Events {
  Key = "GITHUB_EVENT_NAME",
}

export enum Platform {
  RunnerOs = "RUNNER_OS",
}

export const RefKey = "GITHUB_REF";
