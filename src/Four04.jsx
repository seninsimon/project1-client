import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'




const Four04 = () => {

    const navigate = useNavigate()
  

    useEffect(() => {
     
        navigate('/')

    },[navigate])


  return (
    <div>four04</div>
  )
}

export default Four04