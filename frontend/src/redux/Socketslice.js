import { createSlice } from "@reduxjs/toolkit"

const SocketSlice=createSlice({
    name: "socket",
    initialState:{
       socket: null,
OnlineUsers:null
    },
    reducers:
{
    setsocket:(state,action)=>{
        state.socket=action.payload
    },
    setOnlineUsers:(state,action)=>{
        state.OnlineUsers=action.payload
    }


    

}})
export const {setsocket,setOnlineUsers} =SocketSlice.actions
export default SocketSlice.reducer