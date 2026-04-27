import React from 'react'
import { Route, Routes } from 'react-router'
import Login from '../Guest/Pages/Login/Login'

import UserRegistration from '../Guest/Pages/UserRegistration/UserRegistration'
import Dashboard from '../Guest/Pages/Dashboard/Dashboard'

const GuestRoutes = () => {
    return (
        <div>
            <Routes>
                <Route path='login' element={<Login />} />
                <Route path='userregistration' element={<UserRegistration />} />
                <Route path='' element={<Dashboard />} />
            </Routes>
        </div>
    )
}

export default GuestRoutes