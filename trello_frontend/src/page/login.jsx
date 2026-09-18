import { useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom';
export default function Login() {
    const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        setMessage('');
        setIsSubmitting(true);
        try {
            await api.post('/login', formData);
            navigate('/dashboard');
        }
        catch (error) {
            console.error(error);
            if (error.response?.status === 401) {
                setMessage('The email or password is incorrect.');
            } else if (error.response?.status === 400) {
                setMessage(error.response.data.message || 'Please enter your email and password.');
            } else if (error.response?.data?.message) {
              setMessage(error.response.data.message);
            } else {
              setMessage('The server could not be reached. Please make sure the backend is running.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <form className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl" method="post" onSubmit={handleSubmit}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Welcome back</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Log in to your account</h1>
        </div>
        {message && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{message}</p>}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
          <input className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" type="email" id="email" name="email" required onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
          <input className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" type="password" id="password" name="password" required onChange={handleChange} />
        </div>
        <button className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </main>
  )
}
