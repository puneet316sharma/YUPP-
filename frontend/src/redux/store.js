import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./userslic"
import postSlice from "./Postslice"
import storySlice from "./Storyslice"
import scrollSlice from "./Scrollslice"
import MessageSlice from "./Messageslice"
import SocketSlice from "./Socketslice"

const store = configureStore({
  reducer: {
    user: userSlice,
    post: postSlice,
    story: storySlice,
    scroll: scrollSlice,
    message: MessageSlice,
    socket: SocketSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["socket/setsocket", "socket/setOnlineUsers"],
        ignoredPaths: ["socket.socket"],
      },
    }),
})

export default store