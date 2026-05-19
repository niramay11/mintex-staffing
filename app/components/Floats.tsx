import React from 'react'
import RightSquare from "../assets/right_square.png"
import LeftSquare from "../assets/left_square.png"
import RightCone from "../assets/right_cone.svg"
import LeftCone from "../assets/left_cone.svg"
import CenterCircle from "../assets/center_semicircle.svg"
import Image from 'next/image'

const Floats = () => {

    return (
        <div className="absolute hidden lg:block inset-0 w-full h-full pointer-events-none z-0">
            <div className='sticky top-0 h-screen w-full overflow-hidden'>
                <Image src={RightSquare} alt='right_square' className='absolute bottom-0 right-0' />
                <Image src={LeftSquare} alt='left_square' className='absolute top-0 left-0' />
                <Image src={RightCone} alt='right_cone' className='absolute top-0 right-0' />
                <Image src={LeftCone} alt='left_cone' className='absolute bottom-0 left-0' />
                {/* Center Circle pushed slightly down or adjusted as needed */}
                <Image src={CenterCircle} alt='center_circle' className='absolute top-full left-1/2 -translate-x-1/2 -translate-y-2/3' />
            </div>
        </div>
    )
}

export default Floats