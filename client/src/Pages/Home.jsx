import React, { useContext, } from 'react'
import Sidebar from '../Components/Sidebar'
import ChatContainer from '../Components/ChatContainer'
import RightSidebar from '../Components/RightSidebar'
import { ChatContext } from '../../context/ChatContext'

const Home = () => {

  const { selectedUser, } = useContext(ChatContext);


  return (
    <div className='h-screen lg:px-[10%] lg:py-[2%] max-md:px-0 max-md:py-0'>

      <div className={` backdrop-blur-xl border-1 border-gray-600 overflow-hidden h-[100%] grid
     max-md:grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'grid-cols-2'}`}>

        <Sidebar />
        <ChatContainer />
        <RightSidebar />
      </div>

    </div>
  )
}

export default Home
