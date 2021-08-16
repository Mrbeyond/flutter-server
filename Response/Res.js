
module.exports ={
  /** The 200 response method */
  success: (res, data)=>{
    return res.status(200).json({
      ...data,
      Error: false
    })
  },
  /** The customized 200 Error response for security purpose */
  customError: (res, data)=>{
    return res.status(200).json({
      message: data,
      Error: true
    })
  },

  /** The customized Intruder error response for high security purpose */
  intruder: (res)=>{
    return res.status(200).json({
      message: 'Intruder',
      Error: true
    })
  },

  /** The internal 500 Error response */
  internal: (res)=>{
    return res.status(500).json({
      Error: true,
      message: "Internal Server Error",
    })
  },
  /** The page not found  404 Error response */
  notFound: (res)=>{
    return res.status(404).json({
      Error: true,
      message: "Resources not Found",
    })
  },

  /** Resources not found Error response */
  resNotFound: (res, data)=>{
    return res.status(404).json({
      Error: true,
      message: data,
    })
  },
}