import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { register as registerUser, reset } from "../../features/auth/authSlice";
import Input from "../common/Input";
import Button from "../common/Button";
import OAuthButton from "./OAuthButton";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isLoading, isSuccess, isAuthenticated, isError, message } =
    useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }

    // If registration successful or already authenticated, redirect
    if (isSuccess || isAuthenticated) {
      navigate("/");
      toast.success("Registration successful");
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, isAuthenticated, message, navigate, dispatch]);

  const onSubmit = async (data: RegisterFormValues) => {
    const { name, email, password } = data;
    dispatch(registerUser({ name, email, password }));
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="auth-card">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your account
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <div>
            <div>
              <p className="text-sm font-medium text-gray-700">Sign up with</p>
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
            label="Name"
            type="text"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name", { required: "Name is required" })}
          />

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
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />

          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "The passwords do not match",
            })}
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className="mt-6"
          >
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
