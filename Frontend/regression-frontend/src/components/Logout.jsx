import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    if (localStorage.getItem('access_token') || localStorage.getItem('refresh_token')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem("theme")
        dispatch({ type: "logout" })

    }

    useEffect(() => {
        navigate("/login");
    }, [])
    return (
        <></>
    )
}
