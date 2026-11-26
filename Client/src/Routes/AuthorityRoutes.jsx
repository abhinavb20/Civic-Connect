import React from 'react'
import { Route, Routes } from 'react-router'
// These components will be built next
import Dashboard from '../Authority/Pages/Dashboard/Dashboard'
import ViewComplaint from '../Authority/Pages/ViewComplaints/ViewComplaint'

const AuthorityRoutes = () => {
    return (
        <div>
            <Routes>
                <Route path='/' element={<Dashboard />} />
                <Route path='/view-complaints' element={<ViewComplaint />} />
            </Routes>
        </div>
    )
}

export default AuthorityRoutes
