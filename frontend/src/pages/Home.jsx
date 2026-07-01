import React from 'react'
import Lefthome from './components/lefthome'
import Righthome from './components/righthome'
import Feed from './components/feed'
function Home() {
  return (
    <div className='w-full flex justify-center items-center '>
      <Lefthome/>
      <Feed/>
      <Righthome/>
    </div>
  )
}
export default Home