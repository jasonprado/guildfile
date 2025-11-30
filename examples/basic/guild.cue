package guildfile

import schema "github.com/jasonprado/guildfile/schema"

BaseChannels: [
  schema.Channel & {
    key: "category-community"
    name: "Community"
    type: "GuildCategory"
    position: 0
  },
  schema.Channel & {
    key: "category-team"
    name: "Team"
    type: "GuildCategory"
    position: 1
  },
  schema.Channel & {
    key: "channel-general"
    name: "general"
    type: "GuildText"
    parent: "category-community"
    topic: "Welcome to Guildfile"
    position: 0
  },
  schema.Channel & {
    key: "channel-builds"
    name: "builds"
    type: "GuildText"
    parent: "category-team"
    topic: "Build notifications"
    position: 0
    rateLimitPerUser: 5
  },
  schema.Channel & {
    key: "channel-standup"
    name: "standup"
    type: "GuildVoice"
    parent: "category-team"
    position: 1
    bitrate: 64000
    userLimit: 10
  },
]

#Base: schema.GuildfileDoc & {
  guild: {
    name: "Guildfile Example"
    channels: BaseChannels
  }
}

dev: #Base & {
  guild: {
    name: "Guildfile Example (Dev)"
  }
}

prod: #Base & {
  guild: {
    name: "Guildfile Example (Prod)"
  }
}
