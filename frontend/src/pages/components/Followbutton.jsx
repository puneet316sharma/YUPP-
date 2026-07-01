import axios from 'axios'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { togglefollow } from '../../redux/userslic'
import { serverUrl } from '../../App'

function Followbutton({ targetuserId, tailwind, onFollowChange }) {
    const dispatch = useDispatch()
    const { following } = useSelector(state => state.user || { following: [] })
    
    const isfollowing = Array.isArray(following) && following.some(user => {
        const userIdString = user?._id ? user._id.toString() : user?.toString()
        return userIdString === targetuserId?.toString()
    })

    const handleFollow = async () => {
        try {
            await axios.get(`${serverUrl}/api/user/follow/${targetuserId}`, { withCredentials: true })
            
            dispatch(togglefollow({ _id: targetuserId }))
            
            if (onFollowChange) onFollowChange()
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <button className={tailwind} onClick={handleFollow}>
        {isfollowing ? "Following" : "Follow"}
    </button>
  )
}

export default Followbutton