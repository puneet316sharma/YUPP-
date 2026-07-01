import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        suggestedusers: null,
        profileData: null,
        following: [],
        searchData: null,
        notificationData: []
    },
    reducers: {
        setuserData: (state, action) => {
            state.userData = action.payload
        },
        setsuggestedusers: (state, action) => {
            state.suggestedusers = action.payload
        },
        setprofileData: (state, action) => {
            state.profileData = action.payload
        },
        setnotificationData: (state, action) => {
            if (Array.isArray(action.payload)){
                state.notificationData = action.payload
            } else {
                state.notificationData = [...(state.notificationData || []), action.payload]
            }
        },
        setsearchData: (state, action) => {
            state.searchData = action.payload
        },
        setfollowing: (state, action) => {
            state.following = Array.isArray(action.payload) ? action.payload : []
        },
        togglefollow: (state, action) => {
            const targetId = action.payload?._id || action.payload
            if (!Array.isArray(state.following)) state.following = []

            const isFollowing = state.following.some(user => {
                const userId = user?._id || user
                return userId?.toString() === targetId?.toString()
            })

            if (isFollowing) {
                state.following = state.following.filter(user => {
                    const userId = user?._id || user
                    return userId?.toString() !== targetId?.toString()
                })
            } else {
                state.following.push(typeof action.payload === 'object' ? action.payload : { _id: targetId })
            }
        }
    }
})

export const { setnotificationData, setuserData, setsuggestedusers, togglefollow, setfollowing, setprofileData, setsearchData } = userSlice.actions
export default userSlice.reducer