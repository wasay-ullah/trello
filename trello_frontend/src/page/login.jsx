import { useState } from 'react'
import api from '../api/axios'
export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    function handleChange(event) {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        try {
        const response = await api.post('/login', formData);
            console.log(response.data);
        }
        catch (error) {
            console.error(error);
        }
    }
  return (
    <div>
      <form method="post" onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required onChange={handleChange} />
        <br />
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" required onChange={handleChange} />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
