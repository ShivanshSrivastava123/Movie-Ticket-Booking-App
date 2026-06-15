import { inngest } from "../Inngest/index.js"
import { Booking } from "../models/Booking.js"
import { Show } from "../models/Show.js"
import stripe from 'stripe'



//function to check if the current selected seats are occupied or not
const checkAvailability = async({showId, selectedSeats}) => {
    try {
        const show = await Show.findById(showId)

        if(!show) return false

        let occupiedSeats = show.occupiedSeats

        let isAvailable = selectedSeats.some(seat => occupiedSeats[seat])

        return !isAvailable
    } catch (error) {
        console.error(error)
        return false
    }
}

export const createBooking = async(req, res) => {
    try {
        const {userId} = req.auth() // clerk middleware injects this data
        const {showId, selectedSeats} = req.body
        const {origin} = req.headers

        let isAvailable = await checkAvailability({showId, selectedSeats})

        if(!isAvailable) {
            return res.json({success : false , message : `The current seats are not available`})
            //to hault the execution the return statement is used
        }

        const showData = await Show.findById(showId).populate('movie')

        //a new booking is created in the db
        const bookingData = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        })

        // i have to update the selected seats
        selectedSeats.map(seat => {
            showData.occupiedSeats[seat] = userId
        })

        showData.markModified('occupiedSeats');

        await showData.save();

        //we will create the payment thing
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

         // Creating line items to for Stripe
         const line_items = [{
            price_data: {
                currency: 'usd',
                product_data:{
                    name: showData.movie.title
                },
                unit_amount: Math.floor(bookingData.amount) * 100
            },
            quantity: 1
         }]

         const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,//when the payment was successful then the user is directed to loading page and then to the my bookings page
            cancel_url: `${origin}/my-bookings`,
            //if cancelled then directly to the my bookings page
            line_items: line_items,
            mode: 'payment',
            metadata: {
                bookingId: bookingData._id.toString()
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
         })

         bookingData.paymentLink = session.url
         await bookingData.save()

         //check if the payment is not done till 10 min and then delete that booking
         await inngest.send({
            name : 'app/checkpayment',
            data : {
                bookingId: bookingData._id.toString()
            }
         })
         

        res.json({success : true, url : session.url})

    } catch (error) {
        console.log(error.message)
        res.json({success : false , message : error.message})
    }
}


export const getOccupiedSeats = async(req, res) => {
    try {
        const {showId} = req.params
        const showData = await Show.findById(showId)

        const occupiedSeats = Object.keys(showData.occupiedSeats)

        res.json({success:true, occupiedSeats})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}