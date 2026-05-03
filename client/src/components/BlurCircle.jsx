import React from 'react'

const BlurCircle = ({top = "auto", left = "auto", right = "auto", bottom = "auto"}) => {
  return (
    <div className='absolute h-[50px] w-[50px] bg-[#EB1C23] rounded-full blur-[30px]' style={{top: top, left: left, right: right, bottom: bottom}}>
        
    </div>
  )
}

export default BlurCircle