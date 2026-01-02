import React from 'react'
import Header from '../Common/Header'
import Footer from '../Common/Footer'
import { Outlet } from 'react-router-dom'

const UserLayout = () => {
  return (
    <>
        <Header />
        <main>
          {/* outlet - replaces child component based on the route we access */}
          <Outlet />
        </main>
        <Footer />
    </>
  )
}

export default UserLayout