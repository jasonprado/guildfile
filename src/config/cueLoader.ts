import { spawn } from 'node:child_process';
import { statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { GuildSpec } from '../types';

export interface CueLoaderOptions {
  selector?: string;
  cueBinary?: string;
  cwd?: string;
}

export async function loadGuildSpec(
  configPath: string,
  options: CueLoaderOptions = {}
): Promise<GuildSpec> {
  const absConfigPath = path.resolve(configPath);
  let configDir: string;
  try {
    const stats = statSync(absConfigPath);
    configDir = stats.isDirectory() ? absConfigPath : path.dirname(absConfigPath);
  } catch {
    configDir = path.dirname(absConfigPath);
  }
  const cueBinary = options.cueBinary ?? 'cue';
  const args = ['export', absConfigPath];
  if (options.selector) {
    args.push('-e', options.selector);
  }
  args.push('--out', 'json');

  const moduleRoot = options.cwd ?? findCueModuleRoot(configDir) ?? configDir;
  const payload = await execCommand(cueBinary, args, moduleRoot);
  const parsed = JSON.parse(payload);
  if (!parsed.guild) {
    throw new Error('CUE document must export a top-level "guild" object.');
  }
  if (!Array.isArray(parsed.guild.channels)) {
    parsed.guild.channels = [];
  }
  return parsed as GuildSpec;
}

async function execCommand(cmd: string, args: string[], cwd: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout?.setEncoding('utf8');
    child.stdout?.on('data', (chunk) => {
      stdout += chunk;
    });

    child.stderr?.setEncoding('utf8');
    child.stderr?.on('data', (chunk) => {
      stderr += chunk;
    });

    child.once('error', (err) => reject(err));
    child.once('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`cue export failed: ${stderr || 'unknown error'}`));
      }
    });
  });
}

function findCueModuleRoot(startDir: string): string | undefined {
  let current = startDir;
  while (true) {
    const modulePath = path.join(current, 'cue.mod', 'module.cue');
    if (existsSync(modulePath)) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return undefined;
    }
    current = parent;
  }
}
