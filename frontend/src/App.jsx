import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import UserLayout from './components/Layout/UserLayout'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Layout */}
        <Route path='/' element={<UserLayout />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App