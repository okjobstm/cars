import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { EnvelopeOpenIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get email from location state or query params
  const email = location?.state?.email || new URLSearchParams(location.search).get('email');

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/users/verify-email', {
        email,
        otp
      });

      setSuccess('Email verified successfully!');

      if (response.data.token) {
        login(response.data);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/users/resend-verification', { email });
      setSuccess('Verification code resent successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-full bg-blue-500/10 mb-4 ring-1 ring-blue-500/20">
              <EnvelopeOpenIcon className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="heading-lg mb-2">
              Verify Your Email
            </h2>
            <p className="text-zinc-400">
              We've sent a verification code to
            </p>
            <p className="font-semibold text-white mt-1">
              {email}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <span className="block w-1.5 h-1.5 rounded-full bg-red-400" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
              <span className="block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleVerify}>
            <div>
              <label htmlFor="otp" className="label text-center block w-full mb-4">
                ENTER 6-DIGIT CODE
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                placeholder="000000"
                maxLength={6}
                className="input-field text-center tracking-[0.5em] text-2xl font-mono font-bold"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : 'Verify Email'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-zinc-400 mb-2">
              Didn't receive a code?
            </p>
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors disabled:opacity-50"
            >
              Resend Code
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
