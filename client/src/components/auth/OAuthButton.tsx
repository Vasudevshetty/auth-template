import React from "react";

interface OAuthButtonProps {
  provider: "google" | "github" | "facebook";
  onClick?: () => void;
}

const OAuthButton: React.FC<OAuthButtonProps> = ({ provider, onClick }) => {
  let backgroundColor = "";
  let hoverColor = "";
  let logo = "";
  let text = "";

  switch (provider) {
    case "google":
      backgroundColor = "bg-white";
      hoverColor = "hover:bg-gray-100";
      text = "Sign in with Google";
      logo = (
        <svg
          className="w-5 h-5"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      );
      break;
    case "github":
      backgroundColor = "bg-gray-900";
      hoverColor = "hover:bg-gray-800";
      text = "Sign in with GitHub";
      logo = (
        <svg
          className="w-5 h-5 text-white"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      );
      break;
    case "facebook":
      backgroundColor = "bg-[#1877F2]";
      hoverColor = "hover:bg-[#166FE5]";
      text = "Sign in with Facebook";
      logo = (
        <svg
          className="w-5 h-5 text-white"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      );
      break;
  }

  const btnClasses = `w-full inline-flex justify-center items-center ${backgroundColor} ${hoverColor} border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium ${
    provider === "github" || provider === "facebook"
      ? "text-white"
      : "text-gray-700"
  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-3`;

  const handleClick = () => {
    // Use the API base URL from the client's config
    const apiBaseUrl = "http://localhost:3000/api/v1";

    // Redirect to the OAuth endpoint on the server
    window.location.href = `${apiBaseUrl}/auth/${provider}`;

    if (onClick) {
      onClick();
    }
  };

  return (
    <button type="button" className={btnClasses} onClick={handleClick}>
      <span className="sr-only">{text}</span>
      <span className="mr-2">{logo}</span>
      {text}
    </button>
  );
};

export default OAuthButton;
