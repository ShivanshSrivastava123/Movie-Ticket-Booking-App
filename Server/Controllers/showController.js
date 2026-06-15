import axios from "axios"
import { Movie } from "../models/Movie.js";
import { Show } from "../models/Show.js";


//function to display all the now playing movies on the admin dashboard
export const fetchNowPlayingMovies = async (req,res) => {
    try {
        //since this {data } is inside a wrpaper 
        const {data} = await axios.get('https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1', {
            headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`
            }
        })
        
        const movies = data.results;
        res.json({success:true , movies : movies})
    } catch (error) {
        res.json({success : false, message : error.message})
    }
}

//function to add a show in the db
export const addShow = async (req,res) => {
    try {
        const {movieId, showsInput, showPrice} = req.body;

        let movie = await Movie.findById(movieId)

        if(!movie) {
            //if movie doesnt exist in the db then first we have to bring it in and then we will add the show
            const [movieData, movieCredits] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, {
                    headers: {
                        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
                    }
                }),
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`, {
                    headers: {
                        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
                    }
                })
            ])

            const movieApiData = movieData.data
            const movieCreditsData = movieCredits.data

            let movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,
                casts: movieCreditsData.cast,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime,
            }
            
            movie = await Movie.create(movieDetails)
            
        }

        //i have got movie in my movie variable and now i will genrate the shows
        const showDetails = [];
        showsInput.forEach(show => {
            const date = show.date;
            show.time.forEach(time=>{
                const dateTimeString = `${date}T${time}`
                showDetails.push({
                    movie: movieId,
                    showDateTime: new Date(dateTimeString),
                    showPrice,
                    occupiedSeats: {}
                })
            })
        })

        if(showDetails.length > 0) {
            await Show.insertMany(showDetails)
        }

        res.json({success:true, message:`Show added successfully`})

    } catch (error) {
        res.json({success:false, message : error.message})
    }
}


//funtion to get all shows data
export const getShows = async(req, res) => {
    try {
        const shows = await Show.find({showDateTime : {$gte: new Date()}}).populate('movie').sort({showDateTime : 1}) //this will give all the shows present after the current date
        const uniqueShows = [...new Set(shows.map(show => show.movie))] // Now it is an Array previously it was returning an object

        res.json({success : true, shows : uniqueShows})
    } catch (error) {
        console.error(error)
        res.json({success : false, message : `Error occurred`})
    }
}

//function to get the detail of a sigle show
export const getShow = async(req, res) => {
    try {
        const {movieId} = req.params;

        const shows = await Show.find({movie:movieId , showDateTime:{$gte : new Date()}})
        const movie = await Movie.findById(movieId)

        const dateTime = {}

        //as soon as i call a movie id url i will give the movie details and the show date time details
        shows.map(show => {
            const date = show.showDateTime.toISOString().split('T')[0]; // since in showDateTime i was having the date time in special format so to access it i use this isoString function
            if(!dateTime[date]) {
                dateTime[date] = []
            }
            dateTime[date].push({
                time: show.showDateTime, 
                showId: show._id
            })
        })

        res.json({success : true , movie, dateTime})
    } catch (error) {
        console.error(error)
        res.json({success : false , message : error.message})
    }
}