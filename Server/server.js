import 'dotenv/config';
import express from 'express'
import cors from 'cors'
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./Inngest/index.js"

const app = express();
const port = 3000

app.use(clerkMiddleware())

await connectDB()

app.use(express.json())
app.use(cors())

app.get('/' , (req,res)=>(res.send(`My server is live`)))

// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));

app.listen(port , ()=> console.log(`Server is running on ${port}`))