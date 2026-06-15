import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Loading = () => {

  const {nextUrl} = useParams()
  const navigate = useNavigate()

  useEffect(()=>{
    if(nextUrl) {
      setTimeout(() => {
        navigate('/' + nextUrl) //next url will just hold the url for my-bookings page
      }, 8000);
    }
  },[])
  return (
    <div>
      <div className='flex justify-center items-center h-[80vh]'>
        <div className='animate-spin rounded-full h-14 w-14 border-2 border-t-primary'></div>
    </div>
    </div>
  )
}

export default Loading
