import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const SelectDate = ({dateTime, id}) => {

  const navigate = useNavigate()
  const [selected, selectDate] = useState()

  const onClickHandler = () => {
    if(!selected) {
      return toast(`Please select a valid date`)
    }
    else {
      navigate(`/movies/${id}/${selected}`)
    }
  }


  return (
    <div id='dateSelect' className='pt-30'>
      <div className='flex flex-col md:flex-row items-center justify-between gap-10 relative  p-8 bg-primary/10 border border-primary/20 rounded-lg'>
        <div>
          <div className='text-lg font-semibold'>Choose Date</div>
          <span className='flex items-center gap-6 text-sm mt-5'>
            <ChevronLeft />
            <span className='grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4'>
              {
                Object.keys(dateTime).map((date)=>(
                  <button onClick={()=>(selectDate(date))} key={date} className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer ${selected === date ? "bg-primary text-white" : "border border-primary/70"}`}>
                    <span>{new Date(date).getDate()}</span>
                    <span>{new Date(date).toLocaleDateString("en-US", {month : "short"})}</span>
                  </button>
                ))
              }
            </span>

            <ChevronRight />
          </span> 
        </div>
        <div onClick={onClickHandler} className='bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer'>Book Now</div>
      </div>
    </div>
  )
}

export default SelectDate
