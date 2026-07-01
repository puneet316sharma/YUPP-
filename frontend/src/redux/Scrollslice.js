import { createSlice } from "@reduxjs/toolkit"

const scrollSlice=createSlice({
    name: "scrolls",
    initialState:{
       scrollData: []
    },
    reducers:
{
    setscrollData:(state,action)=>{
        state.scrollData=action.payload
    }

}})
export const {setscrollData} =scrollSlice.actions
export default scrollSlice.reducer