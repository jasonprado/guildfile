package schema

// #Guild captures the subset of Discord guild configuration that Guildfile synchronizes today.
#Guild: {
  name?: string
  description?: string
  icon?: #Asset
  banner?: #Asset
  splash?: #Asset
  channels: [...#Channel]
  roles?: [...#Role]
  emojis?: [...#Emoji]
  stickers?: [...#Sticker]
  welcome?: #Welcome
}

// #GuildfileDoc is the top-level structure exported from Guildfile configs.
#GuildfileDoc: {
  guild: #Guild
}

Guild: #Guild
GuildfileDoc: #GuildfileDoc
