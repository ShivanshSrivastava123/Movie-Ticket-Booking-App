import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets'
import { ArrowRightIcon, ChevronRight, Clock } from 'lucide-react'
import Loading from '../Components/Loading'
import isoTimeFormat from '../../lib/isoTimeFormat'
import toast from 'react-hot-toast'

const SeatLayout = () => {

  const getRows = [['A','B'],['C','D'],['E','F'],['G','H'],['I','J'],['K','L']]

  const {id,date} = useParams()
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedShow, setSelectedShow] = useState(null)
  const[selectedSeats, setSelectedSeats] = useState([])
  const[occupiedSeats, setOccupiedSeats] = useState([])
  const navigate = useNavigate()

  const getShow = () => {
    const show = dummyShowsData.find(show => show._id == id)
    if(show) {
      setSelectedShow({
        movie : show,
        dateTime : dummyDateTimeData
      })
    }
  }

  const handleClick = (seatId) => {
    if(!selectedTime) return toast('Select a valid time')
    if(!selectedSeats.includes(seatId) && selectedSeats.length > 4) return toast('You cannot select more than 5 seats')
    if(occupiedSeats.includes(seatId)) return toast('This seat is already booked')
    
    setSelectedSeats(prev => (selectedSeats.includes(seatId) ? selectedSeats.filter((curr)=>(seatId !== curr)) : [...prev, seatId]))
  }

  useEffect(()=>{
    getShow();
  },[])

  const renderSeats = (row, count = 9) => (
    <div>
      <div>
        {Array.from({length : count} , (_,i) => {

          const seatId = `${row}${i+1}`

          return (

            <button key={seatId} onClick={()=>handleClick(seatId)} className={`h-8 w-8 rounded border border-primary/60 cursor-pointer ${selectedSeats.includes(seatId) && "bg-primary text-white"} ${occupiedSeats.includes(seatId) && "opacity-50"}`}>
              <span>{seatId}</span>
            </button>

          )
        })}
      </div>
    </div>
  )

  return selectedShow ? (
    <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50'>
      <div className='w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30'>
        <div className='text-lg font-semibold px-6'>Available Timings</div>
        <div className='mt-5 space-y-1'>
          { 
            //here bracket notation is used as .date would mean that i want the date property
            selectedShow.dateTime[date].map((timedate)=>(
              <div onClick={()=>(setSelectedTime(timedate))} key={timedate.showId} className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${(selectedTime && (selectedTime.showId == timedate.showId)) ? "bg-primary text-white" : "hover:bg-primary/20"}`}>
                <Clock />
                <div>{isoTimeFormat(timedate.time)}</div>
              </div>
            ))
          }
        </div>
        <div>

        </div>
      </div>

      

      <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
        
        <div className='text-2xl font-semibold mb-4'>Select your Seats</div>
        <img src={assets.screenImage} alt="" />
        <div className='text-gray-400 text-sm mb-6'>SCREEN SIDE</div>
        
        <div className='flex flex-col items-center mt-10 text-xs text-gray-300'>
          <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
            {
              getRows[0].map((ch) => (renderSeats(ch)))
            }
          </div>
          <div className='grid grid-cols-2 gap-11'>
            {getRows.slice(1).map((group,idx)=>(
              <div>
                {group.map((ch) => (
                  renderSeats(ch)
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <button onClick={()=>navigate('/my-bookings')} className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'>
          <span>Proceed to Checkout</span>
          <ArrowRightIcon strokeWidth={3} className="w-4 h-4"/>
        </button>

      </div>
    </div>
  ) : <Loading />
}

export default SeatLayout
