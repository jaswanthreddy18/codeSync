import React, { useEffect, useRef, useState } from 'react'
import Client from './Client';
import Editor from './Editor';
import { initSocket } from '../src/socket';
import ACTIONS from '../shared/actions';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
const EditorPage = () => {
    const navigate = useNavigate();
    const socketRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const location = useLocation();
    const params = useParams();
    const roomId = params.id;
    const [clients, setClients] = useState([]);
    // console.log(clients);
    useEffect(() => {
        const init = async () => {
            try {
                socketRef.current = await initSocket();
                socketRef.current.on('connect_error', (err) => handleError(err));
                socketRef.current.on('connect_failed', (err) => handleError(err));
                const handleError = (e) => {
                    console.log("socket error", e);
                    toast.error("socket connection failed");
                    navigate('/');
                }
                socketRef.current.emit(ACTIONS.JOIN, {
                    roomId,
                    username: location.state?.username
                })
                socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined the room.`);
                    }
                    setClients(clients);
                })
                socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(client => client.socketId != socketId)
                    });
                })
            } catch (error) {
                toast.error("Socket Connection failed, try again later.")
                navigate('/');
                console.log("connection faliled", error);
            }
        }
        init();
        return () => {
            socketRef.current?.disconnect();
            socketRef.current?.off(ACTIONS.JOINED).disconnect();
            socketRef.current?.off(ACTIONS.JOIN).disconnect();
            socketRef.current?.off(ACTIONS.DISCONNECTED).disconnect();
        }
    }, [])
    const handleCopy = () => {
        navigator.clipboard.writeText(roomId).then(() => {
            toast.success("ROOM ID copied!");
        }).catch(err => console.error("Failed to copy:", err));
    }
    const handleLeave = () => {
        navigate("/", { replace: true });
    }
    if(!location.state) {
        navigate('/');
    }
    return (
        <div className='flex gap-4 h-screen bg-gradient-to-r from-slate-900 to-slate-700 text-white'>
            <div className='h-full w-60 shadow-2xl shadow-black bg-slate-950 p-4 flex flex-col justify-between'>
                <div>
                    <div className='flex items-center gap-3 border-b-1 border-gray-600 pb-3'>
                        <img className='h-12 rounded-[5px]' src="/logo.jpeg" alt="" />
                        <div className='text-left'>
                            <h2 className='text-xl font-bold '>
                                Code<span className='text-slate-500'>Sync</span>
                            </h2>
                            <p className='text-[7px] font-bold text-gray-500'>Sync. Code. Conquer.</p>
                        </div>
                    </div>
                    <div className='pt-5'>
                        <h3 className='mb-5 font-bold'>Connected</h3>
                        <div className='flex items-center gap-4 flex-wrap'>
                            {
                                clients.map(client => <Client key={client.socketId} username={client.username} />)
                            }
                        </div>
                    </div>
                </div>
                <div>
                    <button onClick={handleCopy} className='w-full py-2 mt-3 rounded-[5px] bg-white  font-bold cursor-pointer text-black hover:bg-gray-200 transition duration-300 ease-in-out'>Copy ROOM ID</button>
                    <button onClick={() => setShowModal(true)} className=' w-full py-2 mt-3 rounded-[5px] bg-red-500 text-white font-bold cursor-pointer hover:bg-red-700 transition duration-300 ease-in-out'>Leave</button>
                    {showModal && (
                        <div className='bg-white text-black rounded-lg mt-3 py-2 px-3 flex items-center justify-center flex-col'>
                            <p className='font-bold'>Are you sure you want to leave?</p> 
                            <div className='flex gap-3 mt-3'>
                            <button className='border rounded-lg py-2 px-4 cursor-pointer bg-slate-950 text-white hover:bg-slate-800 ransition duration-300 ease-in-out text-sm' onClick={handleLeave}>Yes</button>
                            <button className='border rounded-lg py-2 px-4 cursor-pointer bg-slate-950 text-white hover:bg-slate-800 ransition duration-300 ease-in-out text-sm' onClick={() => setShowModal(false)}>No</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div>
                <Editor socketRef={socketRef} roomId={roomId} />
            </div>
        </div>
    )
}

export default EditorPage