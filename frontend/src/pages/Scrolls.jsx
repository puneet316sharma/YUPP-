import React from 'react'
import { useNavigate } from 'react-router-dom'
import Scrollcard from './components/Scrollcard'
import { useSelector } from 'react-redux'
import { IoMdArrowBack } from "react-icons/io"

function Scrolls() {
    const navigate = useNavigate()
    const scrollData = useSelector(state => state.scroll?.scrollData || [])

    return (
        <div className='w-screen h-screen bg-black overflow-hidden relative'>
            {/* Back button floats over the video */}
            <div className='absolute top-[14px] left-[14px] z-[300] flex items-center gap-[10px]'>
                <IoMdArrowBack
                    onClick={() => navigate("/")}
                    className='text-white h-[24px] w-[24px] cursor-pointer drop-shadow-lg'
                />
                <span className='text-white font-bold text-[18px] drop-shadow-lg'>Scrolls</span>
            </div>

            {/* Vertical snap scroll container */}
            <div className='h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide'>
                {Array.isArray(scrollData) && scrollData.length === 0 && (
                    <div className='h-screen flex flex-col items-center justify-center gap-3'>
                        <span className='text-gray-500 text-[18px]'>No reels yet</span>
                        <span
                            className='text-white underline cursor-pointer text-[15px]'
                            onClick={() => navigate("/upload")}
                        >Upload one</span>
                    </div>
                )}
                {Array.isArray(scrollData) && scrollData.map((scroll, index) => (
                    <div className='h-screen w-full snap-start snap-always' key={scroll._id || index}>
                        <Scrollcard scroll={scroll} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Scrolls
