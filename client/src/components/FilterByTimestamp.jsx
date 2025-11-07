import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Filter } from 'lucide-react';
import { setFilterMode, setCustomDateRange } from '../store/slices/gallerySlice';
import { useState } from 'react';

const FilterByTimestamp = () => {
  const dispatch = useDispatch();
  const { filterMode, customDateRange } = useSelector((state) => state.gallery);
  const [showCustomRange, setShowCustomRange] = useState(false);

  const handleFilterChange = (mode) => {
    dispatch(setFilterMode(mode));
    if (mode === 'custom') {
      setShowCustomRange(true);
    } else {
      setShowCustomRange(false);
    }
  };

  const handleDateChange = (field, value) => {
    dispatch(
      setCustomDateRange({
        ...customDateRange,
        [field]: value,
      })
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex items-center space-x-2 mb-3">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-700">Filter by Date</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterMode === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleFilterChange('today')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterMode === 'today'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => handleFilterChange('week')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterMode === 'week'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => handleFilterChange('month')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterMode === 'month'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => handleFilterChange('custom')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
            filterMode === 'custom'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Custom</span>
        </button>
      </div>

      {/* Custom Date Range Picker */}
      {showCustomRange && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customDateRange.start || ''}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customDateRange.end || ''}
                onChange={(e) => handleDateChange('end', e.target.value)}
                min={customDateRange.start || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterByTimestamp;
