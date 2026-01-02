import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import UserLayout from './components/Layout/UserLayout'
import Home from './pages/Home'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Layout */}
        <Route path='/' element={<UserLayout />}>
          <Route index element={<Home />}></Route>
        </Route>
        
      </Routes>
    </BrowserRouter>
  )
}

export default App