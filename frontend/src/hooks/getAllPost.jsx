import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setuserData } from '../redux/userslic'
import { setpostData } from '../redux/Postslice'

function getAllPost() {
  const dispatch =useDispatch()
  const {userData}=useSelector(state=>state.user)
    useEffect(()=>{
     const   fetchPost =async ()=>{
        try {
            const result= await axios.get(`${serverUrl}/api/post/getAll`,{withCredentials:true})
            dispatch(setpostData(result.data))
        } catch (error) {
            
        }
     }
     fetchPost()
    },[dispatch,userData])
  
}

export default  getAllPost
