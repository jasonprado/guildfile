import { ChannelType } from 'discord-api-types/v10';

export const CHANNEL_TYPE_BY_NAME: Record<string, ChannelType> = {
  GuildText: ChannelType.GuildText,
  GuildVoice: ChannelType.GuildVoice,
  GuildCategory: ChannelType.GuildCategory,
  GuildAnnouncement: ChannelType.GuildAnnouncement,
  GuildForum: ChannelType.GuildForum,
  GuildMedia: ChannelType.GuildMedia,
  GuildStageVoice: ChannelType.GuildStageVoice,
};

export type ChannelTypeName = keyof typeof CHANNEL_TYPE_BY_NAME;

export interface ChannelSpec {
  key: string;
  id?: string;
  name: string;
  type: string;
  parent?: string;
  topic?: string;
  position?: number;
  nsfw?: boolean;
  rateLimitPerUser?: number;
  bitrate?: number;
  userLimit?: number;
}

export interface GuildSpec {
  guild: {
    name?: string;
    channels: ChannelSpec[];
  };
}

export function resolveChannelType(typeName: string): ChannelType {
  const value = CHANNEL_TYPE_BY_NAME[typeName];
  if (value === undefined) {
    const supported = Object.keys(CHANNEL_TYPE_BY_NAME).join(', ');
    throw new Error(`Unsupported channel type "${typeName}". Supported: ${supported}`);
  }
  return value;
}

export function isCategory(spec: ChannelSpec): boolean {
  return resolveChannelType(spec.type) === ChannelType.GuildCategory;
}
