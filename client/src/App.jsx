import React, { useContext, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Login from './Pages/Login'
import Profile from './Pages/Profile'
import { Toaster } from "react-hot-toast"
import { AuthContext } from '../context/AuthContext'
import Loader from './Components/Loader'
import ResetPassword from './Pages/ResetPassword'
import AboutUser from './Pages/AboutUser'

const App = () => {

  const { authUser, loading } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <>

      {loading && <Loader />}
      <div className="bg-[url('./src/assets/bgImage.svg')] bg-cover">
        <Toaster />
        <Routes>
          <Route path='/' element={authUser ? <Home /> : <Navigate to="/login" />} />
          <Route path='/login' element={!authUser ? <Login /> : <Navigate to="/" />} />
          <Route path='/ResetPassword' element={<ResetPassword />} />
          <Route path='/profile' element={authUser ? <Profile /> : <Navigate to="/login" />} />
          <Route path='/about' element={authUser ? <AboutUser setSelectedUser={setSelectedUser} /> : <Navigate to='/login' />} />
        </Routes>
      </div>
    </>
  )
}

export default App


// bg-[url('./src/assets/bgImage.svg')] bg-contain