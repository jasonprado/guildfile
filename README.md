# Guildfile

Guildfile lets you declare Discord server configuration in [CUE](https://cuelang.org/) and reconcile it with discord.js. The initial focus is on channels and categories so you can describe your server tree and keep it in sync across environments.

## Requirements

- [pnpm](https://pnpm.io/) 8+
- [CUE CLI](https://cuetorials.com/getting-started/install-cue/)
- A Discord Bot token with `MANAGE_GUILD` and `MANAGE_CHANNELS`

## Quick start with the example config

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Fetch the schema dependency inside the example (this pulls `github.com/jasonprado/guildfile/schema` via CUE modules):
   ```bash
   cd examples/basic
   cue mod tidy
   cd -
   ```
3. Create a Discord application + bot:
   - Visit <https://discord.com/developers/applications>, create an app, add a **Bot** and copy its token.
   - Enable the **Server Members Intent** if you plan to extend Guildfile later.
4. Invite the bot to your server with the permissions it needs:
   - Use the OAuth2 URL builder in the Developer Portal or open:
     ```
     https://discord.com/api/oauth2/authorize?client_id=<APPLICATION_ID>&permissions=134217728&scope=bot%20applications.commands
     ```
     Replace `<APPLICATION_ID>` with your app ID and pick the guild you want to manage.
5. Export your bot token to the environment and note the guild (server) ID (enable Developer Mode in Discord → right-click server → **Copy Server ID**):
   ```bash
   export DISCORD_TOKEN=your_bot_token
   export DISCORD_GUILD=<your_server_id>
   ```
6. Run the basic example in dry-run mode:
   ```bash
   pnpm example:basic -- --guild "$DISCORD_GUILD" --dry-run
   ```
   This evaluates `examples/basic/guild.cue` (the `dev` environment) and prints the create/update operations without touching Discord.
7. Apply the plan for real once you are confident:
   ```bash
   pnpm example:basic -- --guild "$DISCORD_GUILD"
   ```

## Writing configs

See `examples/basic/guild.cue` for a minimal config. It defines a `#Base` document plus `dev`/`prod` overlays that you can export with `cue export examples/basic/guild.cue -e dev` (or `prod`). Each channel entry must include a unique `key`, `name`, and Discord `type` (e.g. `"GuildText"`, `"GuildVoice"`, or `"GuildCategory"`).

Parents are referenced by `key`, so categories should appear in the document before the channels that depend on them.

## Schema module & versioning

The schema shipped in this repo lives under `schema/` and is published as a CUE module at `github.com/jasonprado/guildfile/schema`. To update consumers:

1. Commit schema changes.
2. Tag a release (e.g. `git tag v0.0.1 && git push origin v0.0.1`).
3. In configs (including `examples/basic`), run `cue mod tidy` or `cue mod get github.com/jasonprado/guildfile/schema@v0.0.1` to upgrade.

Follow semantic versioning while `<1.0.0`: bump the minor version for breaking schema changes and patch for additive fixes.

## CLI usage

```
pnpm dev -- apply --config <file> --guild <id> [--env dev] [--dry-run]
```

Flags:

- `--config` – path to the CUE file.
- `--env` – value passed to `cue export -e` (defaults to exporting the entire file).
- `--guild` – Discord guild (server) ID to reconcile.
- `--token` – Discord bot token (falls back to `DISCORD_TOKEN`).
- `--dry-run` – log the plan without making API calls.

## Next steps

- Model roles, permission overwrites, emoji, welcome screens, and other guild features.
- Emit richer diff summaries (JSON output, previews).
- Watch filesystem changes and automatically reapply configs during development.
