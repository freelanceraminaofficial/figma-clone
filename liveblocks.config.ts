import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { LiveList } from "@liveblocks/client";

const client = createClient({
  throttle: 16,
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
  // authEndpoint: "/api/liveblocks-auth",
});

// Presence represents the properties that exist on every user in the Room
// and that will automatically be kept in sync. Accessible through the
// `user.presence` property. Must be JSON-serializable.
type Presence = {
  cursor: { x: number, y: number } | null,
  // ...
};

// Optionally, Storage represents the shared document that persists in the
// Room, even after all users leave. Fields under Storage typically are
// LiveList, LiveMap, LiveObject instances, for which updates are
// automatically persisted and synced to all connected clients.
type Storage = {
  animals: LiveList<string>,
  // ...
};

// Optionally, UserMeta represents static/readonly metadata on each user, as
// provided by your own custom auth back end (if used). Useful for data that
// will not change during a session, like a user's name or avatar.
// type UserMeta = {
//   id?: string,  // Accessible through `user.id`
//   info?: Json,  // Accessible through `user.info`
// };

// Optionally, the type of custom events broadcast and listened to in this
// room. Use a union for multiple events. Must be JSON-serializable.
// type RoomEvent = {};

// Optionally, when using Comments, ThreadMetadata represents metadata on
// each thread. Can only contain booleans, strings, and numbers.
// export type ThreadMetadata = {
//   pinned: boolean;
//   quote: string;
//   time: number;
// };
 
export const {
  RoomProvider,
  useMyPresence,
  useStorage,

  // Other hooks
  // ...
} = createRoomContext<
  Presence,
  Storage
  /* UserMeta, RoomEvent, ThreadMetadata */
>(client);
