import React from 'react'
import { TbBrandMeta } from 'react-icons/tb'
import { IoLogoInstagram } from 'react-icons/io'
import { RiTwitterXLine } from 'react-icons/ri'

const TopBar = () => {
  return (
    <div className='bg-brand text-white'>
        <div className='container mx-auto flex justify-between items-center px-4'>
            {/* Social Media Icons */}
            <div className='hidden md:flex items-center space-x-4'>
                <a href="#" className='hover:text-gray-300'>
                    <TbBrandMeta className='w-5 h-5' />
                </a><a href="#" className='hover:text-gray-300'>
                    <IoLogoInstagram className='w-5 h-5' />
                </a><a href="#" className='hover:text-gray-300'>
                    <RiTwitterXLine className='w-4 h-4' />
                </a>
            </div>

            {/* Notification Message */}
            <div className='text-sm text-center flex-grow'>
                <span>We ship worldwide - Fast and reliable shipping! </span>
            </div>
            
            {/* Phone Number */}
            <div className='text-sm hidden md:block'>
                <a href="tel:+1234567890" className='hover:text-gray-300'> +1 (234) 567-890</a>
            </div>
        </div>
    </div>
  )
}

export default TopBar