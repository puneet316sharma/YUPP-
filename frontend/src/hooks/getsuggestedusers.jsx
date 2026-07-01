import React, { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setsuggestedusers } from '../redux/userslic'

function getsuggestedusers() {
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/suggested`, { withCredentials: true })
        dispatch(setsuggestedusers(result.data))
      } catch (error) {
        console.error(error)
      }
    }
    fetchUser()
  }, [dispatch])
}

export default getsuggestedusers