/**
 * useSettlements Hook
 * ===================
 * 
 * Custom React hook for managing settlements in the QuickSplit application.
 * Provides easy access to settlement calculations, validation, and utilities.
 */

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  calculateSettlements,
  validateSettlements,
  getSettlementStats,
  getUserSettlements,
  formatSettlementForDisplay,
  isUserInvolved,
  canSettleAll,
  getMinimumTransactions,
} from '../utils/settlements';

/**
 * Custom hook for settlement management
 * 
 * @param {String} groupId - Group ID to get settlements for
 * @returns {Object} Settlement utilities and data
 */
export const useSettlements = (groupId) => {
  const { user } = useSelector((state) => state.auth);
  const { settlements: groupSettlements, balances: groupBalances } = useSelector(
    (state) => state.groups
  );

  // Get settlements from Redux store (backend is source of truth)
  const allSettlements = useMemo(() => {
    return groupSettlements[groupId] || [];
  }, [groupSettlements, groupId]);

  // Get balances from Redux store
  const balances = useMemo(() => {
    return groupBalances[groupId] || [];
  }, [groupBalances, groupId]);

  // Filter settlements for current user
  const userSettlementData = useMemo(() => {
    if (!user?._id || allSettlements.length === 0) {
      return {
        toPay: [],
        toReceive: [],
        totalToPay: 0,
        totalToReceive: 0,
        netAmount: 0,
      };
    }
    return getUserSettlements(allSettlements, user._id);
  }, [allSettlements, user]);

  // Get settlement statistics
  const stats = useMemo(() => {
    return getSettlementStats(allSettlements);
  }, [allSettlements]);

  // Format settlements for display
  const formattedSettlements = useMemo(() => {
    if (!user?._id) return allSettlements;
    
    return allSettlements.map(settlement => 
      formatSettlementForDisplay(settlement, user._id)
    );
  }, [allSettlements, user]);

  // Check if user is involved in any settlement
  const userIsInvolved = useMemo(() => {
    if (!user?._id || allSettlements.length === 0) return false;
    return isUserInvolved(allSettlements, user._id);
  }, [allSettlements, user]);

  // Check if all balances can be settled
  const isSettleable = useMemo(() => {
    return canSettleAll(balances);
  }, [balances]);

  // Calculate minimum transactions needed
  const minimumTransactions = useMemo(() => {
    return getMinimumTransactions(balances);
  }, [balances]);

  // Calculate local settlements (for fallback/validation)
  const localSettlements = useMemo(() => {
    if (balances.length === 0) return [];
    return calculateSettlements(balances);
  }, [balances]);

  // Validate backend settlements against local calculation
  const isValid = useMemo(() => {
    if (allSettlements.length === 0) return true;
    return validateSettlements(balances, allSettlements);
  }, [balances, allSettlements]);

  // Helper to get settlement by index
  const getSettlement = (index) => {
    return formattedSettlements[index] || null;
  };

  // Helper to check if a specific settlement involves the user
  const doesSettlementInvolveUser = (settlement) => {
    if (!user?._id) return false;
    const userId = user._id.toString();
    const fromId = (settlement.from._id || settlement.from).toString();
    const toId = (settlement.to._id || settlement.to).toString();
    return fromId === userId || toId === userId;
  };

  return {
    // Settlement data
    allSettlements,
    formattedSettlements,
    userSettlements: userSettlementData,
    localSettlements, // For fallback/comparison
    balances,
    
    // Statistics
    stats,
    minimumTransactions,
    
    // Flags
    hasSettlements: allSettlements.length > 0,
    userIsInvolved,
    isSettleable,
    isValid,
    
    // Utilities
    getSettlement,
    doesSettlementInvolveUser,
    calculateSettlements: () => calculateSettlements(balances),
    validateSettlements: (settlements) => validateSettlements(balances, settlements),
  };
};

/**
 * Hook to get settlement summary for a group
 * 
 * @param {String} groupId - Group ID
 * @returns {Object} Settlement summary
 */
export const useSettlementSummary = (groupId) => {
  const { allSettlements, stats, userSettlements, hasSettlements } = useSettlements(groupId);
  
  return {
    hasSettlements,
    totalTransactions: stats.totalTransactions,
    totalAmount: stats.totalAmount,
    userOwes: userSettlements.totalToPay,
    userReceives: userSettlements.totalToReceive,
    userNetAmount: userSettlements.netAmount,
    participantCount: stats.uniqueParticipants,
  };
};

/**
 * Hook to get user-specific settlement actions
 * 
 * @param {String} groupId - Group ID
 * @returns {Object} User settlement actions
 */
export const useUserSettlementActions = (groupId) => {
  const { userSettlements, formattedSettlements } = useSettlements(groupId);
  const { user } = useSelector((state) => state.auth);
  
  const userPayments = useMemo(() => {
    return formattedSettlements.filter(s => s.isUserPayer);
  }, [formattedSettlements]);
  
  const userReceipts = useMemo(() => {
    return formattedSettlements.filter(s => s.isUserReceiver);
  }, [formattedSettlements]);
  
  const hasPayments = userPayments.length > 0;
  const hasReceipts = userReceipts.length > 0;
  const isSettled = !hasPayments && !hasReceipts;
  
  return {
    payments: userPayments,
    receipts: userReceipts,
    hasPayments,
    hasReceipts,
    isSettled,
    totalToPay: userSettlements.totalToPay,
    totalToReceive: userSettlements.totalToReceive,
    netAmount: userSettlements.netAmount,
  };
};

export default useSettlements;
