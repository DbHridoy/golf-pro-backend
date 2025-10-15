// helpers/chat-room.util.ts
export function roomForPrivate(a: string, b: string) {
  return [a, b].sort().join("-");           // “651-…-657…”
}

export function roomForChannel(channelId: string) {
  return `channel_${channelId}`;            // “channel_652…”
}