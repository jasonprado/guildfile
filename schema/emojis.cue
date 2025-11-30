package schema

// #Emoji defines a guild emoji asset.
#Emoji: {
  key: string
  name: string
  id?: string
  asset: #Asset
  roles?: [...string] // role keys allowed to use the emoji
  animated?: bool
}

// #Sticker defines a guild sticker asset.
#Sticker: {
  key: string
  name: string
  id?: string
  asset: #Asset
  description?: string
  tags?: [...string]
  format?: "png" | "apng" | "lottie" | "gif"
}

Emoji: #Emoji
Sticker: #Sticker
