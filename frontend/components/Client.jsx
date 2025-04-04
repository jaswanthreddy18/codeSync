import React from 'react'

const Client = ({ username }) => {
    return (
        <div className='flex flex-col items-center gap-1'>
            <div
                className="w-12 h-12 flex items-center justify-center rounded-[10px] text-white text-xl bg-pink-500"
            >
                {username.slice(0, 2).toUpperCase()}
            </div>
            <span className='font-bold' >{username}</span>
        </div>
    )
}

export default Client