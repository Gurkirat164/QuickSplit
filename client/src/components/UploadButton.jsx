import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload } from 'lucide-react';
import { uploadImage, setUploadProgress } from '../store/slices/gallerySlice';
import { showToast } from '../utils/toast';

const UploadButton = ({ groupId }) => {
  const dispatch = useDispatch();
  const { uploading } = useSelector((state) => state.gallery);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast.error('Please select a valid image file (JPG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showToast.error('Image size must be less than 10MB');
      return;
    }

    if (!groupId) {
      showToast.error('No group selected');
      return;
    }

    // Show upload start toast
    const uploadToast = showToast.loading('Uploading image...');

    // Upload with progress tracking
    dispatch(
      uploadImage({
        imageFile: file,
        groupId: groupId,
        onProgress: (progress) => {
          dispatch(setUploadProgress(progress));
        },
      })
    ).then(() => {
      showToast.dismiss(uploadToast);
    }).catch(() => {
      showToast.dismiss(uploadToast);
    });

    // Reset file input
    event.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      <button
        onClick={handleClick}
        disabled={uploading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          uploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <Upload className="w-5 h-5" />
        <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
      </button>
    </>
  );
};

export default UploadButton;
