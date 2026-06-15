import { clerkClient } from "@clerk/express"
import { Booking } from "../models/Booking.js"
import { Movie } from "../models/Movie.js"


export const getUserBookings = async(req, res) => {
    try {
        //fetch the user 
        const user = req.auth().userId

        const bookings = await Booking.find({user}).populate({
            path : "show",
            populate : {path : "movie"}
        }).sort({createdAt : -1})

        res.json({success : true, bookings})
    } catch (error) {
        console.log(error.message)
        res.json({success : false, message : error.message})
    }
}


export const updateFavourite = async(req, res) => {
    try {
        const userId = req.auth().userId
        const {movieId} = req.body

        const user = await clerkClient.users.getUser(userId)
        //all the passwords email or the private data of the user should be accessed from my clerk client so that i can get the untampered data

        if(!user.privateMetadata.favourites) {
            user.privateMetadata.favourites = []
        }

        //if the movie exists in the favourites then delete it else add it
        if(!user.privateMetadata.favourites.includes(movieId)) {
            user.privateMetadata.favourites.push(movieId)
        }
        else {
            user.privateMetadata.favourites = user.privateMetadata.favourites.filter(item => item!==movieId)
        }

        await clerkClient.users.updateUserMetadata(userId , {privateMetadata : user.privateMetadata})

        res.json({success : true, message : `Favourites list updated successfully`})

    } catch (error) {
        console.log(error.message)
        res.json({success : false, message : error.message})
    }
}

export const getFavouriteMovies = async(req, res) => {
    try {
        const user = await clerkClient.users.getUser(req.auth().userId)
        const favouriteMovies = user.privateMetadata.favourites

        const movies = await Movie.find({_id: {$in: favouriteMovies}})

        res.json({success : true, movies})
    } catch (error) {
        console.log(error.message)
        res.json({success : false, message : error.message})
    }
}