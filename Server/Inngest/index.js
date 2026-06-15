import { Inngest } from "inngest";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";
import sendMail from "../configs/nodeMailer.js";
import { Show } from "../models/Show.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

//function to add a user to the data base
const createUser = inngest.createFunction(
    { id: 'sync-user-from-clerk', triggers: [{ event: "clerk/user.created" }] },
    async ({event}) => {
        const {id, first_name, last_name, image_url, email_addresses} = event.data
        const user = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.create(user)
    }
)

//function to delete the user from db
const deleteUser = inngest.createFunction(
    { id: 'delete-user-from-clerk', triggers: [{ event: "clerk/user.deleted" }] },
    async ({event}) => {
        const {id} = event.data
        await User.findByIdAndDelete(id)
    }
)

//Function to update the user details
const updateUser = inngest.createFunction(
    { id: 'update-user-from-clerk', triggers: [{ event: "clerk/user.updated" }] },
    async ({event}) => {
        const {id, first_name, last_name, image_url, email_addresses} = event.data
        const user = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.findByIdAndUpdate(id, user)
    }
)

//function to send the mail when i create a booking
//this is created here so that whenever a show is booked i say that the job is done and just say to ingest to run this mail thing in the background
//Your Express server just shouts, "Hey Inngest, booking successful!" (firing the app/show.booked event) and immediately returns res.json({success: true}) to React.
// It acts as a smart queue. If the email API fails, Inngest intercepts the error and says, "I'll try again in 30 seconds." If it fails again, it waits 2 minutes, then 5 minutes.
// It absorbs the massive spike. It catches all 500 events instantly, puts them in a safe line, and processes them at a controlled rate (e.g., 20 per second) so your main backend API stays incredibly fast and stable.

const initiateSendMail = inngest.createFunction(
    { id: 'send-confirmation-mai', triggers: [{ event: "app/show.booked" }] },
    async({event, step}) => {
        const {bookingId} = event.data

        const bookingData = await Booking.findById(bookingId).populate({
            path : 'show',
            populate : {path: "movie", model: "Movie"}
        }).populate('user')

        await sendMail({
            to : bookingData.user.email,
            subject : "Booking confirmed for your show",
            body : `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #111827; padding: 40px 20px;">
        <tr>
            <td align="center">
                
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1F2937; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
                    
                    <tr>
                        <td align="center" style="background-color: #0f141e; padding: 30px 20px; border-bottom: 3px solid #F84565;">
                            <h1 style="margin: 0; color: #F84565; font-size: 28px; letter-spacing: 1px;">QUICKSHOW</h1>
                            <p style="margin: 5px 0 0 0; color: #9CA3AF; font-size: 14px;">Your booking is confirmed!</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: normal;">Hi <strong>${bookingData.user.name}</strong>,</h2>
                            <p style="margin: 0 0 30px 0; color: #D1D5DB; font-size: 16px; line-height: 1.5;">Get the popcorn ready! Your seats for <strong>${bookingData.show.movie.title}</strong> have been successfully booked. Here are your digital ticket details:</p>

                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #374151; border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #F84565;">
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <p style="margin: 0; color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Movie</p>
                                        <h3 style="margin: 5px 0 0 0; font-size: 22px; color: #ffffff;">${bookingData.show.movie.title}</h3>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <p style="margin: 0; color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Date & Time</p>
                                        <p style="margin: 5px 0 0 0; font-size: 16px; color: #ffffff;">
                                            ${new Date(bookingData.show.showDateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' })} at 
                                            ${new Date(bookingData.show.showDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p style="margin: 0; color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Seats</p>
                                        <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #F84565;">
                                            ${bookingData.bookedSeats.join(", ")}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <a href="http://localhost:5173/my-bookings" style="display: inline-block; background-color: #F84565; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; padding: 14px 30px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px;">View My Tickets</a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="background-color: #111827; padding: 25px 20px; border-top: 1px solid #374151;">
                            <p style="margin: 0; color: #6B7280; font-size: 13px;">Please arrive 15 minutes before showtime.</p>
                            <p style="margin: 10px 0 0 0; color: #6B7280; font-size: 12px;">© 2026 QuickShow Team. All rights reserved.</p>
                        </td>
                    </tr>

                </table>
                
            </td>
        </tr>
    </table>`
        })
    }
)

