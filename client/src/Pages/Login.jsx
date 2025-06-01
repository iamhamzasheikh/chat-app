import React, { useState } from 'react'
import assets from '../assets/assets'

const Login = () => {

  const [currState, setCurrState] = useState('signup');
  const [fullName, setFullName] = useState('');
  const [email, SetEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const onSubmitHandler = (event) => {
    event.preventDefault();

    if (currState === 'signup' && !isDataSubmitted) {
      setIsDataSubmitted(true)
      return;
    }
  }


  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly
     max-sm:flex-col backdrop-blur-2xl'>

      {/* left */}

      <img src={assets.logo_big} alt="" className='w-[min(20vw, 250px)]' />

      {/* right-side */}

      <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>

        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}

          {isDataSubmitted && (<img onClick={() => setIsDataSubmitted(false)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer' />)}


        </h2>

        {/* full-name */}

        {currState === 'signup' && !isDataSubmitted && (
          <input type="text" onChange={(e) => setFullName(e.target.value)} value={fullName}
            name='' id=''
            className='p-2 border border-gray-500 rounded-md focus:outline-none'
            placeholder='Full Name' required />
        )}

        {/* Email */}

        {!isDataSubmitted && (
          <>
            <input onChange={(e) => SetEmail(e.target.value)} value={email} type="email" name="email" id="email"
              placeholder='Enter Email' required
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' />

            {/* password */}

            <input onChange={(e) => setPassword(e.target.value)} value={password}
              type="password"
              name="password" id="password"
              placeholder='Enter Password' required
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </>
        )}

        {currState === 'signup' && isDataSubmitted && (
          <textarea onChange={(e) => setBio(e.target.value)} value={bio} rows={4} placeholder='Provide a short Bio...' required
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'>
          </textarea>
        )
        }

        <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
          {currState === 'signup' ? 'Sign up' : 'Login'}
        </button>

        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <input type="checkbox" />
          <p>Agree to the term of use & privacy policy.</p>
        </div>

        <div className='flex flex-col gap-2'>
          {currState === 'signup' ? (
            <p className='text-sm text-gray-600 flex justify-evenly'>Already have an account?
              <span onClick={() => { setCurrState('Login'); setIsDataSubmitted(false) }} className='font-medium text-violet-500 cursor-pointer'>Login here</span> </p>
          ) : (
            <p className='text-sm text-gray-600 flex justify-evenly'>create an account
              <span onClick={() => { setCurrState('signup'); setIsDataSubmitted(false) }} className='font-medium text-violet-500 cursor-pointer'>Click here</span> </p>
          )}
        </div>


      </form>

    </div>
  )
}

export default Login
