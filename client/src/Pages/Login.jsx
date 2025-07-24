import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast' 
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import axios from 'axios'

const Login = () => {
  const navigate = useNavigate()
  const [currState, setCurrState] = useState('login')
  const [step, setStep] = useState(1)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('')
  const [otp, setOtp] = useState('')

  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useContext(AuthContext)

  const handleStepSubmit = async (e) => {
    e.preventDefault()

    if (!isPolicyAccepted) {
      toast.error('Please accept the privacy policy')
      return
    }

    if (currState === 'login') {
      login('login', { email, password })
      return
    }

    // Signup steps
    if (currState === 'signup') {
      if (step === 1) {
        if (!fullName || !email || !password) return toast.error('Fill all fields')
        setStep(2)
      } else if (step === 2) {
        if (!bio) return toast.error('Please provide bio')
        try {
          const res = await axios.post('/api/auth/signup', { fullName, email, password, bio })
          if (res.data.success) {
            toast.success(res.data.message)
            setStep(3)
          } else {
            toast.error(res.data.message)
          }
        } catch (error) {
          toast.error('Failed to send OTP', error.message)
        }
      } else if (step === 3) {
        if (!otp) return toast.error('Enter OTP')
        try {
          // const res = await axios.post('/api/auth/verify-otp', { email, otp })
          const res = await axios.post('/api/auth/verify-otp', {
            email,
            otp,
            fullName,
            password,
            bio,
          })

          if (res.data.success) {
            toast.success('Signup successful!')
            login('login', { email, password }) // auto login
          } else {
            toast.error(res.data.message)
          }
        } catch (error) {
          toast.error(error.message)
        }
      }
    }
  }

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      <img src={assets.logo_big} alt='' className='w-[min(20vw,250px)]' />

      <form
        onSubmit={handleStepSubmit}
        className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'
      >
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState === 'signup' ? `Signup - Step ${step}` : 'Login'}
          {currState === 'signup' && step > 1 && (
            <img
              onClick={() => setStep(step - 1)}
              src={assets.arrow_icon}
              alt=''
              className='w-5 cursor-pointer'
            />
          )}
        </h2>

        {currState === 'signup' && step === 1 && (
          <>
            <input
              type='text'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder='Full Name'
              className='p-2 border border-gray-500 rounded-md focus:outline-none'
              required
            />
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter Email'
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              required
            />
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter Password'
                className='w-full p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                required
              />
              <div
                className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </>
        )}

        {currState === 'signup' && step === 2 && (
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder='Provide a short Bio...'
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            required
          ></textarea>
        )}

        {currState === 'signup' && step === 3 && (
          <input
            type='text'
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder='Enter OTP'
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            required
          />
        )}

        {currState === 'login' && (
          <>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter Email'
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              required
            />
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter Password'
                className='w-full p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                required
              />
              <div
                className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            <p onClick={() => navigate('/ResetPassword')} className='text-sm text-violet-500 cursor-pointer'>
              Forget Password?
            </p>
          </>
        )}

        <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
          {currState === 'signup'
            ? step === 3
              ? 'Verify & Signup'
              : 'Next'
            : 'Login'}
        </button>

        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <input type='checkbox' checked={isPolicyAccepted} onChange={(e) => setIsPolicyAccepted(e.target.checked)} />
          <p>Agree to the term of use & privacy policy.</p>
        </div>

        <div className='flex flex-col gap-2'>
          {currState === 'signup' ? (
            <p className='text-sm text-gray-600 flex justify-evenly'>
              Already have an account?
              <span
                onClick={() => {
                  setCurrState('login')
                  setStep(1)
                }}
                className='font-medium text-violet-500 cursor-pointer'
              >
                Login here
              </span>
            </p>
          ) : (
            <p className='text-sm text-gray-600 flex justify-evenly'>
              Create an account
              <span
                onClick={() => {
                  setCurrState('signup')
                  setStep(1)
                }}
                className='font-medium text-violet-500 cursor-pointer'
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export default Login
