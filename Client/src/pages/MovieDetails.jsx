import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData, dummyCastsData } from '../assets/assets';
import { Heart, HeartIcon, PlayIcon, StarIcon } from 'lucide-react';
import timeFormat from '../../lib/timeFormat';
import SelectDate from '../Components/SelectDate';
import MovieCard from '../Components/MovieCard';
import Loading from '../Components/Loading';
import { useAppContext } from '../Context/AppContext';
import toast from 'react-hot-toast';

const MovieDetails = () => {
  const {id} = useParams();
  // accesess the value after the colon ie the movie id
  const {axios, getToken, shows, tmdb_image_base_url, favoriteMovies, user, fetchFavouriteMovies} = useAppContext()
  const [show, setShow] = useState(null);

  const find = async() => {
    try {
      const {data} = await axios.get(`/api/show/${id}`)
      
      if(data.success) {
        setShow(data)
      }
      else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const updateFavourite = async()=> {
    try {
      if(!user) {
        return toast.error(`Please login to add favourite movies`)
      }
      const {data} = await axios.post('/api/user/update-favourite', {movieId : id} , {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })

      if(data.success) {
        await fetchFavouriteMovies()
        toast.success(data.message)
      }
      else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast(error.message)
    }
  }

  useEffect(() => {
    find()
  }, [id])

  const navigate = useNavigate();
  return show ? (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
        <img  src={tmdb_image_base_url + show.movie.poster_path} alt="" className='max-md:mx-auto rounded-xl h-104 max-w-70 object-cover'/>
        <div className='relative flex flex-col gap-3'>
          <p className='text-primary'>ENGLISH</p>
          <p className='text-4xl font-semibold max-w-96 text-balance'>{show.movie.title}</p>
          <p className='flex items-center gap-2 text-gray-300'>
            <StarIcon className="w-5 h-5 text-primary fill-primary"/>
            {show.movie.vote_average} IMDb Rating
          </p>
          <div>{show.movie.overview}</div>
          <p>
            {timeFormat(show.movie.runtime)} • {show.movie.genres.map(genere => genere.name).join("|")} • {show.movie.release_date}
          </p>

          <div className='flex items-center flex-wrap gap-4 mt-4'>
            <button className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'>
              <PlayIcon className="w-5 h-5"/>
              <span>Play Trailer</span>
            </button>

            <a href='#dateSelect' className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95'>
              Buy Tickets
            </a>

            <button  onClick={updateFavourite} className='bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
              <Heart className={`w-5 h-5 ${favoriteMovies.find(movie => movie._id === id) ? 'fill-primary text-primary' : ""}`} />
            </button>

          </div>
        </div>
      </div>
      <div>
        <div  className='text-lg font-medium mt-20'>Your Favourite Cast</div>
        <div className='overflow-x-auto no-scrollbar mt-8 pb-4'>
          <div  className='flex items-center gap-4 w-max px-4'>
          {
            show.movie.casts.map((cast)=>(
              <div className='flex flex-col items-center text-center'>
                <img src={tmdb_image_base_url + cast.profile_path} alt="" className='rounded-full h-20 md:h-20 aspect-square object-cover'/>
                <div className='font-medium text-xs mt-3'>{cast.name}</div>
              </div>
            ))
          }
        </div>
        </div>
      </div>

          <SelectDate dateTime={show.dateTime} id={id} />

          <div>
            <div className='text-lg font-medium mt-20 mb-8'>
              You may also like
            </div>
            <div className='flex flex-wrap max-sm:justify-center gap-8'>
              {
                shows.slice(0,4).map((show) => (
                  <MovieCard movie={show}/>
                ))
              }
            </div>
            <div className='flex justify-center mt-20'>
          <button onClick={()=> {navigate('/movies'); scrollTo(0,0)}} className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'>Show more</button>
      </div>

          </div>

    </div>
  ) : <Loading />
}

export default MovieDetails
