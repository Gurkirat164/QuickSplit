import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, User, Calendar, X } from 'lucide-react';
import { deleteImage } from '../store/slices/gallerySlice';
import { formatDistanceToNow } from 'date-fns';
import DeleteConfirmModal from './DeleteConfirmModal';

const GalleryGrid = () => {
  const dispatch = useDispatch();
  const { filteredImages, loading } = useSelector((state) => state.gallery);
  const { user } = useSelector((state) => state.auth);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  const handleDelete = async (imageId, event) => {
    event.stopPropagation();
    setImageToDelete(imageId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (imageToDelete) {
      setDeletingId(imageToDelete);
      await dispatch(deleteImage(imageToDelete));
      setDeletingId(null);
      
      // Close modal if deleted image was selected
      if (selectedImage?._id === imageToDelete) {
        setSelectedImage(null);
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  const formatFullDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (filteredImages.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No images found</h3>
        <p className="text-gray-600">
          No images match the selected filter. Try changing your date range.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredImages.map((image) => {
          const isOwner = image.uploadedBy._id === user?._id;
          const isDeleting = deletingId === image._id;

          return (
            <div
              key={image._id}
              onClick={() => setSelectedImage(image)}
              className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
            >
              {/* Image */}
              <img
                src={image.url}
                alt={`Uploaded by ${image.uploadedBy.name}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <div className="flex items-center space-x-2 text-xs mb-1">
                    <User className="w-3 h-3" />
                    <span className="truncate">{image.uploadedBy.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs opacity-90">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(image.createdAt)}</span>
                  </div>
                </div>

                {/* Delete button (only for owner) */}
                {isOwner && (
                  <button
                    onClick={(e) => handleDelete(image._id, e)}
                    disabled={isDeleting}
                    className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:bg-gray-400"
                    title="Delete image"
                  >
                    {isDeleting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Image */}
            <div className="max-h-[70vh] overflow-hidden bg-gray-900">
              <img
                src={selectedImage.url}
                alt={`Uploaded by ${selectedImage.uploadedBy.name}`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Details */}
            <div className="p-6 bg-white">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{selectedImage.uploadedBy.name}</span>
                    <span className="text-sm text-gray-500">
                      ({selectedImage.uploadedBy.email})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{formatFullDate(selectedImage.createdAt)}</span>
                  </div>
                </div>

                {/* Delete button in modal */}
                {selectedImage.uploadedBy._id === user?._id && (
                  <button
                    onClick={(e) => handleDelete(selectedImage._id, e)}
                    disabled={deletingId === selectedImage._id}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:bg-gray-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default GalleryGrid;
