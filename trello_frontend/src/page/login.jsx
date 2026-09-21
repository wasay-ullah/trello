import { useState } from 'react'
import api from '../api/axios'
import { useLocation, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState(location.state?.message || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);
    try {
      await api.post('/login', {
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
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
    <main className="page-center">
      <form className="auth-card" method="post" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1 className="title">Log in</h1>
        </div>

        {message && <p className="alert alert-error" role="alert">{message}</p>}

        <div className="form-stack">
          <div className="field">
            <label className="label" htmlFor="email">Email</label>
            <input className="input" type="email" id="email" name="email" required onChange={handleChange} />
          </div>
          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <input className="input" type="password" id="password" name="password" required onChange={handleChange} />
          </div>
        </div>

        <button className="btn btn-primary btn-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </main>
  );
}
