import { createSlice } from "@reduxjs/toolkit"

const storySlice=createSlice({
    name: "story",
    initialState:{
       storyData: null,
       storyList:null,
       currentuserstory:null

    },
    reducers:
{
    setstoryData:(state,action)=>{
        state.storyData=action.payload
    },
     setstoryList:(state,action)=>{
        state.storyList=action.payload
    },
    setcurrentuserstory:(state,action)=>{
        state.currentuserstory=action.payload
    }

}})
export const {setstoryData,setstoryList,setcurrentuserstory} =storySlice.actions
export default storySlice.reducer