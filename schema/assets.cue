package schema

// #Asset represents a file that Guildfile should upload to Discord.
#Asset: {
  // Path to the asset on disk (relative paths resolve against the config file).
  path: string
  // Optional type hint (icon, banner, splash, emoji, sticker).
  kind?: "icon" | "banner" | "splash" | "emoji" | "sticker"
}

Asset: #Asset
