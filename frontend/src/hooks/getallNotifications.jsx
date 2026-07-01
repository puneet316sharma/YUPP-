import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setnotificationData, setuserData } from '../redux/userslic'
import { setpostData } from '../redux/Postslice'

function getAllNotifications() {
  const dispatch =useDispatch()
  const {userData}=useSelector(state=>state.user)
   
     const   fetchNotifications =async ()=>{
        try {
            const result= await axios.get(`${serverUrl}/api/user/getAllNotifications`,{withCredentials:true})
            dispatch(setnotificationData(result.data))
        } catch (error) {
            console.error(error)
        }
     }
     fetchNotifications()
   
  
}

export default  getAllNotifications
