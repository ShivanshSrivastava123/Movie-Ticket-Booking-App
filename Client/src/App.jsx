import React from 'react'
import Navbar from './Components/Navbar.jsx'
import { Route, Routes, useLocation } from 'react-router-dom'
import Movies from './pages/Movies.jsx'
import Home from './pages/Home.jsx'
import MovieDetails from './pages/MovieDetails.jsx'
import SeatLayout from './pages/SeatLayout.jsx'
import MyBookings from './pages/MyBookings.jsx'
import Footer from './Components/Footer.jsx'
import { Toaster } from 'react-hot-toast'
import Favourite from './pages/Favourite.jsx'
import Layout from './pages/admin/Layout.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import AddShows from './pages/admin/AddShows.jsx'
import ListBookings from './pages/admin/ListBookings.jsx'
import ListShows from './pages/admin/ListShows.jsx'
import Loading from './Components/Loading.jsx'


const App = () => {

  const isAdminRoute = useLocation().pathname.startsWith('/admin')

  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/movies' element={<Movies/>} />
        <Route path='/movies/:id' element={<MovieDetails/>} />
        <Route path='/movies/:id/:date' element={<SeatLayout/>} />
        <Route path='/my-bookings' element={<MyBookings/>} />
        <Route path='/loading/:nextUrl' element={<Loading />} />

        <Route path='/favourite' element={<Favourite />} />
        <Route path='/admin' element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path='/admin/add-shows' element={<AddShows />}/>
            <Route path='/admin/list-bookings' element={<ListBookings />}/>
            <Route path='/admin/list-shows' element={<ListShows />}/>
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  )
}

export default App
