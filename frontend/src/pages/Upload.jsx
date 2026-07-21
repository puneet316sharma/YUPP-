import React, { useState, useRef } from 'react'
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { FaPlus } from "react-icons/fa6";
import Videoplayer from './components/videoplayer';
import axios from "axios"
import { useDispatch, useSelector } from 'react-redux';
import { setpostData } from '../redux/Postslice';
import { setcurrentuserstory } from '../redux/Storyslice';
import { setscrollData } from '../redux/Scrollslice';
import { serverUrl } from '../App'; 
import { ClipLoader } from 'react-spinners'; 

function Upload() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const [uploadType, setuploadtype] = useState("post")
    const [frontendmedia, setfrontendmedia] = useState(null)
    const [backendmedia, setbackendmedia] = useState(null)
    const [mediaType, setmediatype] = useState("")
    const [caption, setcaption] = useState("")
    const [loading, setloading] = useState(false)
    const [aiLoading, setailoading] = useState(false)
    const [cloudinaryUrl, setcloudinaryurl] = useState(null)
    
    const mediaInput = useRef()
    
    const { postData } = useSelector(state => state.post || {})
    const { scrollData } = useSelector(state => state.scroll || {})

    const handleMedia = (e) => {
      const file = e.target.files[0]
      if (!file) return;

      console.log(file)
      
      if (file.type.includes("image")) {
        setmediatype("image")
      } else {
        setmediatype("video")
      }
      
      setbackendmedia(file)
      setfrontendmedia(URL.createObjectURL(file))
      setcloudinaryurl(null) // Reset on new file select
    }

    const handleSuggestCaption = async () => {
        if (!backendmedia) return;
        setailoading(true);
        try {
            let mediaUrl = cloudinaryUrl;
            if (!mediaUrl) {
                const formData = new FormData();
                formData.append("media", backendmedia);
                const tempRes = await axios.post(`${serverUrl}/api/ai/upload-temp`, formData, {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" }
                });
                mediaUrl = tempRes.data.mediaUrl;
                setcloudinaryurl(mediaUrl);
            }
            
            const suggestionsRes = await axios.post(`${serverUrl}/api/ai/caption`, { mediaUrl }, { withCredentials: true });
            const { caption: aiCaption, hashtags } = suggestionsRes.data;
            const combinedCaption = `${aiCaption} ${hashtags.map(tag => `#${tag}`).join(" ")}`;
            setcaption(combinedCaption);
        } catch (error) {
            console.error("AI Caption suggestion error:", error);
            alert("Failed to suggest caption. Please ensure ANTHROPIC_API_KEY is configured.");
        } finally {
            setailoading(false);
        }
    };

    const UploadPost = async () => {
      try {
        const formData = new FormData()
        formData.append("caption", caption)
        formData.append("mediaType", mediaType)
        if (cloudinaryUrl) {
            formData.append("mediaUrl", cloudinaryUrl)
        } else {
            formData.append("media", backendmedia)
        }
        
        const result = await axios.post(`${serverUrl}/api/post/upload`, formData, { withCredentials: true })
        
        dispatch(setpostData([result.data, ...(Array.isArray(postData) ? postData : [])]))
        
        setloading(false)
        navigate("/")
      } catch (error) {
        console.log(error)
        setloading(false)
      }
    }

    const UploadStory = async () => {
      try {
        const formData = new FormData()
        formData.append("mediaType", mediaType)
        formData.append("media", backendmedia)
        
        const result = await axios.post(`${serverUrl}/api/story/upload`, formData, { withCredentials: true })
        dispatch(setcurrentuserstory(result.data))
        setloading(false)
        navigate("/")
      } catch (error) {
        console.log(error)
        setloading(false)
      }
    }

    const UploadScroll = async () => {
      try {
        const formData = new FormData()
        formData.append("caption", caption)
        formData.append("media", backendmedia)
        
        const result = await axios.post(`${serverUrl}/api/scroll/upload`, formData, { withCredentials: true })
        
        if (Array.isArray(scrollData)) {
            dispatch(setscrollData([...scrollData, result.data]))
        } else {
            dispatch(setscrollData(result.data))
        }
        
        setloading(false)
        navigate("/")
      } catch (error) {
        console.log(error)
        setloading(false)
      }
    }

    const handleUpload = () => {
      if (!backendmedia) return;
      setloading(true)
      if (uploadType === "post") {
        UploadPost()
      } else if (uploadType === "story") {
        UploadStory()
      } else {
        UploadScroll()
      }
    }

  return (
    <div className='w-full min-h-[100vh] bg-black flex flex-col items-center pb-10'>
      <div className='w-full h-[80px] flex items-center gap-[20px] px-[20px]'>
        <IoMdArrowBack onClick={() => navigate("/")} className='text-white h-[25px] w-[25px] cursor-pointer'/> 
        <h1 className='text-white text-[20px] font-semibold '>Upload Media</h1>
      </div>

      <div className='w-[90%] max-w-[600px] h-[60px] bg-white rounded-full flex justify-around items-center gap-[10px] px-2'>
        <div className={` ${uploadType === "post" ? "bg-black shadow-lg text-white" : "text-black"} w-[30%] h-[80%] flex justify-center items-center text-[16px] sm:text-[18px] font-semibold rounded-full cursor-pointer transition-all`} onClick={() => { setuploadtype("post"); setfrontendmedia(null); setbackendmedia(null); }}>Post</div>
        <div className={` ${uploadType === "story" ? "bg-black shadow-lg text-white" : "text-black"} w-[30%] h-[80%] flex justify-center items-center text-[16px] sm:text-[18px] font-semibold rounded-full cursor-pointer transition-all`} onClick={() => { setuploadtype("story"); setfrontendmedia(null); setbackendmedia(null); }}>Story</div>
        <div className={` ${uploadType === "scroll" ? "bg-black shadow-lg text-white" : "text-black"} w-[30%] h-[80%] flex justify-center items-center text-[16px] sm:text-[18px] font-semibold rounded-full cursor-pointer transition-all`} onClick={() => { setuploadtype("scroll"); setfrontendmedia(null); setbackendmedia(null); }}>Scroll</div>
      </div>

      {!frontendmedia && (
        <div className='w-[80%] max-w-[500px] h-[250px] bg-[#0e1316] border-gray-800 border-2 flex flex-col items-center justify-center gap-[8px] mt-[10vh] rounded-2xl cursor-pointer hover:bg-[#1a2327] transition-colors' onClick={() => mediaInput.current.click()}>
          <input type='file' accept={uploadType === "scroll" ? "video/*" : "image/*,video/*"} hidden ref={mediaInput} onChange={handleMedia}/>
          <FaPlus className='text-white w-[25px] h-[25px]' />  
          <div className='text-white text-[19px] font-semibold '> Upload {uploadType}</div> 
        </div>
      )}

      {frontendmedia && (
        <div className='w-[80%] max-w-[500px] min-h-[300px] flex flex-col items-center justify-center mt-[5vh]'> 
          {mediaType === "image" && (
            <div className='w-full flex flex-col items-center justify-center'>
              <img src={frontendmedia} alt='' className='max-h-[250px] rounded-2xl object-contain'/>
              {uploadType !== "story" && (
                <div className="w-full flex flex-col items-stretch mt-[20px]">
                  <input type='text' className='w-full border-b-gray-400 border-b-2 outline-none px-[10px] py-[5px] text-white bg-transparent' placeholder='Write a caption...' onChange={(e) => setcaption(e.target.value)} value={caption} />
                  {uploadType === "post" && (
                    <button 
                      type="button" 
                      onClick={handleSuggestCaption} 
                      disabled={aiLoading} 
                      className='mt-3 self-end px-4 py-1.5 bg-zinc-800 text-white rounded-full text-sm font-semibold hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5'
                    >
                      {aiLoading ? <ClipLoader size={14} color='white' /> : "Suggest caption 🪄"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {mediaType === "video" && (
            <div className='w-full flex flex-col items-center justify-center'>
              <div className='w-full max-h-[250px] overflow-hidden rounded-2xl flex justify-center bg-zinc-900'>
                <Videoplayer media={frontendmedia} />
              </div>
              {uploadType !== "story" && <input type='text' className='w-full border-b-gray-400 border-b-2 outline-none px-[10px] py-[5px] text-white mt-[20px] bg-transparent' placeholder='Write a caption...' onChange={(e) => setcaption(e.target.value)} value={caption}/>}
            </div>
          )}

          <button 
            className='w-full max-w-[400px] h-[50px] bg-white mt-[40px] cursor-pointer rounded-2xl font-bold flex justify-center items-center hover:bg-gray-200 active:scale-95 transition-all' 
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? <ClipLoader size={24} color='black' /> : `Upload ${uploadType}`}
          </button>
        </div>
      )}
    </div>
  )
}

export default Upload