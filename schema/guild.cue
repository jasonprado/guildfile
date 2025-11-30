package schema

// #Guild captures the subset of Discord guild configuration that Guildfile synchronizes today.
#Guild: {
  name?: string
  channels: [...#Channel]
}

// #GuildfileDoc is the top-level structure exported from Guildfile configs.
#GuildfileDoc: {
  guild: #Guild
}

Guild: #Guild
GuildfileDoc: #GuildfileDoc
