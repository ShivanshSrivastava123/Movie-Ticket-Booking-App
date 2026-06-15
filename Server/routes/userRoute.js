import express from "express";
import { getFavouriteMovies, getUserBookings, updateFavourite } from "../Controllers/userController.js";

const userRouter = express.Router();

userRouter.get('/bookings' , getUserBookings)
userRouter.post('/update-favourite' , updateFavourite)
userRouter.get('/favourites' , getFavouriteMovies)

export default userRouter