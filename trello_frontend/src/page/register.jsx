import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
	const navigate = useNavigate();
	const [message, setMessage] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
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
		setMessage('');
		setIsSubmitting(true);

		try {
			await api.post('/register', formData);
			navigate('/login');
		} catch (error) {
			console.error(error);
			setMessage(error.response?.data?.message || 'The server could not be reached. Please make sure the backend is running.');
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
			<form className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl" method="post" onSubmit={handleSubmit}>
				<div>
					<p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Get started</p>
					<h1 className="mt-2 text-3xl font-bold text-slate-900">Create your account</h1>
				</div>
				{message && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{message}</p>}
				<div className="space-y-2">
					<label className="block text-sm font-medium text-slate-700" htmlFor="name">Name</label>
					<input className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" type="text" id="name" name="name" required onChange={handleChange} />
				</div>
				<div className="space-y-2">
					<label className="block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
					<input className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" type="email" id="email" name="email" required onChange={handleChange} />
				</div>
				<div className="space-y-2">
					<label className="block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
					<input className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" type="password" id="password" name="password" required onChange={handleChange} />
				</div>
				<button className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Creating account...' : 'Create account'}
				</button>
				<p className="text-center text-sm text-slate-600">
					Already registered? <Link className="font-semibold text-indigo-600 hover:text-indigo-700" to="/login">Log in</Link>
				</p>
			</form>
		</main>
	);
}
