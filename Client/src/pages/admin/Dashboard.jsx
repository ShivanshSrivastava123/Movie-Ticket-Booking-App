import React, { useEffect, useState } from 'react'
import Title from '../../Components/admin/Title'
import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, UsersIcon } from 'lucide-react';
import { dummyDashboardData } from '../../assets/assets';
import { useAppContext } from '../../Context/AppContext';
import toast from 'react-hot-toast';
import { dateFormat } from '../../../lib/dateFormat';
import Loading from '../../Components/Loading';

const Dashboard = () => {
  const {axios, getToken, user, tmdb_image_base_url} = useAppContext();
  const [dashboardData, setDashboardData] = useState({
        totalBookings: 0,
        totalRevenue: 0,
        activeShows: [],
        totalUser: 0
    });
    const [loading, setLoading] = useState(true);

    const dashboardCards = [
        { title: "Total Bookings", value: dashboardData.totalBookings || "0", icon: ChartLineIcon },
        { title: "Total Revenue", value: `$${dashboardData.totalRevenue}`  || "0", icon: CircleDollarSignIcon },
        { title: "Active Shows", value: dashboardData.activeShows.length || "0", icon: PlayCircleIcon },
        { title: "Total Users", value: dashboardData.totalUser || "0", icon: UsersIcon }
    ]

    const fetchDashboardData = async () => {
      try {
        const {data} = await axios.get('/api/admin/dashboard' , {
          headers: {Authorization: `Bearer ${await getToken()}`}
        }) 

        if(data.success) {
          setDashboardData(data.dashboardData)
          setLoading(false)
        } 
        else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    useEffect(()=>{
      fetchDashboardData();
    },[])
  return !loading ? (
    <>
      <Title text1={`Admin`} text2={`Dashboard`}/>
      <div>
        <div className="relative flex flex-wrap gap-4 mt-6">
          <div className="flex flex-wrap gap-4 w-full">
            {
              dashboardCards.map((card, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full">
                  <div>
                    <h1 className="text-sm">{card.title}</h1>
                    <div className="text-xl font-medium mt-1">{card.value}</div>
                  </div>
                  <card.icon className="w-6 h-6"/>
                </div>
              ))
            }
          </div>
        </div>
        
        <p className="mt-10 text-lg font-medium">Active Shows</p>
        <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
          {
            dashboardData.activeShows.map((show, idx)=>(
              <div key={idx} className="w-55 rounded-lg overflow-hidden h-full pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300">
                <img src={tmdb_image_base_url + show.movie.poster_path} alt="" className="h-60 w-full object-cover"/>
                <div className="font-medium p-2 truncate">{show.movie.title}</div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-lg font-medium">${show.showPrice}</span>
                  <span className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
                    <StarIcon className="w-4 h-4 text-primary fill-primary"/>
                    <span>{show.movie.vote_average.toFixed(1)}</span>
                  </span>
                </div>
                <p className="px-2 pt-2 text-sm text-gray-500">{dateFormat(show.showDateTime)}</p>
              </div>
            ))
          }
        </div>
      </div>
      
    </>
  ) : <Loading />
}

export default Dashboard
