import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
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
      setMessage(
        error.response?.data?.message ||
        'The server could not be reached. Please make sure the backend is running.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-center">
      <form className="auth-card" method="post" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Get started</p>
          <h1 className="title">Create account</h1>
        </div>

        {message && <p className="alert alert-error" role="alert">{message}</p>}

        <div className="form-stack">
          <div className="field">
            <label className="label" htmlFor="name">Name</label>
            <input className="input" type="text" id="name" name="name" required onChange={handleChange} />
          </div>
          <div className="field">
            <label className="label" htmlFor="email">Email</label>
            <input className="input" type="email" id="email" name="email" required onChange={handleChange} />
          </div>
          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <input className="input" type="password" id="password" name="password" required onChange={handleChange} />
          </div>
        </div>

        <button className="btn btn-accent btn-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-muted">
          Already registered? <Link className="link" to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
