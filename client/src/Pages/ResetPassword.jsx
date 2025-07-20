import React from 'react';
import axios from 'axios'
import { useState } from 'react';
import toast from 'react-hot-toast';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';


const ResetPassword = () => {

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  //step 1 send otp

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email)
      return toast.error("Enter Email First");
    setLoading(true);

    try {

      const res = await axios.post('/api/auth/forgot-password', { email });
      toast.success(`OTP is sent to ${email}`, res.data.message);
      localStorage.setItem('resetEmail', email);
      setStep(2);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }

    setLoading(false);

  }

  // step-2 verify otp

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const storedEmail = email || localStorage.getItem('resetEmail');
    if (!storedEmail)
      return toast.error("Email not found");

    if (!otp)
      return toast.error("Enter OTP Please");

    try {

      const res = await axios.post('/api/auth/verify-otp', { email: email.trim(), otp: otp.trim() });
      toast.success(res.data.message || 'OTP Verified');
      setEmail(storedEmail);
      setStep(3);

    } catch (error) {

      toast.error(error.response?.data?.message || "Invalid OTP");

    }

  }


  // step-3 Reset Password

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword)
      return toast.error("Please Enter password in both fields");

    if (newPassword !== confirmPassword)
      return toast.error("Password must be same");

    // Enhanced password validation
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    // // Check for password strength (optional but recommended)
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
    // if (!passwordRegex.test(newPassword)) {
    //     return toast.error("Password must contain at least one uppercase letter, one lowercase letter, and one number");
    // }

    try {

      setLoading(true);

      const res = await axios.post('/api/auth/reset-password', { email, otp, newPassword, confirmPassword });

      if (res.data.success) {
        toast.success(res.data.message || 'Password reset successfully')
      }

      toast.success(res.data.message);

      setTimeout(() => {
        setStep(1);
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        navigate('/login')
      }, 1000);


    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset Password Failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly
     max-sm:flex-col backdrop-blur-2xl' >


      {/* left-side-logo */}

      <img src={assets.logo_big} alt="big-logo" className='w-[min(20vw, 250px)]' />


      {/* right-side-reset-password-form */}

      <form className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded'>
        <h2 className='font-medium text-2xl text-center' >Reset Password</h2>

        {step === 1 && (
          <>
            <input type="email" placeholder='Enter your Email'
              value={email} required
              onChange={(e) => setEmail(e.target.value)}
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' />

            <button onClick={handleSendOtp} className='py-3 bg-gradient-to-r from-purple-400 to-violet-600
               text-white rounded-md cursor-pointer'>
              {loading ? 'Sending OTP' : 'Send OTP'}
            </button>

          </>
        )}

        {step === 2 && (
          <>
            <input type="text" name="number" maxLength={6}
              placeholder='Enter 6-digit OTP' value={otp}
              onChange={(e) => setOtp(e.target.value)} required
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' />

            <button onClick={handleVerifyOtp}
              className=' py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
              Verify OTP
            </button>

            <p onClick={() => setStep(1)} className='text-sm text-violet-400 cursor-pointer text-center underline'>
              Go Back
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <input type="password" name="newPassword" id=""
              placeholder='New Password'
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' />

            <input type="password" name="confirmPassword" id=""
              placeholder='Confirm Password'
              value={confirmPassword} required
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' />

            <button type='button' onClick={handleResetPassword}
              className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
              Reset Password
            </button>

            <p onClick={() => setStep(1)} className='text-sm text-violet-400 cursor-pointer text-center underline'>
              Go Back
            </p>

          </>
        )}
      </form>
    </div>
  )

}



export default ResetPassword
