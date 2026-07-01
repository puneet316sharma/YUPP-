import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setuserData } from '../redux/userslic'
import { setpostData } from '../redux/Postslice'
import { setscrollData } from '../redux/Scrollslice'

function getAllScrolls() {
  const dispatch =useDispatch()
  const {userData}=useSelector(state=>state.user)
    useEffect(()=>{
     const   fetchScrolls =async ()=>{
        try {
            const result= await axios.get(`${serverUrl}/api/scroll/getAll`,{withCredentials:true})
            dispatch(setscrollData(result.data))
        } catch (error) {
            
        }
     }
     fetchScrolls()
    },[dispatch,userData])
  
}

export default  getAllScrolls

