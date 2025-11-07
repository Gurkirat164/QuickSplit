import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import { fetchGallery } from '../store/slices/gallerySlice';
import UploadButton from '../components/UploadButton';
import FilterByTimestamp from '../components/FilterByTimestamp';
import GalleryGrid from '../components/GalleryGrid';

const Gallery = () => {
  const dispatch = useDispatch();
  const { groupId } = useParams();
  const { images, filteredImages, loading } = useSelector((state) => state.gallery);
  const { groups } = useSelector((state) => state.groups);
  
  const currentGroup = groups?.find((g) => g._id === groupId);

  useEffect(() => {
    if (groupId) {
      dispatch(fetchGallery(groupId));
    }
  }, [dispatch, groupId]);

  if (!groupId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Group Selected</h3>
          <p className="text-gray-600">Please select a group to view its gallery</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {currentGroup?.name} Gallery
          </h1>
          <p className="text-gray-600 mt-1">
            {images.length === 0
              ? 'Upload and manage group images'
              : `${images.length} image${images.length !== 1 ? 's' : ''} total${
                  filteredImages.length !== images.length
                    ? ` • ${filteredImages.length} shown`
                    : ''
                }`}
          </p>
        </div>
        <UploadButton groupId={groupId} />
      </div>

      {/* Filter */}
      <FilterByTimestamp />

      {/* Gallery Grid */}
      {loading && images.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No images yet</h3>
          <p className="text-gray-600 mb-6">
            Start uploading images to build your group gallery
          </p>
          <UploadButton groupId={groupId} />
        </div>
      ) : (
        <GalleryGrid />
      )}
    </div>
  );
};

export default Gallery;
