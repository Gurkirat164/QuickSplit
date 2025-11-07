import { useSelector } from 'react-redux';

const ProgressBar = () => {
  const { uploadProgress, uploading } = useSelector((state) => state.gallery);

  if (!uploading && uploadProgress === 0) return null;

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {uploadProgress === 100 ? 'Upload Complete!' : 'Uploading...'}
        </span>
        <span className="text-sm font-semibold text-blue-600">
          {uploadProgress}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ease-out ${
            uploadProgress === 100 ? 'bg-green-500' : 'bg-blue-600'
          }`}
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
