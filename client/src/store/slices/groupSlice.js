import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { groupAPI } from '../../services/api';
import { dummyGroups } from '../../data/dummyData';

// Temporary flag - set to false when API is ready
const USE_DUMMY_DATA = true;

// Async thunks
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      // Use dummy data if flag is enabled
      if (USE_DUMMY_DATA) {
        return new Promise((resolve) => {
          setTimeout(() => resolve(dummyGroups), 500);
        });
      }
      
      const response = await groupAPI.getGroups();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch groups');
    }
  }
);

export const fetchGroupDetails = createAsyncThunk(
  'groups/fetchGroupDetails',
  async (groupId, { rejectWithValue, getState }) => {
    try {
      // Use dummy data if flag is enabled
      if (USE_DUMMY_DATA) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // First check the Redux store for newly created groups
            const state = getState();
            let group = state.groups.groups.find(g => g._id === groupId);
            
            // If not in Redux, check dummyGroups
            if (!group) {
              group = dummyGroups.find(g => g._id === groupId);
            }
            
            if (group) {
              resolve(group);
            } else {
              reject('Group not found');
            }
          }, 300);
        });
      }
      
      const response = await groupAPI.getGroupById(groupId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch group details');
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      // Use dummy data if flag is enabled
      if (USE_DUMMY_DATA) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const newGroup = {
              _id: `group_${Date.now()}`,
              name: groupData.name,
              description: groupData.description || '',
              members: groupData.members || [],
              createdBy: 'user1',
              createdAt: new Date().toISOString(),
              balances: [],
            };
            resolve(newGroup);
          }, 400);
        });
      }
      
      const response = await groupAPI.createGroup(groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create group');
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ groupId, groupData }, { rejectWithValue }) => {
    try {
      // Use dummy data if flag is enabled
      if (USE_DUMMY_DATA) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              _id: groupId,
              ...groupData,
              updatedAt: new Date().toISOString(),
            });
          }, 300);
        });
      }
      
      const response = await groupAPI.updateGroup(groupId, groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update group');
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      // Use dummy data if flag is enabled
      if (USE_DUMMY_DATA) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(groupId);
          }, 300);
        });
      }
      
      await groupAPI.deleteGroup(groupId);
      return groupId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete group');
    }
  }
);

export const addMember = createAsyncThunk(
  'groups/addMember',
  async ({ groupId, memberData }, { rejectWithValue }) => {
    try {
      // Use dummy data if flag is enabled
      if (USE_DUMMY_DATA) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const group = dummyGroups.find(g => g._id === groupId);
            if (group) {
              const updatedGroup = {
                ...group,
                members: [
                  ...group.members,
                  {
                    _id: `user_${Date.now()}`,
                    name: memberData.name || memberData.email,
                    email: memberData.email,
                  }
                ],
              };
              resolve(updatedGroup);
            } else {
              reject('Group not found');
            }
          }, 300);
        });
      }
      
      const response = await groupAPI.addMember(groupId, memberData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add member');
    }
  }
);

export const removeMember = createAsyncThunk(
  'groups/removeMember',
  async ({ groupId, memberId }, { rejectWithValue }) => {
    try {
      // Use dummy data if flag is enabled
      if (USE_DUMMY_DATA) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const group = dummyGroups.find(g => g._id === groupId);
            if (group) {
              const updatedGroup = {
                ...group,
                members: group.members.filter(m => m._id !== memberId),
              };
              resolve(updatedGroup);
            } else {
              reject('Group not found');
            }
          }, 300);
        });
      }
      
      const response = await groupAPI.removeMember(groupId, memberId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove member');
    }
  }
);

export const fetchBalances = createAsyncThunk(
  'groups/fetchBalances',
  async (groupId, { rejectWithValue }) => {
    try {
      // Use dummy data if flag is enabled
      if (USE_DUMMY_DATA) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const group = dummyGroups.find(g => g._id === groupId);
            const balances = group?.balances || [];
            resolve({ groupId, balances });
          }, 300);
        });
      }
      
      const response = await groupAPI.getBalances(groupId);
      return { groupId, balances: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch balances');
    }
  }
);

const groupSlice = createSlice({
  name: 'groups',
  initialState: {
    groups: [],
    currentGroup: null,
    balances: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentGroup: (state) => {
      state.currentGroup = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch group details
      .addCase(fetchGroupDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGroup = action.payload;
      })
      .addCase(fetchGroupDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create group
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update group
      .addCase(updateGroup.fulfilled, (state, action) => {
        const index = state.groups.findIndex(g => g._id === action.payload._id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
        if (state.currentGroup?._id === action.payload._id) {
          state.currentGroup = action.payload;
        }
      })
      // Delete group
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter(g => g._id !== action.payload);
        if (state.currentGroup?._id === action.payload) {
          state.currentGroup = null;
        }
      })
      // Add member
      .addCase(addMember.fulfilled, (state, action) => {
        if (state.currentGroup) {
          state.currentGroup = action.payload;
        }
      })
      // Remove member
      .addCase(removeMember.fulfilled, (state, action) => {
        if (state.currentGroup) {
          state.currentGroup = action.payload;
        }
      })
      // Fetch balances
      .addCase(fetchBalances.fulfilled, (state, action) => {
        state.balances[action.payload.groupId] = action.payload.balances;
      });
  },
});

export const { clearCurrentGroup, clearError } = groupSlice.actions;
export default groupSlice.reducer;
