import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { resetPassword, reset } from '../../features/auth/authSlice';
import Input from '../common/Input';
import Button from '../common/Button';

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const [resetComplete, setResetComplete] = useState(false);
  const { token } = useParams<{ token: string }>();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>();
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { isLoading, isSuccess, isError, message } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }

    if (isSuccess && message) {
      setResetComplete(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, navigate, dispatch]);

  const onSubmit = (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error('Reset token is missing');
      return;
    }
    
    dispatch(resetPassword({
      token,
      newPassword: data.password,
    }));
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="auth-card">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Set new password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Please enter a new password for your account
          </p>
        </div>

        {resetComplete ? (
          <div className="mt-8">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Password reset successful
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Your password has been reset successfully. You will be redirected to the login page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center">
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Go to login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="New Password"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
            />

            <Input
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === watch('password') || 'The passwords do not match',
              })}
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="mt-6"
            >
              Reset Password
            </Button>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;