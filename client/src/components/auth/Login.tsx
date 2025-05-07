import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { login, reset } from "../../features/auth/authSlice";
import Input from "../common/Input";
import Button from "../common/Button";
import OAuthButton from "./OAuthButton";

interface LoginFormValues {
  email: string;
  password: string;
}

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, isSuccess, isAuthenticated, isError, message } =
    useAppSelector((state) => state.auth);

  // Redirect location after successful login
  const from = (location.state as any)?.from || "/";

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }

    // If login successful or already authenticated, redirect
    if (isSuccess || isAuthenticated) {
      navigate(from, { replace: true });
      toast.success("Login successful");
    }

    // Reset state
    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, isAuthenticated, message, navigate, from, dispatch]);

  const onSubmit = async (data: LoginFormValues) => {
    dispatch(login(data));
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="auth-card">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <div>
            <div>
              <p className="text-sm font-medium text-gray-700">Sign in with</p>
              <div className="mt-3 space-y-3">
                <OAuthButton provider="google" />
                <OAuthButton provider="github" />
                <OAuthButton provider="facebook" />
              </div>
            </div>

            <div className="mt-6 relative">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
          </div>
        </div>

        <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password", { required: "Password is required" })}
          />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button type="submit" fullWidth isLoading={isLoading}>
            Sign in with Email
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
