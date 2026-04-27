import React from 'react'
import { Route, Routes } from 'react-router'

import GuestHome from '../Guest/Pages/GuestHome/GuestHome'
import AdminHome from '../Admin/Pages/AdminHome/AdminHome'
import UserHome from '../User/Pages/UserHome/UserHome'

// We will create AuthorityHome soon
import AuthorityHome from '../Authority/Pages/AuthorityHome/AuthorityHome'

const MainRoutes = () => {
    return (
        <div>
            <Routes>
                <Route path='admin/*' element={<AdminHome />} />
                <Route path='/*' element={<GuestHome />} />
                <Route path='user/*' element={<UserHome />} />
                <Route path='authority/*' element={<AuthorityHome />} />
            </Routes>
        </div>
    )
}

export default MainRoutes