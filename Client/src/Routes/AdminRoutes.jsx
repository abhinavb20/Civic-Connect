import React from 'react'
import { Route, Routes } from 'react-router'
import District from '../Admin/Pages/District/District'
import Department from '../Admin/Pages/Department/Department'
import Panchayath from '../Admin/Pages/Panchayath/Panchayath'
import Ward from '../Admin/Pages/Ward/Ward'
import AdminDashboard from '../Admin/Pages/AdminDashboard/AdminDashboard'
import AdminRegistration from '../Admin/Pages/AdminRegistration/AdminRegistration'
import AuthorityRegistration from '../Admin/Pages/AuthorityRegistration/AuthorityRegistration'
import ViewComplaint from '../Admin/Pages/ViewComplaint/ViewComplaint'
import Userlist from '../Admin/Pages/UserList/Userlist'
import AdminReport from '../Admin/Pages/AdminReport/AdminReport'

const AdminRoutes = () => {
    return (
        <div>
            <Routes>
                <Route path='/' element={<AdminDashboard />} />
                <Route path='department' element={<Department />} />
                <Route path='district' element={<District />} />
                <Route path='panchayath' element={<Panchayath />} />
                <Route path='ward' element={<Ward />} />
                <Route path='adminregistration' element={<AdminRegistration />} />
                <Route path='authorityregistration' element={<AuthorityRegistration />} />
                <Route path='ViewComplaint' element={<ViewComplaint />} />
                <Route path='Userlist' element={<Userlist />} />
                <Route path='report' element={<AdminReport/>} />
            </Routes>
        </div>
    )
}

export default AdminRoutes