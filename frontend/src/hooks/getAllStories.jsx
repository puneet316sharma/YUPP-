import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setstoryList } from '../redux/Storyslice'

function getAllStories() {
  const dispatch = useDispatch()
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/story/getAllStories`, {withCredentials: true})
        dispatch(setstoryList(result.data))
      } catch (error) {
        console.error(error)
      }
    }
    fetchStories()
  }, [])
}

export default getAllStories
