# Express API Starter with Typescript

## socket io 

CLIENT                                    SERVER
  |                                         |
  |------ socket:connect ------>           |
  |                                         |
  |------ location:init ------>            |
  |      (userId, token)                    |
  |                                         |
  |<----- location:initialized -------     |
  |                                         |
  |------ startLocationTracking()           |
  |      (watchPosition)                    |
  |                                         |
  |------ location:update ------>          |
  |      (lat, lng, hole, eventId)          |---> Update DB
  |      [REAL-TIME, every position change] |---> Broadcast to clubs
  |                                         |     & events
  |<----- location:update-confirmed --     |
  |<----- location:updated -----------     | (from other users)
  |      (other user's location)            |
  |                                         |
  |------ location:disconnect ------>      |
  |                                         |---> Clear location
  |                                         |
  |<----- location:disconnected -------    |


## Setup

```
pnpm install
```

## Lint

```
pnpm run lint
```

## Test

```
pnpm run test
```

## Development

```
pnpm run dev
```
