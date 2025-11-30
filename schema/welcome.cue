package schema

// #WelcomeChannel describes a featured channel on the Discord welcome screen.
#WelcomeChannel: {
  channel: string // channel key reference
  description: string
  emoji?: {
    id?: string
    name?: string
  }
}

// #Welcome models welcome screen + system channel settings.
#Welcome: {
  enabled?: bool
  description?: string
  channels?: [...#WelcomeChannel]
}

Welcome: #Welcome
