import 'dotenv/config';
import express from 'express'
import cors from 'cors'
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./Inngest/index.js"
import showRoute from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoute.js';
import userRouter from './routes/userRoute.js';
import { stripeWebhooks } from './Controllers/stripeWebhook.js';

const app = express();
const port = 3000



await connectDB()

// Stripe Webhooks Route
app.use('/api/stripe', express.raw({type: 'application/json'}), stripeWebhooks)
//{ type: 'application/json' }: This is a filter. It tells Express: "Only intercept this route if the incoming request has a header of Content-Type: application/json." Since Stripe sends its webhooks as JSON, this matches perfectly.
//the stripe will hit this endpoint when a payment is done and raw is used as it needs unaltered raw data

app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())

app.get('/' , (req,res)=>(res.send(`My server is live`)))

// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use('/api/show' , showRoute)
app.use('/api/booking' , bookingRouter)
app.use('/api/admin' , adminRouter)
app.use('/api/user' , userRouter)

app.listen(port , ()=> console.log(`Server is running on ${port}`))