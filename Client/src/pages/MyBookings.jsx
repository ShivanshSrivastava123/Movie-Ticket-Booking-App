import React, { useEffect, useState } from 'react'
import { dummyBookingData } from '../assets/assets';
import Loading from '../Components/Loading';
import timeFormat from '../../lib/timeFormat';
import isoTimeFormat from '../../lib/isoTimeFormat';
import { dateFormat } from '../../lib/dateFormat';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const [loading, setLoading] = useState(true)
  const [mybookingdata, setMybookingdata] = useState([]);

  const getMyData = async () => {
    setLoading(false)
    setMybookingdata(dummyBookingData)
  }


  useEffect(()=>{
    getMyData();
  },[])

  return !loading ? (
    <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>
      <h1 className='text-lg font-semibold mb-4'>My Booking Data</h1>
      {
        mybookingdata.map((movie, index) => (
          <div key={index} className='flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl'>
            <div className='flex flex-col md:flex-row'>
              <img src={movie.show.movie.poster_path} alt="" className='md:max-w-45 aspect-video h-auto object-cover object-bottom rounded' />

              <div className='flex flex-col p-4'>
                <div className='text-lg font-semibold'>{movie.show.movie.title}</div>
                <div className='text-gray-400 text-sm'>{timeFormat(movie.show.movie.runtime)}</div>
                <div className='text-gray-400 text-sm mt-auto'>{dateFormat(movie.show.showDateTime)}</div>
              </div>

            </div>


            <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
              <div className='flex items-center gap-4'>
                <div className='text-2xl font-semibold mb-3'>${movie.amount}</div>
                {!movie.isPaid && <Link className='bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer'>Pay Now</Link>}
              </div>
              <div className='text-sm'>
                <span className='text-gray-400'>Total Tickets : {movie.bookedSeats.length}</span>
                <span className='text-gray-400'>Seat Number : {movie.bookedSeats.join(", ")}</span>
              </div>
            </div>


          </div>
        ))
      }
    </div>
  ) : <Loading />
}

export default MyBookings
