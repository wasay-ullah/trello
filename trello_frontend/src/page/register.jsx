import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: '',
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
			await api.post('/register', formData);
			navigate('/login');
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<div>
			<form method="post" onSubmit={handleSubmit}>
				<label htmlFor="name">Name:</label>
				<input type="text" id="name" name="name" required onChange={handleChange} />
				<br />
				<label htmlFor="email">Email:</label>
				<input type="email" id="email" name="email" required onChange={handleChange} />
				<br />
				<label htmlFor="password">Password:</label>
				<input type="password" id="password" name="password" required onChange={handleChange} />
				<br />
				<button type="submit">Register</button>
			</form>
			<p>
				Already registered? <Link to="/login">Log in</Link>
			</p>
		</div>
	);
}