const removeSeats = inngest.createFunction(
    { id: 'remove-seats-after-ten-minutes', triggers: [{ event: "app/checkpayment" }] },
    async ({event, step}) => {
        // set an alarm for 10 min from now
        const timeInterval = new Date(Date.now() + 10*60*1000);
        
        //step is injected by inngest from itself
        await step.sleepUntil("A timer of 10 minutes" , timeInterval)

        await step.run('check-payment-status' , async() => {
            //first we will find out the booking details by the id
            const booking = await Booking.findById(event.data.bookingId)

            if(!booking.isPaid) {
                //now fetch the details about the show
                const show = await Show.findById(booking.show)
                booking.bookedSeats.forEach(item => {
                    delete show.occupiedSeats[item]
                })

                show.markModified('occupiedSeats')
                await show.save()
                //now delete from the booking
                await Booking.findByIdAndDelete(event.data.bookingId)
            }
        })
    }
)

//function to send the email as a reminder for the show
// const sendShowReminders = inngest.createFunction(
//     { id: 'send-show-reminders', triggers: { cron: "0 */1 * * *" }},
//     async ({ step })=>{
//         const now = new Date();
//         const in1Hours = new Date(now.getTime() + 1 * 60 * 60 * 1000);
//         const windowStart = new Date(in1Hours.getTime() - 60 * 60 * 1000);

//         // Prepare reminder tasks
//         const reminderTasks =  await step.run("prepare-reminder-tasks", async ()=>{
//             const shows = await Show.find({
//                 showDateTime: { $gte: windowStart, $lte: in1Hours },
//             }).populate('movie');

//             const tasks = [];

//             for(const show of shows){
//                 if(!show.movie || !show.occupiedSeats) continue;

//                 const userIds = [...new Set(Object.values(show.occupiedSeats))];
//                 //extracting the users assigned to the key value(seat no) and a user will come once as set function is used
//                 if(userIds.length === 0) continue;

//                 const users = await User.find({_id: {$in: userIds}}).select("name email");

//                 for(const user of users){
//                     tasks.push({
//                         userEmail: user.email,
//                         userName: user.name,
//                         movieTitle: show.movie.title,
//                         showTime: show.showTime,
//                     })
//                 }
//             }
//             return tasks;
//         })

//         if(reminderTasks.length === 0){
//             return {sent: 0, message: "No reminders to send."}
//         }

//          // Send reminder emails
//          const results = await step.run('send-all-reminders', async ()=>{
//             return await Promise.allSettled(
//                 reminderTasks.map(task => sendEmail({
//                     to: task.userEmail,
//                     subject: `Reminder: Your movie "${task.movieTitle}" starts soon!`,
//                      body: `<div style="font-family: Arial, sans-serif; padding: 20px;">
//                             <h2>Hello ${task.userName},</h2>
//                             <p>This is a quick reminder that your movie:</p>
//                             <h3 style="color: #F84565;">"${task.movieTitle}"</h3>
//                             <p>
//                                 is scheduled for <strong>${new Date(task.showTime).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}</strong> at 
//                                 <strong>${new Date(task.showTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}</strong>.
//                             </p>
//                             <p>It starts in approximately <strong>1 hours</strong> - make sure you're ready!</p>
//                             <br/>
//                             <p>Enjoy the show!<br/>QuickShow Team</p>
//                         </div>`
//                 }))
//             )
//          })

//          const sent = results.filter(r => r.status === "fulfilled").length;
//          const failed = results.length - sent;

//          return {
//             sent,
//             failed,
//             message: `Sent ${sent} reminder(s), ${failed} failed.`
//          }
//     }
// )

// Create an empty array where we'll export future Inngest functions
export const functions = [
    createUser,
    deleteUser,
    updateUser,
    initiateSendMail,
    removeSeats,
    // sendShowReminders
];