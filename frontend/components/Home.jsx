import React, { useState } from 'react'
import { toast } from 'sonner';
import { v4 as uuidv4 } from "uuid";
import { Link, useNavigate } from "react-router-dom";
const Home = () => {
    const navigate = useNavigate()
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const createNewRoom = (e) => {
        e.preventDefault();
        setRoomId(uuidv4());
        toast.success("New room created")
    }
    const joinRoom = () => {
        if(!roomId || !username){
            toast.error("Something is missing");
            return;
        }
        navigate(`/editor/${roomId}`, {
            state: {
                username,
            }
        });
    }
    const handelEnter = (e) => {
        if(e.code === 'Enter') {
            joinRoom();
        }
    }
    return (
        <div className='flex justify-center items-center h-screen bg-gradient-to-r from-slate-900 to-slate-700'>
            <div className='w-[400px] h-[400px] border rounded-[5px] p-5 bg-gray-200 shadow-2xl shadow-black'>
                <div className='flex items-center gap-4'>
                    <img className='h-20 rounded-[5px]' src="logo.jpeg" alt="" />
                    <div className='text-left'>
                        <h2 className='text-3xl font-bold '>
                            Code<span className='text-slate-500'>Sync</span>
                        </h2>
                        <p className='text-sm font-bold text-gray-500'>Sync. Code. Conquer.</p>
                    </div>
                </div>
                <h3 className='font-bold text-sm text-gray-800 mt-11'>Drop Your Room ID & Dive In!</h3>
                <input onKeyUp={handelEnter} type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder='ROOM ID' className='border w-full h-9 bg-white border-gray-400 mt-5 p-3 rounded-[5px]' />
                <input onKeyUp={handelEnter} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder='USERNAME' className='border w-full h-9 bg-white border-gray-400 mt-3 p-3 rounded-[5px]' />
                <button onClick={joinRoom} className='border w-full py-2 mt-3 rounded-[5px] bg-slate-700 text-white font-bold cursor-pointer hover:bg-slate-600 transition duration-300 ease-in-out'>Join</button>
                <div className='flex justify-center items-center mt-3'><p className='text-sm'>If you don't have an invite then create <a  onClick={createNewRoom} href="" className='text-blue-500 underline hover:text-blue-400'>new room</a></p></div>
            </div>
        </div>
    )
}

export default Home