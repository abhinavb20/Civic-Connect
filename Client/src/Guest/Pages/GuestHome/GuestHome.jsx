import React from 'react'
import { Link } from 'react-router'
import GuestRoutes from '../../../Routes/GuestRoutes'
import style from './GuestHome.module.css'
import Navbar from '../../Components/Navbar/Navbar'


const GuestHome = () => {
    return (
        <div>
            <div className={style.container}>
                <div><Navbar /></div>
            </div>
            <div className={style.router}><GuestRoutes /></div>
        </div>
    )
}

export default GuestHome