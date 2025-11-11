import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import type { LoginFormData } from '../../types/auth.types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  loading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 fade-in">
      {/* Email */}
      <div>
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          className="input-field focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your email"
          disabled={loading}
        />
        {errors.email && (
          <p className="form-error">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            className="input-field pr-10 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
            disabled={loading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="form-error">{errors.password.message}</p>
        )}
      </div>

      {/* Forgot Password Link */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <a href="/forgot-password" className="text-blue-600 hover:text-blue-500">
            Forgot your password?
          </a>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary hover-raise flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing In...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-500 font-medium link-underline">
            Sign up
          </a>
        </p>
      </div>

      {/* OAuth Section */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <a
            href={`${import.meta.env.VITE_API_URL}/auth/google`}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <FcGoogle className="w-5 h-5" />
            Google
          </a>

          <a
            href={`${import.meta.env.VITE_API_URL}/auth/facebook`}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <FaFacebook className="w-5 h-5 text-[#1877F2]" />
            Facebook
          </a>
        </div>
      </div>

      {/* Demo Account Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Account</h4>
        <p className="text-xs text-blue-800">
          <strong>Email:</strong> demo@volunflow.com<br />
          <strong>Password:</strong> demo1234
        </p>
      </div>
    </form>
  );
};

export default LoginForm;