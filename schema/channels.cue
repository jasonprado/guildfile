package schema

// #ChannelType enumerates Discord guild channel types supported by Guildfile today.
#ChannelType: "GuildText" | "GuildVoice" | "GuildCategory" | "GuildAnnouncement" | "GuildForum" | "GuildMedia" | "GuildStageVoice"

// #Channel describes a channel or category keyed by a stable identifier.
#Channel: {
  key: string
  name: string
  type: #ChannelType
  parent?: string
  topic?: string
  position?: int & >=0
  nsfw?: bool
  rateLimitPerUser?: int & >=0
  bitrate?: int & >=8000
  userLimit?: int & >=0
}

ChannelType: #ChannelType
Channel: #Channel
