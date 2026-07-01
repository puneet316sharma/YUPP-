import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { serverUrl } from '../../App'
import dp from "../../assets/dp.png"
import { IoMdArrowBack } from "react-icons/io"
import { FaEye } from "react-icons/fa"
import Videoplayer from './videoplayer'
import { useSelector } from 'react-redux'

function Story() {
    const { username } = useParams()
    const navigate = useNavigate()
    const { userData } = useSelector(state => state.user)

    const [stories, setstories] = useState([])        // all stories for this user
    const [currentIndex, setcurrentIndex] = useState(0)
    const [progress, setprogress] = useState(0)
    const [paused, setpaused] = useState(false)
    const [showViewers, setshowViewers] = useState(false)
    const [loading, setloading] = useState(true)

    const STORY_DURATION = 5000  // 5 seconds per story

    // Fetch all stories for this user
    useEffect(() => {
        if (!username) return
        setloading(true)
        axios.get(`${serverUrl}/api/story/getStoryByusername/${username}`, { withCredentials: true })
            .then(r => {
                setstories(r.data || [])
                setcurrentIndex(0)
                setprogress(0)
                setloading(false)
            })
            .catch(err => { console.error(err); setloading(false) })
    }, [username])

    const currentStory = stories[currentIndex]

    // Log view and refresh story data (so viewer list is populated)
    useEffect(() => {
        if (!currentStory?._id) return
        axios.get(`${serverUrl}/api/story/view/${currentStory._id}`, { withCredentials: true })
            .then(r => {
                // Replace current story with updated one (now has populated viewers)
                setstories(prev => prev.map((s, i) => i === currentIndex ? r.data : s))
            })
            .catch(() => {})
    }, [currentStory?._id])

    // Progress bar & auto-advance
    useEffect(() => {
        if (!currentStory || paused || showViewers) return
        setprogress(0)
        const interval = setInterval(() => {
            setprogress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    goNext()
                    return 0
                }
                return prev + (100 / (STORY_DURATION / 100))
            })
        }, 100)
        return () => clearInterval(interval)
    }, [currentIndex, paused, showViewers, currentStory])

    const goNext = () => {
        if (currentIndex < stories.length - 1) {
            setcurrentIndex(i => i + 1)
            setprogress(0)
            setshowViewers(false)
        } else {
            navigate("/")
        }
    }

    const goPrev = () => {
        if (currentIndex > 0) {
            setcurrentIndex(i => i - 1)
            setprogress(0)
            setshowViewers(false)
        }
    }

    if (loading) return (
        <div className='w-full h-[100vh] bg-black flex items-center justify-center'>
            <div className='w-[40px] h-[40px] border-4 border-white border-t-transparent rounded-full animate-spin' />
        </div>
    )

    if (!currentStory) return (
        <div className='w-full h-[100vh] bg-black flex flex-col items-center justify-center gap-3'>
            <span className='text-gray-400 text-[18px]'>No stories</span>
            <span className='text-white underline cursor-pointer' onClick={() => navigate("/")}>Go back</span>
        </div>
    )

    const storyViewers = currentStory?.viewers || []
    const isOwnStory = currentStory?.author?.username === userData?.username

    return (
        <div className='w-full h-[100vh] bg-black flex justify-center items-center'>
            <div className='relative w-full max-w-[420px] h-[100vh] bg-black overflow-hidden'>

                {/* ── Progress bars ── */}
                <div className='absolute top-0 left-0 w-full z-[100] flex gap-[4px] px-[10px] pt-[10px]'>
                    {stories.map((_, i) => (
                        <div key={i} className='flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden'>
                            <div
                                className='h-full bg-white rounded-full transition-none'
                                style={{
                                    width: i < currentIndex ? '100%'
                                        : i === currentIndex ? `${progress}%`
                                        : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* ── Header ── */}
                <div className='absolute top-[20px] left-0 w-full z-[100] flex items-center gap-[10px] px-[12px]'>
                    <IoMdArrowBack
                        onClick={() => navigate("/")}
                        className='text-white h-[22px] w-[22px] cursor-pointer flex-shrink-0'
                    />
                    <div className='w-[38px] h-[38px] rounded-full overflow-hidden border-2 border-white flex-shrink-0'>
                        <img src={currentStory?.author?.profileImage || dp} alt='' className='w-full h-full object-cover' />
                    </div>
                    <span className='text-white font-semibold text-[14px] flex-1 truncate'>
                        {currentStory?.author?.username}
                    </span>
                </div>

                {/* ── Tap zones (left = prev, right = next) ── */}
                <div className='absolute inset-0 z-[50] flex'>
                    <div
                        className='w-[35%] h-full cursor-pointer'
                        onClick={goPrev}
                        onMouseDown={() => setpaused(true)}
                        onMouseUp={() => setpaused(false)}
                        onTouchStart={() => setpaused(true)}
                        onTouchEnd={() => setpaused(false)}
                    />
                    <div
                        className='flex-1 h-full cursor-pointer'
                        onClick={goNext}
                        onMouseDown={() => setpaused(true)}
                        onMouseUp={() => setpaused(false)}
                        onTouchStart={() => setpaused(true)}
                        onTouchEnd={() => setpaused(false)}
                    />
                </div>

                {/* ── Story media ── */}
                <div className='w-full h-full flex items-center justify-center bg-black'>
                    {currentStory?.mediaType === "image" && (
                        <img
                            src={currentStory?.media}
                            alt=''
                            className='w-full h-full object-contain'
                        />
                    )}
                    {currentStory?.mediaType === "video" && (
                        <div className='w-full h-full'>
                            <Videoplayer media={currentStory?.media} />
                        </div>
                    )}
                </div>

                {/* ── Viewers panel (own story only) ── */}
                {isOwnStory && !showViewers && (
                    <div
                        className='absolute bottom-0 left-0 w-full z-[200] flex items-center justify-between px-[16px] py-[14px] bg-gradient-to-t from-black/70 to-transparent cursor-pointer'
                        onClick={() => { setshowViewers(true); setpaused(true) }}
                    >
                        <div className='text-white flex items-center gap-[8px]'>
                            <FaEye className='w-[18px] h-[18px]' />
                            <span className='text-[14px] font-medium'>{storyViewers.length} {storyViewers.length === 1 ? 'view' : 'views'}</span>
                        </div>
                        <div className='flex items-center'>
                            {storyViewers.slice(0, 3).map((viewer, i) => (
                                <div
                                    key={i}
                                    className='w-[28px] h-[28px] rounded-full overflow-hidden border-2 border-black flex-shrink-0'
                                    style={{ marginLeft: i > 0 ? '-8px' : 0 }}
                                >
                                    <img src={viewer?.profileImage || dp} alt='' className='w-full h-full object-cover' />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Viewers slide-up sheet ── */}
                {isOwnStory && showViewers && (
                    <div className='absolute bottom-0 left-0 w-full z-[300] bg-[#111] rounded-t-3xl flex flex-col' style={{ maxHeight: '55%' }}>
                        <div className='w-full flex items-center justify-between px-[20px] pt-[16px] pb-[10px] border-b border-gray-800'>
                            <div className='flex items-center gap-2 text-white font-semibold'>
                                <FaEye />
                                <span>{storyViewers.length} {storyViewers.length === 1 ? 'Viewer' : 'Viewers'}</span>
                            </div>
                            <button
                                className='text-gray-400 text-[22px] leading-none'
                                onClick={() => { setshowViewers(false); setpaused(false) }}
                            >×</button>
                        </div>
                        <div className='overflow-y-auto flex flex-col divide-y divide-gray-800/50'>
                            {storyViewers.length === 0 && (
                                <div className='text-gray-500 text-center py-[30px] text-[15px]'>No views yet</div>
                            )}
                            {storyViewers.map((viewer, i) => (
                                <div key={i} className='flex items-center gap-[12px] px-[20px] py-[12px]'>
                                    <div className='w-[42px] h-[42px] rounded-full overflow-hidden border border-gray-700 flex-shrink-0'>
                                        <img src={viewer?.profileImage || dp} alt='' className='w-full h-full object-cover' />
                                    </div>
                                    <span className='text-white font-medium text-[15px] truncate'>{viewer?.username}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Story
