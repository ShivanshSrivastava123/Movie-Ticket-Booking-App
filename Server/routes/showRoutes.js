import express from 'express'
import { addShow, fetchNowPlayingMovies, getShow, getShows } from '../Controllers/showController.js';
import protectAdmin from '../middleware/auth.js';

const showRoute = express.Router();

showRoute.get('/now-playing' ,protectAdmin, fetchNowPlayingMovies)
showRoute.post('/add' ,protectAdmin, addShow)
showRoute.get('/all' , getShows)
showRoute.get('/:movieId' , getShow)

export default showRoute