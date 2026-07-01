import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setfollowing } from '../redux/userslic'

function getfollowingList() {
  const dispatch = useDispatch()
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/followingList`, {withCredentials: true})
        dispatch(setfollowing(result.data))
      } catch (error) {
        console.error(error)
      }
    }
    fetchFollowing()
  }, [])
}

export default getfollowingList
