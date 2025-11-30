import {
  APIGuildChannel,
  RESTPatchAPIChannelJSONBody,
  RESTPostAPIGuildChannelJSONBody,
} from 'discord-api-types/v10';
import { DiscordClient } from '../discord/client';
import { ChannelSpec, isCategory, resolveChannelType } from '../types';

export interface ChannelPlan {
  creates: ChannelSpec[];
  updates: ChannelUpdatePlan[];
  unmatchedActual: APIGuildChannel[];
  keyToChannelId: Map<string, string>;
}

export interface ChannelUpdatePlan {
  spec: ChannelSpec;
  current: APIGuildChannel;
}

export interface ApplyPlanOptions {
  dryRun?: boolean;
  logger?: (message: string) => void;
}

export function buildChannelPlan(
  specs: ChannelSpec[],
  actual: APIGuildChannel[]
): ChannelPlan {
  const specByKey = new Map(specs.map((spec) => [spec.key, spec]));
  const sorted = [...specs].sort((a, b) => compareChannelSpecs(a, b));
  const keyToChannelId = new Map<string, string>();
  const creates: ChannelSpec[] = [];
  const updates: ChannelUpdatePlan[] = [];
  const matchedIds = new Set<string>();

  for (const spec of sorted) {
    const match = findMatchingChannel(spec, actual);
    if (match) {
      keyToChannelId.set(spec.key, match.id);
      matchedIds.add(match.id);
      if (channelNeedsUpdate(spec, match, keyToChannelId, specByKey)) {
        updates.push({ spec, current: match });
      }
    } else {
      creates.push(spec);
    }
  }

  const unmatchedActual = actual.filter((channel) => !matchedIds.has(channel.id));

  return { creates, updates, unmatchedActual, keyToChannelId };
}

export async function applyChannelPlan(
  client: DiscordClient,
  guildId: string,
  plan: ChannelPlan,
  options: ApplyPlanOptions = {}
): Promise<void> {
  const logger = options.logger ?? console.log;
  const keyToChannelId = new Map(plan.keyToChannelId);

  const creationQueue = [...plan.creates].sort((a, b) => compareChannelSpecs(a, b));
  for (const spec of creationQueue) {
    const payload = buildCreatePayload(spec, keyToChannelId);
    logger(`create ${spec.name} (${spec.type})`);
    if (!options.dryRun) {
      const created = await client.createChannel(guildId, payload);
      keyToChannelId.set(spec.key, created.id);
    }
  }

  for (const updatePlan of plan.updates) {
    const payload = buildUpdatePayload(updatePlan.spec, updatePlan.current, keyToChannelId);
    if (Object.keys(payload).length === 0) {
      continue;
    }
    logger(`update ${updatePlan.current.name} (${updatePlan.current.id})`);
    if (!options.dryRun) {
      await client.updateChannel(updatePlan.current.id, payload);
    }
  }
}

function compareChannelSpecs(a: ChannelSpec, b: ChannelSpec): number {
  const aCategory = isCategory(a);
  const bCategory = isCategory(b);
  if (aCategory && !bCategory) {
    return -1;
  }
  if (!aCategory && bCategory) {
    return 1;
  }

  const aPosition = a.position ?? 0;
  const bPosition = b.position ?? 0;
  if (aPosition !== bPosition) {
    return aPosition - bPosition;
  }

  return a.name.localeCompare(b.name);
}

function findMatchingChannel(
  spec: ChannelSpec,
  actual: APIGuildChannel[]
): APIGuildChannel | undefined {
  if (spec.id) {
    return actual.find((channel) => channel.id === spec.id);
  }
  return actual.find(
    (channel) =>
      channel.name === spec.name && channel.type === resolveChannelType(spec.type)
  );
}

