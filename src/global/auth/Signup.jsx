import useSignup from "../../hooks/auth-hooks/useSignup";

const Signup = ({ switchToLogin }) => {
  const { formData, handleChange, handleSubmit, isLoading, errors } = useSignup(switchToLogin);

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData?.username || ""}
          onChange={handleChange}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors?.username ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Choose a username"
        />
        {errors?.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
      </div>

      <div className="mb-6">
        <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData?.email || ""}
          onChange={handleChange}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors?.email ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Enter your email"
        />
        {errors?.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData?.password || ""}
          onChange={handleChange}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors?.password ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Create a password"
        />
        {errors?.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Creating account...
          </span>
        ) : (
          "Sign Up"
        )}
      </button>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button type="button" className="text-blue-600 hover:text-blue-800 font-medium" onClick={switchToLogin}>
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
};

export default Signup;
