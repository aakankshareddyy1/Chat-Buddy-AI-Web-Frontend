import React, { useEffect, useState } from 'react'
import './style.css'
import Logout from './Logout'

function Chat() {

  const [value, setValue] = useState('')

  const [message, setMessage] = useState('')

  const [previousChats , setPreviousChats] = useState([])

  const[currentTitle , setCurrentTitle] = useState(null)


  //* create new chat  function 

  const createNewChat = ()=>{
    setMessage('')
    setValue('')
    setCurrentTitle(null)

  }

  const handleClick = (uniqueTitle)=>{
    setCurrentTitle(uniqueTitle)
   
      }


  const getMessages = async()=>{                   //~ function for handle api
    const options = {
      method:"POST",
      body: JSON.stringify({
        message:value                      //* message send from input 
      }),
      headers:{
        'Content-Type': "application/json"
      }
    }
    try{
      const res =  await fetch('http://localhost:4050/completions', options)
      const data = await res.json()
      console.log(data , 'data')
      setMessage(data?.choices[0].message)
      
    }
    catch(err){
      console.log(err)
    }
  }

  useEffect(()=>{
      console.log(value , currentTitle , message)
      if(!currentTitle && value && message){
        setCurrentTitle(value)
      }

      if(currentTitle && value && message){
      setPreviousChats(prevChats =>(
        [...prevChats , {
            title:currentTitle,                    //* our object
            role:"user",
            content:value
        },{ 
              title:currentTitle,                     //* from ai
              role:message.role,
              content:message.content

        }]
      ))
      }
      
  },[message , currentTitle])


 //* filter the cuurent title

   const currentChat = previousChats.filter(previousChat => previousChat.title === currentTitle) 

  //* to get the unqiure chat out of all the previous 
  const uniqueTitles = Array.from(new Set(previousChats.map(previousChats => previousChats.title)))  


  return (
    <div className='bodyC'>
    <div className='app'>

   
      <section className='side-bar'>   
    <button onClick={createNewChat} >+ New Chat</button>
    <ul className='history' >
     {uniqueTitles?.map((uniqueTitle,index) => <li key={index} onClick={() =>handleClick(uniqueTitle)} >{uniqueTitle}</li>)}
    </ul>
      <nav className=''>
        <Logout/>
      </nav>
   
      </section>

          
      <section className='main' >
      {!currentTitle && <h1>Arivu Ai</h1>}
      <ul className='feed' >
       {currentChat?.map((chatMessage,index)=> <li key={index}>
        <p className='role'>{chatMessage.role}</p>
        <p>{chatMessage.content}</p>
       </li>)}
      </ul>

      <div className='bottom-section' >
      <div className="input-container">
        
      <div id='submit' onClick={getMessages} >➢</div>
        <input value={value} onChange={e => setValue(e.target.value)}/>
        
      </div>
      <p className='info' >
      Free Research Preview. ChatGPT may produce inaccurate information about people, places, or facts. ChatGPT May 24 Version
      </p>
      </div>
      </section>
      
    </div>
    </div>
  )
}

export default Chat