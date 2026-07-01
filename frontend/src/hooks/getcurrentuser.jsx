import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setuserData } from '../redux/userslic'
import { setcurrentuserstory } from '../redux/Storyslice'

function getcurrentuser() {
  const dispatch = useDispatch()
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {withCredentials: true})
        dispatch(setuserData(result.data))
        if (result.data?.story?.length > 0) {
          dispatch(setcurrentuserstory(result.data.story[result.data.story.length - 1]))
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchUser()
  }, [])
}

export default getcurrentuser
