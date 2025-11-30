#!/usr/bin/env node
import process from 'node:process';
import { loadGuildSpec } from '../config/cueLoader';
import { DiscordClient } from '../discord/client';
import { applyChannelPlan, buildChannelPlan } from '../reconcile/channels';

interface CliArgs {
  subcommand?: string;
  configPath?: string;
  guildId?: string;
  env?: string;
  cueBinary?: string;
  token?: string;
  dryRun: boolean;
  help?: boolean;
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help || !args.subcommand) {
      printUsage();
      process.exit(args.help ? 0 : 1);
    }

    switch (args.subcommand) {
      case 'apply':
        await runApply(args);
        break;
      default:
        throw new Error(`Unknown subcommand: ${args.subcommand}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { dryRun: false };
  const rest = [...argv];

  if (rest.length > 0 && !rest[0].startsWith('-')) {
    args.subcommand = rest.shift();
  }

  while (rest.length > 0) {
    const token = rest.shift();
    switch (token) {
      case '-h':
      case '--help':
        args.help = true;
        break;
      case '--config':
        args.configPath = rest.shift();
        break;
      case '--guild':
        args.guildId = rest.shift();
        break;
      case '--env':
        args.env = rest.shift();
        break;
      case '--cue-bin':
        args.cueBinary = rest.shift();
        break;
      case '--token':
        args.token = rest.shift();
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      default:
        throw new Error(`Unknown flag: ${token}`);
    }
  }

  return args;
}

async function runApply(args: CliArgs) {
  if (!args.configPath) {
    throw new Error('--config is required');
  }
  if (!args.guildId) {
    throw new Error('--guild is required');
  }

  const token = args.token ?? process.env.DISCORD_TOKEN;
  if (!token) {
    throw new Error('Discord token is required (pass --token or set DISCORD_TOKEN)');
  }

  const spec = await loadGuildSpec(args.configPath, {
    selector: args.env,
    cueBinary: args.cueBinary,
  });

  const client = new DiscordClient(token);
  const channels = await client.listChannels(args.guildId);
  const plan = buildChannelPlan(spec.guild.channels ?? [], channels);

  console.log(
    `channel plan: ${plan.creates.length} create(s), ${plan.updates.length} update(s)`
  );
  if (plan.unmatchedActual.length > 0) {
    console.log(
      `warning: ${plan.unmatchedActual.length} channel(s) exist in Discord but are not declared in the config`
    );
  }

  if (plan.creates.length === 0 && plan.updates.length === 0) {
    console.log('channels already match the desired configuration');
    return;
  }

  const logger = (message: string) => {
    if (args.dryRun) {
      console.log(`[dry-run] ${message}`);
    } else {
      console.log(message);
    }
  };

  await applyChannelPlan(client, args.guildId, plan, {
    dryRun: args.dryRun,
    logger,
  });

  if (args.dryRun) {
    console.log('dry-run complete; re-run without --dry-run to apply changes');
  } else {
    console.log('channel reconciliation complete');
  }
}

function printUsage() {
  console.log(`Usage: guildfile <command> [options]

Commands:
  apply             Apply a Guildfile to a Discord guild

Options:
  --config <path>   Path to the CUE configuration file
  --guild <id>      Target Discord guild ID
  --env <value>     Optional CUE expression to export (e.g. dev)
  --token <token>   Discord bot token (defaults to DISCORD_TOKEN env var)
  --cue-bin <path>  Override the cue binary to execute
  --dry-run         Print actions without modifying the guild
  -h, --help        Show this help message
`);
}

void main();
