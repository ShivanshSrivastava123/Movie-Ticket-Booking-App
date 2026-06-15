import { useAuth, useUser } from "@clerk/react";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { createContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios"
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL //always binds the base url before the api call

export const AppContext = createContext()

export const AppProvider = ({children}) => { //children is everything written inside the AppProvider tag in the main.jsx

    const [isAdmin , setIsAdmin] = useState(false)
    const [shows, setShows] = useState([])
    const [favoriteMovies, setFavoriteMovies] = useState([])

    const tmdb_image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL

    const {user} = useUser();//getting the user details
    const {getToken} = useAuth() //getToken gives a jwt and then we are embedding it into the api call header so that when we make the call then the req.auth clerk middleware checks the user credentials
    const location = useLocation()
    const navigate = useNavigate()

    //function to fetch whether the current user is admin or not
    const fetchIsAdmin = async() => {
        try {
            const { data } = await axios.get('/api/admin/is-admin' , {
                headers: {Authorization: `Bearer ${await getToken()}`}
            })

            setIsAdmin(data.isAdmin)

            if(!data.isAdmin && location.pathname.startsWith('/admin')) {
                navigate('/')
                toast.error('You are not authenticated as the admin')
            }
        } catch (error) {
            console.error(error.message)
        }
    }

    //function to fetch all the shows and these shows can be accessed from anywhere (not only admin)
    const fetchShows = async()=> {
        try {
            const {data} = await axios.get('/api/show/all')

            if(data.success) {
                setShows(data.shows)
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    //fetch the favourite movies which is specific to a user so again use of clerk jwt
    const fetchFavouriteMovies = async() => {
        try {
            const {data} = await axios.get('/api/user/favourites' ,{
                    headers: {Authorization: `Bearer ${await getToken()}`}
            })

            if(data.success) {
                setFavoriteMovies(data.movies)
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    //useeffect to fetch all the shows available
    useEffect(()=>{
        fetchShows()
    },[])

    //useeffect to fetch if the user is admin or not
    useEffect(()=>{
        if(user) {
            fetchIsAdmin()
            fetchFavouriteMovies()
        }
    },[user])

    const value = {
        axios,
        fetchIsAdmin,
        user, getToken, navigate, isAdmin, shows, 
        favoriteMovies, fetchFavouriteMovies, tmdb_image_base_url
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = ()=> useContext(AppContext)