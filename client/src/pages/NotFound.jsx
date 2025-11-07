import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-blue-900 px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-linear-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent animate-pulse">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-blue-500/20">
          <div className="mb-6">
            <svg
              className="w-20 h-20 mx-auto text-blue-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-3xl font-bold text-white mb-2">
              Page Not Found
            </h2>
            <p className="text-gray-400 mb-6">
              Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-linear-to-r from-blue-500 via-cyan-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/50"
            >
              <Home className="w-5 h-5" />
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}</span>
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <p className="mt-6 text-gray-500 text-sm">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
