# gatsby-cache

This action allows caching build outputs for Gatsby's [Conditional Page Build](https://www.gatsbyjs.com/docs/reference/release-notes/v3.0/#incremental-builds-in-oss).

[![LICENSE](https://img.shields.io/github/license/jongwooo/gatsby-cache?color=blue)](LICENSE)
[![CodeFactor](https://www.codefactor.io/repository/github/jongwooo/gatsby-cache/badge)](https://www.codefactor.io/repository/github/jongwooo/gatsby-cache)
[![GitHub stars](https://img.shields.io/github/stars/jongwooo/gatsby-cache?style=social)](https://github.com/jongwooo/gatsby-cache)

## Usage

### Pre-requisites

Create a workflow `.yml` file in your repositories `.github/workflows` directory. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs

- `key` - An explicit key for restoring and saving the cache.
- `restore-keys` - An ordered list of keys to use for restoring stale cache if no cache hit occurred for key.

### Outputs

- `cache-hit` - A boolean value to indicate an exact match was found for the key.

> Note: `cache-hit` will be set to `true` only when cache hit occurs for the exact `key` match. For a partial key match via `restore-keys` or a cache miss, it will be set to `false`.

### Cache Details

This action currently caches the following directories:

- `.cache` (cache of data and rendered assets)
- `public` (output of the build process)

### Example workflow

```yaml
- uses: actions/checkout@v3

- name: Set up Node.js
  uses: actions/setup-node@v3
  with:
   node-version: 18

- uses: jongwooo/gatsby-cache@v1.4.2

- name: Install dependencies
  run: npm ci

- name: Build
  run: npm run build
```

## Contributing

Check out [Contributing guide](.github/CONTRIBUTING.md) for ideas on contributing and setup steps for getting our repositories up.

## License

Licensed under the [MIT License](LICENSE).
