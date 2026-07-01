import { createSlice } from "@reduxjs/toolkit"

const MessageSlice=createSlice({
    name: "messages",
    initialState:{
       selectedUser: null,
       messages:[],
       prevChatUsers:null

    },
    reducers:
{
    setselectedUser:(state,action)=>{
        state.selectedUser=action.payload
    },
    setmessages:(state,action)=>{
        state.messages=action.payload
    },
    setprevChatUsers:(state,action)=>{
        state.prevChatUsers=action.payload
    }

    

}})
export const {setselectedUser,setmessages,setprevChatUsers} =MessageSlice.actions
export default MessageSlice.reducer