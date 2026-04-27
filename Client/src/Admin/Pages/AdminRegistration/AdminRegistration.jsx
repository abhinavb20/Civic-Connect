import { Style } from '@mui/icons-material'
import axios from 'axios'
import React, { useState, } from 'react'
import style from './AdminRegistration.module.css'


const AdminRegistration = () => {

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async () => {

        if (!name.trim()) {
            alert("Name is required");
            return;
        }

        if (!email.trim()) {
            alert("Email is required");
            return;
        }

        // Email format validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            alert("Enter a valid email");
            return;
        }

        if (!password.trim()) {
            alert("Password is required");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        axios.post('http://localhost:5000/admin', {
            name: name,
            email: email,
            password: password
        })
            .then(res => {
                alert(res.data.msg);
                setName('');
                setEmail('');
                setPassword('');
            })
            .catch(console.error);
    };

    return (

        <div>
            <div className={style.container}>
                <div className={style.s}>
                    <h2 align="center" className={style.hd}>ADMIN REGISTRATION</h2>

                    <input
                        className={style.n}
                        placeholder="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />

                    <input
                        className={style.n}
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />

                    <input
                        className={style.n}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />


                    <div className={style.cntr}>
                        <input type="button" value="Submit" className={style.sb} onClick={handleSubmit} />
                        <input type="reset" value="Cancel" className={style.sb} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminRegistration