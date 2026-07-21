import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { IoVideocam, IoVideocamOff, IoMic, IoMicOff } from "react-icons/io5";
import { ImPhoneHangUp } from "react-icons/im";
import { BsPhoneVibrate } from "react-icons/bs";
import dp from "../assets/dp.png";

const VideoCallContext = createContext(null);

export const useVideoCall = () => {
    return useContext(VideoCallContext);
};

export const VideoCallProvider = ({ children }) => {
    const { socket } = useSelector(state => state.socket || {});
    const { userData } = useSelector(state => state.user || {});

    const [callState, setCallState] = useState("idle"); // 'idle' | 'calling' | 'incoming' | 'connected'
    const [partnerId, setPartnerId] = useState(null);
    const [callerInfo, setCallerInfo] = useState(null); // name, username, profileImage, _id
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const pendingOffer = useRef(null);

    // Clean up streams & peer connection
    const cleanUp = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
            setRemoteStream(null);
        }
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setCallState("idle");
        setPartnerId(null);
        setCallerInfo(null);
        pendingOffer.current = null;
        setIsMuted(false);
        setIsVideoOff(false);
    };

    // End call locally and notify peer
    const endCall = () => {
        if (socket && partnerId) {
            socket.emit("call:end", { to: partnerId });
        }
        cleanUp();
    };

    // Toggle local audio mute
    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    // Toggle local video camera
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    // Initialize RTCPeerConnection
    const createPeerConnection = (targetUserId) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
                // Comment: In production, add TURN servers here (e.g. coturn) for NAT/firewall traversal.
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit("call:ice-candidate", { to: targetUserId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        peerConnection.current = pc;
        return pc;
    };

    // Start outgoing video call
    const startCall = async (targetUserId, calleeInfo) => {
        if (!socket || !userData) return;
        setCallState("calling");
        setPartnerId(targetUserId);
        setCallerInfo(calleeInfo); // Use target user info to show avatar/username while calling

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            const pc = createPeerConnection(targetUserId);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit("call:offer", {
                to: targetUserId,
                offer,
                callerInfo: {
                    _id: userData._id,
                    name: userData.name,
                    username: userData.username,
                    profileImage: userData.profileImage
                }
            });
        } catch (error) {
            console.error("Error accessing camera/mic:", error);
            alert("Error accessing camera or microphone. Please grant permissions.");
            cleanUp();
        }
    };

    // Answer incoming video call
    const answerCall = async () => {
        if (!socket || !partnerId || !pendingOffer.current) return;
        setCallState("connected");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            const pc = createPeerConnection(partnerId);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer.current));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit("call:answer", { to: partnerId, answer });
        } catch (error) {
            console.error("Error answering call:", error);
            alert("Failed to answer the call: " + error.message);
            endCall();
        }
    };

    // Decline incoming video call
    const declineCall = () => {
        endCall();
    };

    // Socket Event Observers
    useEffect(() => {
        if (!socket) return;

        const handleOffer = ({ from, offer, callerInfo }) => {
            if (callState !== "idle") {
                // If busy, end/decline automatically
                socket.emit("call:end", { to: from });
                return;
            }
            setCallState("incoming");
            setPartnerId(from);
            setCallerInfo(callerInfo);
            pendingOffer.current = offer;
        };

        const handleAnswer = async ({ answer }) => {
            if (peerConnection.current) {
                try {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
                    setCallState("connected");
                } catch (err) {
                    console.error("Error setting remote description:", err);
                    endCall();
                }
            }
        };

        const handleIceCandidate = async ({ candidate }) => {
            if (peerConnection.current) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Error adding ICE candidate:", err);
                }
            }
        };

        const handleCallEnd = () => {
            cleanUp();
        };

        socket.on("call:offer", handleOffer);
        socket.on("call:answer", handleAnswer);
        socket.on("call:ice-candidate", handleIceCandidate);
        socket.on("call:end", handleCallEnd);

        return () => {
            socket.off("call:offer", handleOffer);
            socket.off("call:answer", handleAnswer);
            socket.off("call:ice-candidate", handleIceCandidate);
            socket.off("call:end", handleCallEnd);
        };
    }, [socket, callState, partnerId]);

    // Handle window beforeunload / tab closures
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (partnerId && socket) {
                socket.emit("call:end", { to: partnerId });
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [partnerId, socket]);

    // Update video tags when streams change
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, callState]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, callState]);

    return (
        <VideoCallContext.Provider value={{ startCall, answerCall, declineCall, endCall, callState, callerInfo }}>
            {children}

            {/* ── Call Overlay UI ── */}
            {callState !== "idle" && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md select-none text-white font-sans transition-all duration-300">
                    
                    {/* Incoming Call Screen */}
                    {callState === "incoming" && (
                        <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/60 rounded-3xl border border-zinc-800 shadow-2xl max-w-[350px] w-[90%] text-center backdrop-blur-lg">
                            <div className="relative mb-6">
                                <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-emerald-500 shadow-lg animate-pulse">
                                    <img src={callerInfo?.profileImage || dp} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2.5 rounded-full text-white animate-bounce">
                                    <BsPhoneVibrate size={24} />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-emerald-400 mb-1">{callerInfo?.name || "YUPP User"}</h2>
                            <p className="text-sm text-gray-400 mb-8">@{callerInfo?.username || "user"} is calling you...</p>
                            
                            <div className="flex justify-center gap-6 w-full">
                                <button onClick={declineCall} className="w-[60px] h-[60px] rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-red-900/30 cursor-pointer">
                                    <ImPhoneHangUp size={24} />
                                </button>
                                <button onClick={answerCall} className="w-[60px] h-[60px] rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-emerald-950/30 cursor-pointer">
                                    <IoVideocam size={24} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Outgoing Call Screen */}
                    {callState === "calling" && (
                        <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/60 rounded-3xl border border-zinc-800 shadow-2xl max-w-[350px] w-[90%] text-center backdrop-blur-lg">
                            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-zinc-700 shadow-lg mb-6 relative">
                                <img src={callerInfo?.profileImage || dp} alt="" className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">{callerInfo?.name || "YUPP User"}</h2>
                            <p className="text-sm text-gray-400 mb-3">@{callerInfo?.username || "user"}</p>
                            <p className="text-sm text-emerald-400 font-semibold animate-pulse mb-8">Calling...</p>
                            
                            <button onClick={endCall} className="w-[60px] h-[60px] rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-red-900/30 cursor-pointer">
                                <ImPhoneHangUp size={24} />
                            </button>
                        </div>
                    )}

                    {/* Connected In-Call Screen */}
                    {callState === "connected" && (
                        <div className="relative w-full h-full flex flex-col justify-between">
                            
                            {/* Video Containers */}
                            <div className="absolute inset-0 w-full h-full bg-zinc-950 overflow-hidden">
                                {/* Remote Stream (Full Screen) */}
                                {remoteStream ? (
                                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950">
                                        <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-2 border-zinc-700 mb-4">
                                            <img src={callerInfo?.profileImage || dp} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-zinc-400 text-sm animate-pulse">Waiting for remote video...</p>
                                    </div>
                                )}

                                {/* Local Stream (Floating PIP) */}
                                <div className="absolute top-4 right-4 w-[110px] sm:w-[150px] aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10">
                                    {localStream && !isVideoOff ? (
                                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700">
                                                <img src={userData?.profileImage || dp} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Top Call Info */}
                            <div className="relative p-6 flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent z-10">
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                                    <img src={callerInfo?.profileImage || dp} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white text-sm">{callerInfo?.name || "YUPP User"}</h4>
                                    <span className="text-emerald-400 text-xs font-semibold">Connected</span>
                                </div>
                            </div>

                            {/* In-Call Controls Bar */}
                            <div className="relative p-8 flex justify-center gap-6 bg-gradient-to-t from-black/80 to-transparent z-10">
                                <button 
                                    onClick={toggleMute} 
                                    className={`w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                >
                                    {isMuted ? <IoMicOff size={22} /> : <IoMic size={22} />}
                                </button>
                                <button 
                                    onClick={endCall} 
                                    className="w-[50px] h-[50px] rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-red-900/30 cursor-pointer text-white"
                                >
                                    <ImPhoneHangUp size={22} />
                                </button>
                                <button 
                                    onClick={toggleVideo} 
                                    className={`w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                >
                                    {isVideoOff ? <IoVideocamOff size={22} /> : <IoVideocam size={22} />}
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            )}
        </VideoCallContext.Provider>
    );
};
