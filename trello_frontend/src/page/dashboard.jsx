import { useState,useEffect } from 'react'
import api from '../api/axios'
export default function Dashboard() {
    
    const [user, setUser] = useState(null);
    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await api.get('/dashboard');
                setUser(response.data);
            } catch (error) {
                console.error(error);
            }
    };
    fetchUser();
},[]);
    return (
    <div>
      {user && <h1>{user.message}</h1>}
    </div>
  )
}
