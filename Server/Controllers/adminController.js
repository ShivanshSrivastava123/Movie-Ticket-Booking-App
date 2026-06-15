import { Booking } from "../models/Booking.js"
import { Show } from "../models/Show.js"
import { User } from "../models/User.js"



//the middleware will run first and ensure that he is admin and then this function is executed so i dont want to write the same things again
export const isAdmin = (req,res) => {
    res.json({success : true, isAdmin:true})
}

export const getDashboardData = async(req, res) => {
    try {
        const bookings = await Booking.find({isPaid:true})
        const totalUser = await User.countDocuments()
        const activeShows = await Show.find({showDateTime : {$gte : new Date()}}).populate('movie')

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking)=> acc + booking.amount, 0),
            activeShows,
            totalUser
        }

        res.json({success : true, dashboardData})
    } catch (error) {
        console.log(error.message)
        res.json({success : false , message:error.message})
    }
}

export const getAllShows = async(req, res) => {
    try {
        const shows = await Show.find({showDateTime : {$gte : new Date()}}).populate('movie').sort({showDateTime : 1})
        res.json({success : true, shows})
    } catch (error) {
        console.log(error.message)
        res.json({success : false , message:error.message})
    }
}

export const getAllBookings = async(req, res) => {
    try {
        const bookings = await Booking.find({}).populate('user').populate({
            path : 'show',
            populate : {path : 'movie'}
        }).sort({ createdAt: -1 }) //descending order sorting

        res.json({success : true, bookings})
    } catch (error) {
        console.log(error.message)
        res.json({success : false , message:error.message})
    }
}