import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { IoMdArrowBack } from "react-icons/io"
import { FaImages } from "react-icons/fa6"
import { IoSend, IoVideocam } from "react-icons/io5"
import { useVideoCall } from '../../context/VideoCallContext'
import dp from "../../assets/dp.png"
import SenderMessage from './SenderMessage'
import ReceiverMessage from './ReceiverMessage'
import axios from 'axios'
import { serverUrl } from '../../App'
import { setmessages } from '../../redux/Messageslice'

function MessageArea() {
    const { selectedUser, messages } = useSelector(state => state.message)
    const { userData } = useSelector(state => state.user)
    const { socket, OnlineUsers: onlineUserIds } = useSelector(state => state.socket)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { startCall } = useVideoCall()

    const [input, setinput] = useState("")
    const [frontendImage, setfrontendImage] = useState(null)
    const [backendImage, setbackendImage] = useState(null)
    const [sending, setsending] = useState(false)
    const imageInput = useRef()
    const bottomRef = useRef()

    const isOnline = onlineUserIds?.includes(selectedUser?._id?.toString())

    // Redirect if no user selected
    useEffect(() => {
        if (!selectedUser) navigate("/messages")
    }, [selectedUser])

    // Load message history
    useEffect(() => {
        if (!selectedUser?._id) return
        axios.get(`${serverUrl}/api/message/getAll/${selectedUser._id}`, { withCredentials: true })
            .then(r => dispatch(setmessages(r.data || [])))
            .catch(console.log)
    }, [selectedUser?._id])

    // Scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Live socket messages
    useEffect(() => {
        if (!socket) return
        const onNew = (mess) => dispatch(setmessages([...(messages || []), mess]))
        socket.on("newMessage", onNew)
        return () => socket.off("newMessage", onNew)
    }, [socket, messages])

    const handleImage = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setbackendImage(file)
        setfrontendImage(URL.createObjectURL(file))
    }

    const removeImage = () => {
        setbackendImage(null)
        setfrontendImage(null)
        if (imageInput.current) imageInput.current.value = ""
    }

    const sendMsg = async () => {
        if (sending) return
        if (!input.trim() && !backendImage) return
        setsending(true)
        try {
            const formData = new FormData()
            formData.append("message", input.trim())
            if (backendImage) formData.append("image", backendImage)
            const result = await axios.post(
                `${serverUrl}/api/message/send/${selectedUser._id}`,
                formData,
                { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
            )
            dispatch(setmessages([...(messages || []), result.data]))
            setinput("")
            setbackendImage(null)
            setfrontendImage(null)
            if (imageInput.current) imageInput.current.value = ""
        } catch (error) {
            console.log("send error:", error)
        }
        setsending(false)
    }

    if (!selectedUser) return null

    const canSend = input.trim().length > 0 || !!frontendImage

    return (
        <div className='bg-black w-full h-[100vh] flex flex-col'>

            {/* ── Header ── */}
            <div className='w-full flex items-center gap-[12px] px-[12px] py-[10px] border-b border-gray-800 bg-black flex-shrink-0'>
                <IoMdArrowBack
                    onClick={() => navigate("/messages")}
                    className='text-white h-[22px] w-[22px] cursor-pointer flex-shrink-0'
                />
                <div
                    className='relative cursor-pointer flex-shrink-0'
                    onClick={() => navigate(`/profile/${selectedUser.username}`)}
                >
                    <div className='w-[40px] h-[40px] rounded-full overflow-hidden border border-gray-600'>
                        <img src={selectedUser?.profileImage || dp} alt='' className='w-full h-full object-cover' />
                    </div>
                    {isOnline && (
                        <div className='absolute bottom-0 right-0 w-[11px] h-[11px] bg-green-500 rounded-full border-2 border-black' />
                    )}
                </div>
                <div
                    className='flex flex-col flex-1 min-w-0 cursor-pointer'
                    onClick={() => navigate(`/profile/${selectedUser.username}`)}
                >
                    <span className='text-white font-semibold text-[15px] truncate'>{selectedUser.username}</span>
                    <span className='text-[12px] text-gray-400'>{isOnline ? 'Active now' : selectedUser.name}</span>
                </div>
                <button 
                    onClick={() => startCall(selectedUser._id, selectedUser)}
                    className='text-white hover:text-emerald-400 p-2 rounded-full hover:bg-zinc-900 transition-all flex-shrink-0 cursor-pointer'
                    title="Start Video Call"
                >
                    <IoVideocam size={22} />
                </button>
            </div>

            {/* ── Message list ── */}
            <div className='flex-1 overflow-y-auto px-[16px] py-[12px] flex flex-col gap-[10px]'>
                {(!messages || messages.length === 0) && (
                    <div className='flex flex-col items-center gap-[10px] mt-[60px]'>
                        <div className='w-[72px] h-[72px] rounded-full overflow-hidden border border-gray-700'>
                            <img src={selectedUser?.profileImage || dp} alt='' className='w-full h-full object-cover' />
                        </div>
                        <span className='text-white font-semibold text-[16px]'>{selectedUser.username}</span>
                        <span className='text-gray-500 text-[14px]'>No messages yet. Say hi!</span>
                    </div>
                )}
                {Array.isArray(messages) && messages.map((mess, index) =>
                    mess?.sender === userData?._id
                        ? <SenderMessage key={mess._id || index} message={mess} />
                        : <ReceiverMessage key={mess._id || index} message={mess} />
                )}
                <div ref={bottomRef} />
            </div>

            {/* ── Image preview ── */}
            {frontendImage && (
                <div className='px-[16px] pb-[6px] flex-shrink-0'>
                    <div className='relative w-[80px] h-[80px]'>
                        <img src={frontendImage} alt='' className='w-full h-full object-cover rounded-xl' />
                        <button
                            onClick={removeImage}
                            className='absolute top-[-6px] right-[-6px] bg-gray-600 text-white rounded-full w-[20px] h-[20px] text-[13px] flex items-center justify-center'
                        >×</button>
                    </div>
                </div>
            )}

            {/* ── Input bar ── */}
            <div className='w-full px-[12px] py-[10px] border-t border-gray-800 bg-black flex-shrink-0'>
                <div className='w-full flex items-center gap-[10px]'>
                    <input
                        type='file'
                        accept='image/*'
                        hidden
                        ref={imageInput}
                        onChange={handleImage}
                    />
                    <FaImages
                        className='w-[24px] h-[24px] text-gray-400 cursor-pointer flex-shrink-0'
                        onClick={() => imageInput.current?.click()}
                    />
                    <div className='flex-1 bg-gray-900 rounded-full px-[16px] py-[9px] flex items-center gap-[8px]'>
                        <input
                            type='text'
                            placeholder='Message...'
                            value={input}
                            className='flex-1 text-[15px] text-white outline-none bg-transparent placeholder:text-gray-500'
                            onChange={(e) => setinput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    sendMsg()
                                }
                            }}
                        />
                    </div>
                    {canSend ? (
                        <button
                            onClick={sendMsg}
                            disabled={sending}
                            className='text-blue-400 font-semibold text-[15px] cursor-pointer flex-shrink-0 disabled:opacity-50'
                        >
                            Send
                        </button>
                    ) : (
                        <IoSend className='w-[22px] h-[22px] text-gray-600 flex-shrink-0' />
                    )}
                </div>
            </div>
        </div>
    )
}

export default MessageArea
