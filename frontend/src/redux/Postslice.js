import { createSlice } from "@reduxjs/toolkit"

const postSlice=createSlice({
    name: "posts",
    initialState:{
       postData: []

    },
    reducers:
{
    setpostData:(state,action)=>{
        state.postData=action.payload
    }

}})
export const {setpostData} =postSlice.actions
export default postSlice.reducer