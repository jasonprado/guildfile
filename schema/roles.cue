package schema

// #Role models a Discord guild role definition.
#Role: {
  key: string
  name: string
  id?: string
  color?: int & >=0
  hoist?: bool
  mentionable?: bool
  permissions?: string
  icon?: #Asset
  unicodeEmoji?: string
  position?: int & >=0
}

Role: #Role
