import React, {useRef , useEffect, useState } from 'react'
import { GoUnmute } from "react-icons/go";
import { GoMute } from "react-icons/go";

function Videoplayer({media}) {
    const videoTag=useRef()
const [mute, setmute]=useState(true)
const[isplaying , setisplaying]=useState(true)

const handleClick=()=>{
if (isplaying){
    videoTag.current.pause()
    setisplaying(false)
}
else{
    videoTag.current.play()
    setisplaying(true)
}
}


useEffect(()=>{
    const observer=new IntersectionObserver(([entry])=>{
      const video=videoTag.current
      if(entry.isIntersecting){
        video.play()
        setisplaying(true)
      }
      else{
        video.pause()
        setisplaying(false)
      }
    },{threshold : 0.6 })
    if (videoTag.current){
      observer.observe(videoTag.current)
    }

    return ()=>{
      if (videoTag.current){
        observer.unobserve(videoTag.current)

      }
    }
  },[])

  return (
    <div className='h-[100%] relative  cursor-pointer max-w-full  rounded-2xl overflow-hidden '>
     <video ref={videoTag} src={media} autoPlay loop muted={mute} className='h-[100%] relative  cursor-pointer max-w-full  rounded-2xl overflow-hidden ' onClick={handleClick}/> 
     <div className='absolute bottom-[10px] right-[10px]' onClick={()=>setmute(prev=>!prev)}>
       {!mute? <GoUnmute className='w-[20px] h-[20px] text-white font-semibold '/>:<GoMute  className='w-[20px] h-[20px] text-white font-semibold '/>}
     </div>
    </div>
  )
}

export default Videoplayer