function channelNeedsUpdate(
  spec: ChannelSpec,
  current: APIGuildChannel,
  keyToChannelId: Map<string, string>,
  specByKey: Map<string, ChannelSpec>
): boolean {
  if (spec.parent) {
    const parentId = keyToChannelId.get(spec.parent);
    if (!parentId) {
      if (!specByKey.has(spec.parent)) {
        throw new Error(
          `channel ${spec.key} references unknown parent key ${spec.parent}`
        );
      }
      // Parent will be created by Guildfile, so this channel needs an update.
      return true;
    }
    if (current.parent_id !== parentId) {
      return true;
    }
  } else if (current.parent_id) {
    return true;
  }

  if (spec.topic !== undefined && spec.topic !== (current as any).topic) {
    return true;
  }

  if (spec.name !== current.name) {
    return true;
  }

  if (spec.position !== undefined && spec.position !== (current as any).position) {
    return true;
  }

  if (spec.nsfw !== undefined && spec.nsfw !== (current as any).nsfw) {
    return true;
  }

  if (
    spec.rateLimitPerUser !== undefined &&
    spec.rateLimitPerUser !== (current as any).rate_limit_per_user
  ) {
    return true;
  }

  if (spec.bitrate !== undefined && spec.bitrate !== (current as any).bitrate) {
    return true;
  }

  if (spec.userLimit !== undefined && spec.userLimit !== (current as any).user_limit) {
    return true;
  }

  return false;
}

function buildCreatePayload(
  spec: ChannelSpec,
  keyToChannelId: Map<string, string>
): RESTPostAPIGuildChannelJSONBody {
  const payload: RESTPostAPIGuildChannelJSONBody = {
    name: spec.name,
    type: resolveChannelType(spec.type) as RESTPostAPIGuildChannelJSONBody['type'],
  };
  const mutable = payload as Record<string, unknown>;

  if (spec.topic !== undefined) {
    mutable.topic = spec.topic;
  }
  if (spec.position !== undefined) {
    mutable.position = spec.position;
  }
  if (spec.nsfw !== undefined) {
    mutable.nsfw = spec.nsfw;
  }
  if (spec.rateLimitPerUser !== undefined) {
    mutable.rate_limit_per_user = spec.rateLimitPerUser;
  }
  if (spec.bitrate !== undefined) {
    mutable.bitrate = spec.bitrate;
  }
  if (spec.userLimit !== undefined) {
    mutable.user_limit = spec.userLimit;
  }

  if (spec.parent) {
    const parentId = keyToChannelId.get(spec.parent);
    if (!parentId) {
      throw new Error(
        `channel ${spec.key} references parent ${spec.parent} that has not been created yet`
      );
    }
    payload.parent_id = parentId;
  }

  return payload;
}

function buildUpdatePayload(
  spec: ChannelSpec,
  current: APIGuildChannel,
  keyToChannelId: Map<string, string>
): RESTPatchAPIChannelJSONBody {
  const payload: RESTPatchAPIChannelJSONBody = {};
  const mutable = payload as Record<string, unknown>;

  if (spec.name !== current.name) {
    mutable.name = spec.name;
  }

  const desiredParentId = spec.parent ? keyToChannelId.get(spec.parent) : undefined;
  if (spec.parent && !desiredParentId) {
    throw new Error(
      `channel ${spec.key} references parent ${spec.parent} that has no resolved channel id`
    );
  }
  if (desiredParentId !== undefined) {
    if (current.parent_id !== desiredParentId) {
      mutable.parent_id = desiredParentId;
    }
  } else if (!spec.parent && current.parent_id) {
    mutable.parent_id = null;
  }

  if (spec.topic !== undefined && spec.topic !== (current as any).topic) {
    mutable.topic = spec.topic;
  }

  if (spec.position !== undefined && spec.position !== (current as any).position) {
    mutable.position = spec.position;
  }

  if (spec.nsfw !== undefined && spec.nsfw !== (current as any).nsfw) {
    mutable.nsfw = spec.nsfw;
  }

  if (
    spec.rateLimitPerUser !== undefined &&
    spec.rateLimitPerUser !== (current as any).rate_limit_per_user
  ) {
    mutable.rate_limit_per_user = spec.rateLimitPerUser;
  }

  if (spec.bitrate !== undefined && spec.bitrate !== (current as any).bitrate) {
    mutable.bitrate = spec.bitrate;
  }

  if (spec.userLimit !== undefined && spec.userLimit !== (current as any).user_limit) {
    mutable.user_limit = spec.userLimit;
  }

  return payload;
}
