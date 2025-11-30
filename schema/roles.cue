package schema

// #Role models a Discord guild role. Future versions of Guildfile will expand this set.
#Role: {
  key: string
  name: string
  color?: int & >=0
  hoist?: bool
  mentionable?: bool
  permissions?: string
}

Role: #Role
