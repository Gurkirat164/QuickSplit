import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Trash2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { createGroup } from '../store/slices/groupSlice';
import { closeModal } from '../store/slices/uiSlice';
import { authAPI } from '../services/api';

const CreateGroupModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { modals } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    currency: 'INR',
  });
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY'];

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (modals.createGroup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modals.createGroup]);

  const handleAddMember = async () => {
    if (!newMember.trim()) {
      toast.error('Please enter an email');
      return;
    }

    // Check if it's the current user's email
    if (newMember.toLowerCase() === user?.email?.toLowerCase()) {
      toast.error('You will be automatically added as a member');
      return;
    }

    // Check if email already exists in members list
    if (members.some(m => m.email.toLowerCase() === newMember.toLowerCase())) {
      toast.error('This email is already added');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMember)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setCheckingUser(true);
    try {
      // Check if user exists in database
      const response = await authAPI.checkUserExists(newMember);
      const userData = response.data.payload;

      // Add user to members list
      setMembers([...members, {
        email: userData.email,
        name: userData.name,
        _id: userData._id,
      }]);
      setNewMember('');
      toast.success('Member added to list');
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('User not found. Please check the email address.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to validate user');
      }
    } finally {
      setCheckingUser(false);
    }
  };

  const handleRemoveMember = (memberId) => {
    setMembers(members.filter(m => m._id !== memberId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await dispatch(createGroup({
        name: formData.name,
        description: formData.description,
        baseCurrency: formData.currency,
        members: members,
      })).unwrap();
      
      toast.success('Group created successfully!');
      setFormData({ name: '', description: '', currency: 'INR' });
      setMembers([]);
      setNewMember('');
      dispatch(closeModal('createGroup'));
      
      // Navigate to the newly created group
      if (result._id) {
        navigate(`/groups/${result._id}`);
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      toast.error(error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', currency: 'INR' });
    setMembers([]);
    setNewMember('');
    dispatch(closeModal('createGroup'));
  };

  if (!modals.createGroup) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto">
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 my-8 animate-fadeIn max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Group</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Trip to Paris"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What's this group for?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Currency *
            </label>
            <select
              required
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          {/* Add Members Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Members (Optional)
            </label>
            
            {/* Add Member Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMember())}
                disabled={checkingUser}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="member@example.com"
              />
              <button
                type="button"
                onClick={handleAddMember}
                disabled={checkingUser}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingUser ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Members List */}
            {members.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member._id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg text-center">
                No members added yet. You can add members now or later.
              </p>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              You will be automatically added as a member. Only registered users can be added.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default CreateGroupModal;
