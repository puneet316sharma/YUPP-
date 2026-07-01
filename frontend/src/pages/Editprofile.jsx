import React, { useRef, useState } from 'react'
import axios from 'axios'
import { IoMdArrowBack } from "react-icons/io"
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import dp from "../assets/dp.png"
import { serverUrl } from '../App'
import { setprofileData, setuserData } from '../redux/userslic'
import { ClipLoader } from 'react-spinners'

function Editprofile() {
    const { userData } = useSelector(state => state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const imageInput = useRef()

    const [name, setname] = useState(userData?.name || "")
    const [username, setusername] = useState(userData?.username || "")
    const [bio, setbio] = useState(userData?.bio || "")
    const [profession, setprofession] = useState(userData?.profession || "")
    const [gender, setgender] = useState(userData?.gender || "")
    const [frontendImage, setfrontendImage] = useState(userData?.profileImage || dp)
    const [backendImage, setbackendImage] = useState(null)
    const [loading, setloading] = useState(false)
    const [err, seterr] = useState("")

    const handleImage = (e) => {
        const file = e.target.files[0]   // was e.target.value.files[0] — always undefined
        if (!file) return
        setbackendImage(file)
        setfrontendImage(URL.createObjectURL(file))
    }

    const handleEditprofile = async () => {   // removed stray (req,res) params
        setloading(true)
        seterr("")
        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("username", username)
            formData.append("bio", bio)
            formData.append("profession", profession)
            formData.append("gender", gender)
            if (backendImage) {
                formData.append("profileImage", backendImage)
            }
            const result = await axios.post(
                `${serverUrl}/api/user/editprofile`,
                formData,
                { withCredentials: true }
            )
            dispatch(setprofileData(result.data))
            dispatch(setuserData(result.data))
            setloading(false)
            // navigate to updated username, not the stale pre-edit one
            navigate(`/profile/${result.data.username}`)
        } catch (error) {
            console.log(error)
            seterr(error.response?.data?.message || "Failed to update profile")
            setloading(false)
        }
    }

    return (
        <div className='w-full min-h-[100vh] bg-black flex items-center flex-col gap-[20px]'>
            <div className='w-full h-[80px] flex items-center gap-[20px] px-[20px]'>
                <IoMdArrowBack
                    onClick={() => navigate(`/profile/${userData?.username}`)}
                    className='text-white h-[25px] w-[25px] cursor-pointer'
                />
                <h1 className='text-white text-[20px] font-semibold'>Edit Profile</h1>
            </div>

            <div
                className='w-[100px] h-[100px] border-2 border-gray-600 rounded-full cursor-pointer overflow-hidden'
                onClick={() => imageInput.current.click()}
            >
                <input type='file' accept='image/*' ref={imageInput} hidden onChange={handleImage} />
                <img src={frontendImage} alt='' className='w-full h-full object-cover' />
            </div>

            <div className='text-blue-500 text-center text-[18px] font-semibold cursor-pointer' onClick={() => imageInput.current.click()}>
                Change Profile Picture
            </div>

            <input type="text" className='w-[90%] max-w-[600px] h-[60px] bg-[#0a1010] border-2 border-gray-700 rounded-2xl px-[20px] text-white font-semibold outline-none' placeholder='Enter Your Name' onChange={(e) => setname(e.target.value)} value={name} />
            <input type="text" className='w-[90%] max-w-[600px] h-[60px] bg-[#0a1010] border-2 border-gray-700 rounded-2xl px-[20px] text-white font-semibold outline-none' placeholder='Enter Your Username' onChange={(e) => setusername(e.target.value)} value={username} />
            <input type="text" className='w-[90%] max-w-[600px] h-[60px] bg-[#0a1010] border-2 border-gray-700 rounded-2xl px-[20px] text-white font-semibold outline-none' placeholder='Bio' onChange={(e) => setbio(e.target.value)} value={bio} />
            <input type="text" className='w-[90%] max-w-[600px] h-[60px] bg-[#0a1010] border-2 border-gray-700 rounded-2xl px-[20px] text-white font-semibold outline-none' placeholder='Enter Your Profession' onChange={(e) => setprofession(e.target.value)} value={profession} />
            <input type="text" className='w-[90%] max-w-[600px] h-[60px] bg-[#0a1010] border-2 border-gray-700 rounded-2xl px-[20px] text-white font-semibold outline-none' placeholder='Enter Your Gender' onChange={(e) => setgender(e.target.value)} value={gender} />

            {err && <p className='text-red-500 font-semibold'>{err}</p>}

            <button
                className='px-[10px] w-[60%] max-w-[400px] py-[5px] h-[50px] bg-white cursor-pointer rounded-2xl font-semibold disabled:opacity-60'
                onClick={handleEditprofile}
                disabled={loading}
            >
                {loading ? <ClipLoader size={30} color='black' /> : "Save Profile"}
            </button>
        </div>
    )
}

export default Editprofile
