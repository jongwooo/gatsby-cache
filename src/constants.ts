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

export enum Gatsby {
	CacheDir = ".cache",
	PublicDir = "public",
	Env = "GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES",
}

export const RefKey = "GITHUB_REF";
