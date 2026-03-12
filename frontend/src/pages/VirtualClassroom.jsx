import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { Video, Mic, MicOff, VideoOff, MessageSquare, Hand, X, Users, Maximize, Minimize, MonitorUp, Smile, Shield, ShieldCheck } from 'lucide-react';
import apiClient from '../api/apiClient';

const VirtualClassroom = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { roomId } = useParams();

    // Live Class Info State
    const [classData, setClassData] = useState(null);

    // WebRTC & Socket State
    const [peers, setPeers] = useState([]);
    const [peerStreams, setPeerStreams] = useState({});
    const [stream, setStream] = useState(null);
    const [messages, setMessages] = useState([]);

    // UI Controls State
    const [audioMuted, setAudioMuted] = useState(false);
    const [videoMuted, setVideoMuted] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
    const chatOpenRef = useRef(chatOpen);

    useEffect(() => {
        chatOpenRef.current = chatOpen;
        if (chatOpen) {
            setHasUnreadMessages(false);
        }
    }, [chatOpen]);

    const [msgInput, setMsgInput] = useState('');
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [studentsCanShare, setStudentsCanShare] = useState(false);

    // Reactions State
    const [showEmojis, setShowEmojis] = useState(false);
    const [floatingReactions, setFloatingReactions] = useState([]);
    const [raisedHands, setRaisedHands] = useState(new Set());

    // Layout State
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [focusMode, setFocusMode] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const controlsTimeoutRef = useRef(null);
    const containerRef = useRef(null); // Reference for fullscreen triggering

    const socketRef = useRef();
    const peersRef = useRef([]);

    const myUserData = { _id: user._id, name: user.name, role: user.role };

    useEffect(() => {
        if (!roomId) {
            alert('Invalid Room ID');
            navigate('/dashboard');
            return;
        }

        let isMounted = true;
        const backendUrl = import.meta.env.VITE_API_BASE_URL
            ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
            : 'http://localhost:5000';

        const socket = io(backendUrl);
        socketRef.current = socket;
        let myStream = null;

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
            if (!isMounted) {
                currentStream.getTracks().forEach(t => t.stop());
                return;
            }
            myStream = currentStream;
            setStream(currentStream);

            // Trigger Auto-Attendance if Student
            if (user.role === 'student') {
                apiClient.post('/attendance', { liveClassId: roomId })
                    .catch(err => console.log('Attendance already marked or error:', err.message));
            }

            // Join the room with full user data
            socket.emit('join-room', roomId, myUserData);

            // When a new user connects
            socket.on('user-connected', (userData, socketId) => {
                const peer = createPeer(socketId, socket.id, currentStream, socket, myUserData);
                peersRef.current.push({ peerID: socketId, peer, userData });
                setPeers([...peersRef.current]);

                peer.on('stream', (remoteStream) => {
                    setPeerStreams(prev => ({ ...prev, [socketId]: remoteStream }));
                });
            });

            // When receiving an offer from a newly connected user
            socket.on('offer', (offer, callerId, callerUserData) => {
                const peer = addPeer(offer, callerId, currentStream, socket);
                peersRef.current.push({ peerID: callerId, peer, userData: callerUserData });
                setPeers([...peersRef.current]);

                peer.on('stream', (remoteStream) => {
                    setPeerStreams(prev => ({ ...prev, [callerId]: remoteStream }));
                });
            });

            socket.on('answer', (answer, answererId) => {
                const item = peersRef.current.find((p) => p.peerID === answererId);
                if (item) item.peer.signal(answer);
            });

            socket.on('ice-candidate', (candidate, id) => {
                const item = peersRef.current.find((p) => p.peerID === id);
                if (item) item.peer.signal(candidate);
            });

            socket.on('user-disconnected', (userData, socketId) => {
                const peerObj = peersRef.current.find((p) => p.peerID === socketId);
                if (peerObj) peerObj.peer.destroy();

                peersRef.current = peersRef.current.filter((p) => p.peerID !== socketId);
                setPeers([...peersRef.current]);

                setPeerStreams(prev => {
                    const newStreams = { ...prev };
                    delete newStreams[socketId];
                    return newStreams;
                });
            });

            socket.on('receive-message', (data) => {
                setMessages(prev => [...prev, data]);
                if (!chatOpenRef.current) {
                    setHasUnreadMessages(true);
                }
            });

            socket.on('screen-share-permission', (allowed) => {
                setStudentsCanShare(allowed);
            });

            socket.on('receive-reaction', (data) => {
                const reaction = {
                    id: Date.now() + Math.random(),
                    emoji: data.emoji,
                    senderName: data.senderName
                };
                setFloatingReactions(prev => [...prev, reaction]);

                // Cleanup reaction after animation
                setTimeout(() => {
                    setFloatingReactions(prev => prev.filter(r => r.id !== reaction.id));
                }, 4000);
            });

            socket.on('receive-hand-raise', (data) => {
                setRaisedHands(prev => {
                    const next = new Set(prev);
                    if (data.isRaised) {
                        next.add(data.senderId);
                    } else {
                        next.delete(data.senderId);
                    }
                    return next;
                });
            });

            // Fetch Live Class details to replace hardcoded header
            apiClient.get(`/live-classes/room/${roomId}`)
                .then(res => {
                    setClassData(res.data);
                })
                .catch(err => console.error('Error fetching class data:', err));

        }).catch(err => console.error(err));

        return () => {
            isMounted = false;
            socket.disconnect();
            if (myStream) {
                myStream.getTracks().forEach(track => track.stop());
            }
            peersRef.current.forEach(p => p.peer.destroy());
            peersRef.current = [];
            setPeers([]);
            setPeerStreams({});
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        }
    }, [user._id]);

    function createPeer(userToSignal, callerID, stream, socket, myUserData) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
            config: {
                iceServers: [
                    { urls: "stun:stun.relay.metered.ca:80" },
                    { urls: "turn:global.relay.metered.ca:80", username: "de13454314abd33a32f6a659", credential: "0o1bm14wTtttiyLw" },
                    { urls: "turn:global.relay.metered.ca:80?transport=tcp", username: "de13454314abd33a32f6a659", credential: "0o1bm14wTtttiyLw" },
                    { urls: "turn:global.relay.metered.ca:443", username: "de13454314abd33a32f6a659", credential: "0o1bm14wTtttiyLw" },
                    { urls: "turns:global.relay.metered.ca:443?transport=tcp", username: "de13454314abd33a32f6a659", credential: "0o1bm14wTtttiyLw" }
                ]
            }
        });

        peer.on('signal', (signal) => {
            if (signal.type === 'offer') {
                socket.emit('offer', signal, userToSignal, myUserData);
            } else if (signal.candidate) {
                socket.emit('ice-candidate', signal, userToSignal);
            }
        });

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream, socket) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
            config: {
                iceServers: [
                    { urls: "stun:stun.relay.metered.ca:80" },
                    { urls: "turn:global.relay.metered.ca:80", username: "de13454314abd33a32f6a659", credential: "0o1bm14wTtttiyLw" },
                    { urls: "turn:global.relay.metered.ca:80?transport=tcp", username: "de13454314abd33a32f6a659", credential: "0o1bm14wTtttiyLw" },
                    { urls: "turn:global.relay.metered.ca:443", username: "de13454314abd33a32f6a659", credential: "0o1bm14wTtttiyLw" },
                    { urls: "turns:global.relay.metered.ca:443?transport=tcp", username: "de13454314abd33a32f6a659", credential: "0o1bm14wTtttiyLw" }
                ]
            }
        });

        peer.on('signal', (signal) => {
            if (signal.type === 'answer') {
                socket.emit('answer', signal, callerID);
            } else if (signal.candidate) {
                socket.emit('ice-candidate', signal, callerID);
            }
        });

        peer.signal(incomingSignal);
        return peer;
    }

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = audioMuted;
            setAudioMuted(!audioMuted);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = videoMuted;
                setVideoMuted(!videoMuted);
            }
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                const screenTrack = screenStream.getVideoTracks()[0];
                const oldVideoTrack = stream.getVideoTracks()[0];

                // Replace video track for all connected peers using simple-peer API
                peersRef.current.forEach(p => {
                    p.peer.replaceTrack(oldVideoTrack, screenTrack, stream);
                });

                // Mix original audio with screen audio if present
                const audioTracks = [...stream.getAudioTracks()];
                if (screenStream.getAudioTracks().length > 0) {
                    audioTracks.push(...screenStream.getAudioTracks());
                }

                // Update local stream to show screen
                const newStream = new MediaStream([
                    screenTrack,
                    ...audioTracks
                ]);
                setStream(newStream);
                setIsScreenSharing(true);

                // Need a ref or state of the original track to revert properly, but we can just request camera again
                screenTrack.onended = () => {
                    revertToCamera(screenTrack);
                };
            } else {
                const currentVideoTrack = stream.getVideoTracks()[0];
                revertToCamera(currentVideoTrack);
            }
        } catch (error) {
            console.error('Error sharing screen:', error);
        }
    };

    const revertToCamera = async (currentScreenTrack) => {
        try {
            const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const cameraTrack = cameraStream.getVideoTracks()[0];

            peersRef.current.forEach(p => {
                try {
                    p.peer.replaceTrack(currentScreenTrack, cameraTrack, stream);
                } catch (e) { console.error(e) }
            });

            const newStream = new MediaStream([
                cameraTrack,
                ...stream.getAudioTracks()
            ]);

            // Maintain original mute state
            cameraTrack.enabled = !videoMuted;

            // Extract original audio tracks
            const originalAudio = stream.getAudioTracks().filter(t => t.label.toLowerCase().includes('microphone') || t.label.toLowerCase().includes('default') || t.label.toLowerCase().includes('communications'));
            const fallbackAudio = stream.getAudioTracks();

            setStream(newStream);
            setIsScreenSharing(false);
            if (currentScreenTrack) currentScreenTrack.stop();
        } catch (error) {
            console.error('Error reverting to camera:', error);
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (msgInput.trim()) {
            socketRef.current.emit('send-message', msgInput);
            setMsgInput('');
        }
    };

    const handleLeaveClass = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (socketRef.current) socketRef.current.disconnect();
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(err => console.error(err));
        }

        // Trigger Leave Attendance API if student
        if (user.role === 'student') {
            apiClient.put('/attendance/leave', { liveClassId: roomId }).catch(() => { });
        }

        navigate('/dashboard');
    };

    const handleLogAttendance = async () => {
        try {
            const studentIds = peersRef.current
                .filter(p => !['teacher', 'admin'].includes(p.userData?.role))
                .map(p => p.userData?._id)
                .filter(Boolean);

            if (studentIds.length === 0) return alert('No students currently in the room to log.');

            await apiClient.post(`/attendance/class/${roomId}/manual`, { studentIds });
            alert(`Successfully logged attendance for ${studentIds.length} connected student(s)!`);
        } catch (error) {
            console.error('Error logging attendance', error);
            alert('Failed to log attendance manually.');
        }
    };

    const sendReaction = (emoji) => {
        // Send to others
        socketRef.current.emit('send-reaction', { emoji, senderName: user.name });

        // Show locally immediately
        const reaction = {
            id: Date.now() + Math.random(),
            emoji: emoji,
            senderName: user.name
        };
        setFloatingReactions(prev => [...prev, reaction]);
        setShowEmojis(false);

        setTimeout(() => {
            setFloatingReactions(prev => prev.filter(r => r.id !== reaction.id));
        }, 4000);
    };

    const toggleHandRaise = () => {
        const currentlyRaised = raisedHands.has(user._id);
        const newState = !currentlyRaised;

        socketRef.current.emit('send-hand-raise', {
            isRaised: newState,
            senderId: user._id,
            senderName: user.name
        });

        // Update local state immediately
        setRaisedHands(prev => {
            const next = new Set(prev);
            if (newState) next.add(user._id);
            else next.delete(user._id);
            return next;
        });
    };

    const toggleStudentScreenShare = () => {
        const newState = !studentsCanShare;
        setStudentsCanShare(newState);
        socketRef.current.emit('allow-student-share', roomId, newState);
    };

    const canShareScreen = ['admin', 'teacher'].includes(user.role) || (user.role === 'student' && studentsCanShare);

    // --- Mouse Activity Tracker for Focus Mode Controls ---
    const handleMouseMove = () => {
        if (!focusMode) return;
        setControlsVisible(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (focusMode && !chatOpen) { // Keep controls if chat is open in focus mode (optional, but good UX)
                setControlsVisible(false);
            }
        }, 3000);
    };

    // Auto-hide controls & handle Native Fullscreen when entering focus mode
    useEffect(() => {
        if (focusMode) {
            handleMouseMove();
            // Enter Native Fullscreen
            if (containerRef.current && containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen().catch(err => {
                    console.error("Error attempting to enable fullscreen:", err);
                });
            }
        } else {
            setControlsVisible(true);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            // Exit Native Fullscreen
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(err => {
                    console.error("Error attempting to exit fullscreen:", err);
                });
            }
        }
    }, [focusMode, chatOpen]);

    // Handle user exiting fullscreen manually (via ESC key)
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && focusMode) {
                setFocusMode(false);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [focusMode]);


    // --- Layout Logic ---
    const allParticipants = [
        // Always include the local user
        { isLocal: true, peerID: 'local', userData: myUserData, stream: stream },
        // Add remote peers
        ...peers.map(p => ({
            isLocal: false,
            peerID: p.peerID,
            userData: p.userData,
            stream: peerStreams[p.peerID]
        }))
    ];

    const hosts = allParticipants.filter(p => ['teacher', 'admin'].includes(p.userData?.role));
    const students = allParticipants.filter(p => !['teacher', 'admin'].includes(p.userData?.role));

    let mainStage = [];
    let sidebarStage = [];

    // Focus mode always zeroes in on the first host, or the first student if no host.
    let focusTarget = null;

    if (hosts.length > 0) {
        mainStage = hosts;
        sidebarStage = students;
        focusTarget = hosts[0];
    } else {
        mainStage = students.slice(0, 4);
        sidebarStage = students.slice(4);
        if (students.length > 0) focusTarget = students[0];
    }

    // ==========================================
    // RENDER: FOCUS MODE (IMMERSIVE FULLSCREEN)
    // ==========================================
    if (focusMode && focusTarget) {
        return (
            <div
                ref={containerRef}
                className="h-screen w-screen bg-black flex flex-col relative overflow-hidden"
                onMouseMove={handleMouseMove}
                onClick={handleMouseMove} // Also trigger on click (e.g., mobile tap)
            >
                {/* Full Screen Video */}
                <div className="absolute inset-0 z-0">
                    <ParticipantVideo isLocal={focusTarget.isLocal} userData={focusTarget.userData} stream={focusTarget.stream} isMain={true} noLabel={true} isHandRaised={raisedHands.has(focusTarget.userData._id)} />
                </div>

                {/* Floating Chat Overlay (Optional) */}
                {chatOpen && (
                    <div className="absolute top-4 right-4 bottom-24 w-80 bg-slate-900/90 backdrop-blur-md rounded-xl shadow-2xl flex flex-col border border-slate-700/50 z-20 transition-all duration-300">
                        <div className="p-4 border-b border-slate-700/50 flex justify-between items-center text-white shrink-0">
                            <h3 className="font-semibold text-sm">Class Chat</h3>
                            <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white cursor-pointer transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map((msg, i) => {
                                const isMe = msg.userData?._id === user._id;
                                return (
                                    <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[10px] text-slate-400 mb-1">
                                            {isMe ? 'You' : (msg.userData?.name || 'Unknown')}
                                        </span>
                                        <div className={`px-3 py-2 rounded-lg max-w-[85%] ${isMe ? 'bg-primary-600/90' : 'bg-slate-700/80'} break-words text-xs text-white`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={sendMessage} className="p-3 border-t border-slate-700/50 shrink-0">
                            <input
                                type="text"
                                value={msgInput}
                                onChange={e => setMsgInput(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-slate-800/80 border border-slate-600/50 rounded-full px-4 py-2 text-white text-xs focus:outline-none focus:border-primary-500"
                            />
                        </form>
                    </div>
                )}

                {/* Floating Controls (Auto-hiding) */}
                <div
                    className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-3 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700/50 transition-all duration-500 ease-in-out ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                >
                    <button onClick={toggleMute} className={`p-3 rounded-full ${audioMuted ? 'bg-red-500/90' : 'bg-slate-700/80 hover:bg-slate-600/90'} text-white transition cursor-pointer`}>
                        {audioMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <button onClick={toggleVideo} className={`p-3 rounded-full ${videoMuted ? 'bg-red-500/90' : 'bg-slate-700/80 hover:bg-slate-600/90'} text-white transition cursor-pointer`}>
                        {videoMuted ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>
                    <button onClick={toggleHandRaise} className={`p-3 rounded-full ${raisedHands.has(user._id) ? 'bg-yellow-500/90' : 'bg-slate-700/80 hover:bg-slate-600/90'} text-white transition cursor-pointer`}>
                        <Hand size={20} />
                    </button>
                    {['admin', 'teacher'].includes(user.role) && (
                        <button onClick={toggleStudentScreenShare} className={`p-3 rounded-full ${studentsCanShare ? 'bg-emerald-500/90' : 'bg-slate-700/80 hover:bg-slate-600/90'} text-white transition cursor-pointer`} title="Toggle Student Screen Share">
                            {studentsCanShare ? <ShieldCheck size={20} /> : <Shield size={20} />}
                        </button>
                    )}
                    {canShareScreen && (
                        <button onClick={toggleScreenShare} className={`p-3 rounded-full ${isScreenSharing ? 'bg-indigo-500/90' : 'bg-slate-700/80 hover:bg-slate-600/90'} text-white transition cursor-pointer`} title="Share Screen">
                            <MonitorUp size={20} />
                        </button>
                    )}
                    <button onClick={() => setChatOpen(!chatOpen)} className={`p-3 rounded-full relative ${chatOpen ? 'bg-primary-600/90' : 'bg-slate-700/80 hover:bg-slate-600/90'} text-white transition cursor-pointer`}>
                        <MessageSquare size={20} />
                        {hasUnreadMessages && !chatOpen && (
                            <span className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900"></span>
                        )}
                    </button>
                    <div className="w-px h-8 bg-slate-700 mx-2"></div>
                    <button onClick={() => setFocusMode(false)} className="p-3 rounded-full bg-slate-700/80 hover:bg-slate-600/90 text-white transition cursor-pointer" title="Exit Focus Mode">
                        <Minimize size={20} />
                    </button>
                    <button onClick={handleLeaveClass} className="bg-red-500/90 hover:bg-red-600 px-4 py-2 rounded-full text-sm font-medium text-white transition cursor-pointer ml-2">
                        Leave Class
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================
    // RENDER: NORMAL MODE (GRID + SIDEBAR)
    // ==========================================
    return (
        <div ref={containerRef} className="h-screen bg-slate-950 flex flex-col relative overflow-hidden text-slate-100">
            {/* Floating Reactions Layer */}
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                {floatingReactions.map(reaction => (
                    <div
                        key={reaction.id}
                        className="absolute bottom-24 left-1/2 animate-float-up opacity-0 flex flex-col items-center"
                        style={{
                            marginLeft: `${(Math.random() - 0.5) * 50}px`,
                            animationDuration: '3s'
                        }}
                    >
                        <span className="text-4xl drop-shadow-lg">{reaction.emoji}</span>
                        <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full mt-1">
                            {reaction.senderName}
                        </span>
                    </div>
                ))}
            </div>

            {/* Header */}
            <header className="bg-slate-900 px-6 py-3 flex justify-between items-center border-b border-slate-800 shrink-0 shadow-sm z-10">
                <div>
                    <h2 className="text-lg font-bold">
                        {classData ? classData.topic : 'Loading Class...'}
                    </h2>
                    <p className="text-xs text-slate-400">
                        {classData ? `${classData.subject?.name || 'Subject'} • ${classData.teacher?.name || 'Prof. Unknown'} • ${classData.status === 'ongoing' ? 'Ongoing' : 'Scheduled'}` : 'Connecting...'}
                    </p>
                </div>
                <div className="flex space-x-3 items-center">
                    {/* Top Right Controls */}
                    {['admin', 'teacher'].includes(user.role) && (
                        <button
                            onClick={handleLogAttendance}
                            className="flex items-center space-x-2 text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md transition cursor-pointer text-sm font-medium mr-2"
                            title="Log Attendance for currently joined students"
                        >
                            <span className="hidden sm:inline">Log Attendance</span>
                        </button>
                    )}
                    <button
                        onClick={() => setFocusMode(true)}
                        className="flex items-center space-x-2 text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition cursor-pointer text-sm font-medium"
                        title="Focus Mode (Teacher Video Only)"
                    >
                        <Maximize size={16} />
                        <span className="hidden sm:inline">Focus Mode</span>
                    </button>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-slate-800 transition cursor-pointer text-sm font-medium ${!sidebarOpen ? 'text-slate-400' : 'text-primary-400'}`}
                    >
                        <Users size={16} />
                        <span className="hidden sm:inline">Classmates</span>
                    </button>
                    <div className="w-px h-5 bg-slate-700 mx-1"></div>
                    <button onClick={handleLeaveClass} className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-sm font-medium transition cursor-pointer">
                        Leave Class
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-6 flex gap-6 overflow-hidden min-h-0 relative">

                {/* Video Grids Area */}
                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Main Stage Grid */}
                    <div className={`flex-1 grid gap-4 auto-rows-fr ${mainStage.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {mainStage.map(p => (
                            <ParticipantVideo key={p.peerID} isLocal={p.isLocal} userData={p.userData} stream={p.stream} isMain={true} isHandRaised={raisedHands.has(p.userData._id)} />
                        ))}
                    </div>

                    {/* Classmates Sidebar (Collapsible) */}
                    {sidebarOpen && sidebarStage.length > 0 && (
                        <div className="w-48 lg:w-64 flex flex-col gap-3 overflow-y-auto pr-2 shrink-0 animate-in slide-in-from-right-8 duration-300">
                            <h3 className="text-slate-300 text-xs font-semibold mb-1 uppercase tracking-wider">Classmates ({sidebarStage.length})</h3>
                            {sidebarStage.map(p => (
                                <div key={p.peerID} className="h-32 lg:h-40 shrink-0">
                                    <ParticipantVideo isLocal={p.isLocal} userData={p.userData} stream={p.stream} isMain={false} isHandRaised={raisedHands.has(p.userData._id)} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat Panel */}
                {chatOpen && (
                    <div className="w-80 bg-slate-900 rounded-xl shadow-2xl flex flex-col border border-slate-800 h-full shrink-0 animate-in slide-in-from-bottom-8 duration-300 z-10 absolute right-6 md:relative md:right-0">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                            <h3 className="font-semibold text-sm">Class Chat</h3>
                            <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white cursor-pointer transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map((msg, i) => {
                                const isMe = msg.userData?._id === user._id;
                                return (
                                    <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[10px] text-slate-400 mb-1">
                                            {isMe ? 'You' : (msg.userData?.name || 'Unknown')}
                                        </span>
                                        <div className={`px-3 py-2 rounded-lg max-w-[85%] ${isMe ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-200'} break-words text-sm`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={sendMessage} className="p-3 border-t border-slate-800 shrink-0">
                            <input
                                type="text"
                                value={msgInput}
                                onChange={e => setMsgInput(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                            />
                        </form>
                    </div>
                )}
            </div>

            {/* Controls Footer */}
            <footer className="bg-slate-900 p-4 border-t border-slate-800 flex justify-center space-x-4 items-center shrink-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.5)] z-10">
                <button onClick={toggleMute} className={`p-4 rounded-full shadow-lg ${audioMuted ? 'bg-red-500' : 'bg-slate-800 hover:bg-slate-700'} transition cursor-pointer`}>
                    {audioMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
                <button onClick={toggleVideo} className={`p-4 rounded-full shadow-lg ${videoMuted ? 'bg-red-500' : 'bg-slate-800 hover:bg-slate-700'} transition cursor-pointer`}>
                    {videoMuted ? <VideoOff size={22} /> : <Video size={22} />}
                </button>
                <button onClick={toggleHandRaise} className={`p-4 rounded-full shadow-lg ${raisedHands.has(user._id) ? 'bg-yellow-500' : 'bg-slate-800 hover:bg-slate-700'} transition cursor-pointer`}>
                    <Hand size={22} />
                </button>
                {['admin', 'teacher'].includes(user.role) && (
                    <button onClick={toggleStudentScreenShare} className={`p-4 rounded-full shadow-lg ${studentsCanShare ? 'bg-emerald-500' : 'bg-slate-800 hover:bg-slate-700'} transition cursor-pointer`} title="Allow Students to Share Screen">
                        {studentsCanShare ? <ShieldCheck size={22} /> : <Shield size={22} />}
                    </button>
                )}
                {canShareScreen && (
                    <button onClick={toggleScreenShare} className={`p-4 rounded-full shadow-lg ${isScreenSharing ? 'bg-indigo-500' : 'bg-slate-800 hover:bg-slate-700'} transition cursor-pointer`} title="Share Screen">
                        <MonitorUp size={22} />
                    </button>
                )}
                {/* Reactions Button with Popup */}
                <div className="relative">
                    <button
                        onClick={() => setShowEmojis(!showEmojis)}
                        className={`p-4 rounded-full shadow-lg ${showEmojis ? 'bg-indigo-500' : 'bg-slate-800 hover:bg-slate-700'} transition cursor-pointer`}
                    >
                        <Smile size={22} />
                    </button>
                    {showEmojis && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-3 flex gap-2 animate-in fade-in slide-in-from-bottom-4 z-40">
                            {['👍', '👏', '🎉', '❤️', '🤔', '🔥'].map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => sendReaction(emoji)}
                                    className="text-2xl hover:scale-125 transition-transform p-2 cursor-pointer"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button onClick={() => setChatOpen(!chatOpen)} className={`block relative p-4 rounded-full shadow-lg ${chatOpen ? 'bg-primary-600' : 'bg-slate-800 hover:bg-slate-700'} transition cursor-pointer`}>
                    <MessageSquare size={22} />
                    {hasUnreadMessages && !chatOpen && (
                        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-slate-900"></span>
                    )}
                </button>
            </footer>
        </div>
    );
};

const ParticipantVideo = ({ isLocal, userData, stream, isMain, noLabel = false, isHandRaised = false }) => {
    const ref = useRef();

    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className={`bg-slate-900 rounded-xl overflow-hidden relative shadow-lg ring-1 ring-slate-800/50 w-full h-full flex items-center justify-center ${isMain ? 'min-h-[200px]' : 'min-h-[100px]'}`}>
            {stream ? (
                <video playsInline autoPlay muted={isLocal} ref={ref} className="w-full h-full object-cover shadow-inner" />
            ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-400">
                        {userData?.name?.charAt(0) || 'U'}
                    </div>
                </div>
            )}

            {!noLabel && (
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-medium shadow-sm border border-white/10 flex items-center space-x-2">
                    <span>
                        {userData?.name || 'Student'}
                        <span className="text-slate-400 capitalize ml-1">({userData?.role || 'student'})</span>
                        {isLocal ? ' (You)' : ''}
                    </span>
                    {isHandRaised && <Hand size={14} className="text-yellow-400" />}
                </div>
            )}
            {noLabel && isHandRaised && (
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-2 rounded-full shadow-md z-10 text-yellow-400 border border-white/10">
                    <Hand size={18} />
                </div>
            )}
        </div>
    );
}

export default VirtualClassroom;
