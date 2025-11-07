import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { galleryAPI } from '../../services/api';
import { showToast } from '../../utils/toast';

// Async thunks
export const uploadImage = createAsyncThunk(
  'gallery/uploadImage',
  async ({ imageFile, groupId, onProgress }, { rejectWithValue }) => {
    try {
      const response = await galleryAPI.uploadImage(imageFile, groupId, onProgress);
      return response.data.payload;
    } catch (error) {
      console.error("Upload error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message,
        fullError: error
      });
      
      const message = error.response?.data?.message || error.message || 'Failed to upload image';
      return rejectWithValue(message);
    }
  }
);

export const fetchGallery = createAsyncThunk(
  'gallery/fetchGallery',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await galleryAPI.getGallery(groupId);
      return response.data.payload;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch gallery';
      return rejectWithValue(message);
    }
  }
);

export const deleteImage = createAsyncThunk(
  'gallery/deleteImage',
  async (imageId, { rejectWithValue }) => {
    try {
      await galleryAPI.deleteImage(imageId);
      return imageId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete image';
      return rejectWithValue(message);
    }
  }
);

const gallerySlice = createSlice({
  name: 'gallery',
  initialState: {
    images: [],
    filteredImages: [],
    loading: false,
    uploading: false,
    uploadProgress: 0,
    error: null,
    filterMode: 'all', // 'all', 'today', 'week', 'month', 'custom'
    customDateRange: {
      start: null,
      end: null,
    },
  },
  reducers: {
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
    setFilterMode: (state, action) => {
      state.filterMode = action.payload;
      state.filteredImages = filterImagesByDate(state.images, action.payload, state.customDateRange);
    },
    setCustomDateRange: (state, action) => {
      state.customDateRange = action.payload;
      if (state.filterMode === 'custom') {
        state.filteredImages = filterImagesByDate(state.images, 'custom', action.payload);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload Image
      .addCase(uploadImage.pending, (state) => {
        state.uploading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 100;
        state.images.unshift(action.payload); // Add to beginning
        state.filteredImages = filterImagesByDate(state.images, state.filterMode, state.customDateRange);
        showToast.success('Image uploaded successfully!');
        // Reset progress after a delay
        setTimeout(() => {
          state.uploadProgress = 0;
        }, 2000);
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 0;
        state.error = action.payload;
        showToast.error(action.payload || 'Upload failed');
      })
      
      // Fetch Gallery
      .addCase(fetchGallery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload;
        state.filteredImages = filterImagesByDate(action.payload, state.filterMode, state.customDateRange);
      })
      .addCase(fetchGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showToast.error(action.payload || 'Failed to load gallery');
      })
      
      // Delete Image
      .addCase(deleteImage.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.images = state.images.filter((img) => img._id !== action.payload);
        state.filteredImages = state.filteredImages.filter((img) => img._id !== action.payload);
        showToast.success('Image deleted successfully');
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.error = action.payload;
        showToast.error(action.payload || 'Failed to delete image');
      });
  },
});

// Helper function to filter images by date
const filterImagesByDate = (images, mode, customRange) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (mode) {
    case 'today': {
      return images.filter((img) => {
        const imgDate = new Date(img.createdAt);
        return imgDate >= today;
      });
    }
      
    case 'week': {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return images.filter((img) => {
        const imgDate = new Date(img.createdAt);
        return imgDate >= weekAgo;
      });
    }
      
    case 'month': {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return images.filter((img) => {
        const imgDate = new Date(img.createdAt);
        return imgDate >= monthAgo;
      });
    }
      
    case 'custom': {
      if (!customRange.start || !customRange.end) return images;
      const startDate = new Date(customRange.start);
      const endDate = new Date(customRange.end);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      return images.filter((img) => {
        const imgDate = new Date(img.createdAt);
        return imgDate >= startDate && imgDate <= endDate;
      });
    }
      
    default: // 'all'
      return images;
  }
};

export const {
  setUploadProgress,
  resetUploadProgress,
  setFilterMode,
  setCustomDateRange,
  clearError,
} = gallerySlice.actions;

export default gallerySlice.reducer;
