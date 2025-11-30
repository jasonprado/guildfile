# Guildfile Schema

Guildfile's CUE schema lives in this directory and is exported under the module `github.com/jasonprado/guildfile`. Downstream configs can depend on `github.com/jasonprado/guildfile/schema` and access the `Channel`, `Guild`, and `GuildfileDoc` definitions without copying types.

## Versioning

1. Commit schema changes on `main`.
2. Tag a semantic version (e.g. `git tag v0.0.1 && git push origin v0.0.1`).
3. Consumers upgrade via `cue mod get github.com/jasonprado/guildfile/schema@v0.0.1`.

Follow semver while `<1.0.0`: bump the minor version for breaking changes, patch for additive changes.
