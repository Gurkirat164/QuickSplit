/**
 * CLIENT-SIDE SETTLEMENT UTILITIES
 * ==================================
 * 
 * This module provides client-side utilities for settlement calculations and validation.
 * Note: The backend is the single source of truth for settlements. These utilities are
 * provided for client-side validation, fallback scenarios, and UI enhancements.
 */

/**
 * Calculate Simplified Settlements - Greedy Debt Simplification Algorithm
 * ========================================================================
 * 
 * Minimizes the number of transactions needed to settle all debts within a group.
 * 
 * Algorithm: Greedy Two-Pointer Matching
 * ---------------------------------------
 * 1. Separate users into creditors (positive balance) and debtors (negative balance)
 * 2. Sort both groups by absolute amount (largest first)
 * 3. Greedily match largest creditor with largest debtor
 * 4. Transfer min(creditor_amount, debtor_amount)
 * 5. Adjust balances and move to next when settled
 * 6. Repeat until all debts are settled
 * 
 * Complexity: O(n log n) time, O(n) space, O(n) transactions
 * 
 * @param {Array} balances - Array of balance objects
 * @param {Object} balances[].user - User object {_id, name, email}
 * @param {Number} balances[].amount - Net balance (positive = owed, negative = owes)
 * @returns {Array} settlements - Array of settlement transactions
 */
export const calculateSettlements = (balances) => {
  const EPSILON = 0.01; // Tolerance for floating point comparisons
  const creditors = [];
  const debtors = [];

  // Separate into creditors and debtors
  balances.forEach((balance) => {
    if (balance.amount > EPSILON) {
      creditors.push({ ...balance, amount: balance.amount });
    } else if (balance.amount < -EPSILON) {
      debtors.push({ ...balance, amount: Math.abs(balance.amount) });
    }
  });

  // Early return if no settlements needed
  if (creditors.length === 0 || debtors.length === 0) {
    return [];
  }

  // Sort both arrays by amount (largest first)
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  // Two-pointer matching
  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const settlementAmount = Math.min(creditor.amount, debtor.amount);
    
    settlements.push({
      from: debtor.user,
      to: creditor.user,
      amount: parseFloat(settlementAmount.toFixed(2)),
    });

    creditor.amount -= settlementAmount;
    debtor.amount -= settlementAmount;

    if (creditor.amount < EPSILON) creditorIndex++;
    if (debtor.amount < EPSILON) debtorIndex++;
  }

  return settlements;
};

/**
 * Validate that settlements correctly resolve all balances
 * 
 * @param {Array} balances - Original balances before settlements
 * @param {Array} settlements - Calculated settlements to validate
 * @returns {Boolean} True if settlements correctly resolve all balances
 */
export const validateSettlements = (balances, settlements) => {
  const EPSILON = 0.01;
  const netChanges = new Map();
  
  // Initialize with original balances
  balances.forEach(balance => {
    const userId = balance.user._id || balance.user;
    netChanges.set(userId.toString(), balance.amount);
  });
  
  // Apply all settlements
  settlements.forEach(settlement => {
    const fromId = (settlement.from._id || settlement.from).toString();
    const toId = (settlement.to._id || settlement.to).toString();
    const amount = settlement.amount;
    
    // Debtor pays, so their balance increases (becomes less negative)
    const fromBalance = netChanges.get(fromId) || 0;
    netChanges.set(fromId, fromBalance + amount);
    
    // Creditor receives, so their balance decreases (becomes less positive)
    const toBalance = netChanges.get(toId) || 0;
    netChanges.set(toId, toBalance - amount);
  });
  
  // Check if all balances are now approximately zero
  for (const balance of netChanges.values()) {
    if (Math.abs(balance) > EPSILON) {
      return false;
    }
  }
  
  return true;
};

/**
 * Get settlement statistics for display
 * 
 * @param {Array} settlements - Array of settlement transactions
 * @returns {Object} Statistics about the settlements
 */
export const getSettlementStats = (settlements) => {
  if (!settlements || settlements.length === 0) {
    return {
      totalTransactions: 0,
      totalAmount: 0,
      uniqueParticipants: 0,
      averageAmount: 0,
    };
  }

  const totalAmount = settlements.reduce((sum, s) => sum + s.amount, 0);
  const participants = new Set();
  
  settlements.forEach(s => {
    participants.add((s.from._id || s.from).toString());
    participants.add((s.to._id || s.to).toString());
  });

  return {
    totalTransactions: settlements.length,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    uniqueParticipants: participants.size,
    averageAmount: parseFloat((totalAmount / settlements.length).toFixed(2)),
  };
};

/**
 * Filter settlements for a specific user
 * 
 * @param {Array} settlements - All settlements
 * @param {String} userId - User ID to filter for
 * @returns {Object} Settlements involving the user, separated by type
 */
export const getUserSettlements = (settlements, userId) => {
  const userIdStr = userId.toString();
  
  const toPay = settlements.filter(s => 
    (s.from._id || s.from).toString() === userIdStr
  );
  
  const toReceive = settlements.filter(s => 
    (s.to._id || s.to).toString() === userIdStr
  );
  
  const totalToPay = toPay.reduce((sum, s) => sum + s.amount, 0);
  const totalToReceive = toReceive.reduce((sum, s) => sum + s.amount, 0);
  
  return {
    toPay,
    toReceive,
    totalToPay: parseFloat(totalToPay.toFixed(2)),
    totalToReceive: parseFloat(totalToReceive.toFixed(2)),
    netAmount: parseFloat((totalToReceive - totalToPay).toFixed(2)),
  };
};

/**
 * Sort settlements by amount (largest first)
 * 
 * @param {Array} settlements - Settlements to sort
 * @returns {Array} Sorted settlements
 */
export const sortSettlementsByAmount = (settlements) => {
  return [...settlements].sort((a, b) => b.amount - a.amount);
};

/**
 * Group settlements by creditor (person receiving money)
 * 
 * @param {Array} settlements - Settlements to group
 * @returns {Map} Map of creditor ID to settlements
 */
export const groupSettlementsByCreditor = (settlements) => {
  const grouped = new Map();
  
  settlements.forEach(settlement => {
    const creditorId = (settlement.to._id || settlement.to).toString();
    if (!grouped.has(creditorId)) {
      grouped.set(creditorId, []);
    }
    grouped.get(creditorId).push(settlement);
  });
  
  return grouped;
};

/**
 * Group settlements by debtor (person paying money)
 * 
 * @param {Array} settlements - Settlements to group
 * @returns {Map} Map of debtor ID to settlements
 */
export const groupSettlementsByDebtor = (settlements) => {
  const grouped = new Map();
  
  settlements.forEach(settlement => {
    const debtorId = (settlement.from._id || settlement.from).toString();
    if (!grouped.has(debtorId)) {
      grouped.set(debtorId, []);
    }
    grouped.get(debtorId).push(settlement);
  });
  
  return grouped;
};

/**
 * Check if a user is involved in any settlements
 * 
 * @param {Array} settlements - All settlements
 * @param {String} userId - User ID to check
 * @returns {Boolean} True if user is involved in any settlement
 */
export const isUserInvolved = (settlements, userId) => {
  const userIdStr = userId.toString();
  return settlements.some(s => 
    (s.from._id || s.from).toString() === userIdStr ||
    (s.to._id || s.to).toString() === userIdStr
  );
};

/**
 * Format settlement for display
 * 
 * @param {Object} settlement - Settlement to format
 * @param {String} currentUserId - Current user's ID for personalization
 * @returns {Object} Formatted settlement information
 */
export const formatSettlementForDisplay = (settlement, currentUserId) => {
  const fromId = (settlement.from._id || settlement.from).toString();
  const toId = (settlement.to._id || settlement.to).toString();
  const currentUserIdStr = currentUserId.toString();
  
  const isUserPayer = fromId === currentUserIdStr;
  const isUserReceiver = toId === currentUserIdStr;
  
  return {
    ...settlement,
    isUserPayer,
    isUserReceiver,
    isUserInvolved: isUserPayer || isUserReceiver,
    displayText: isUserPayer 
      ? `You pay ${settlement.to.name || 'User'}`
      : isUserReceiver
        ? `${settlement.from.name || 'User'} pays you`
        : `${settlement.from.name || 'User'} pays ${settlement.to.name || 'User'}`,
    direction: isUserPayer ? 'outgoing' : isUserReceiver ? 'incoming' : 'other',
  };
};

/**
 * Calculate what percentage of settlements involve a specific user
 * 
 * @param {Array} settlements - All settlements
 * @param {String} userId - User ID to check
 * @returns {Number} Percentage (0-100)
 */
export const getUserInvolvementPercentage = (settlements, userId) => {
  if (!settlements || settlements.length === 0) return 0;
  
  const userIdStr = userId.toString();
  const involvedCount = settlements.filter(s =>
    (s.from._id || s.from).toString() === userIdStr ||
    (s.to._id || s.to).toString() === userIdStr
  ).length;
  
  return parseFloat(((involvedCount / settlements.length) * 100).toFixed(1));
};

/**
 * Compare settlements from different sources (e.g., backend vs local calculation)
 * 
 * @param {Array} settlements1 - First set of settlements
 * @param {Array} settlements2 - Second set of settlements
 * @returns {Object} Comparison results
 */
export const compareSettlements = (settlements1, settlements2) => {
  const total1 = settlements1.reduce((sum, s) => sum + s.amount, 0);
  const total2 = settlements2.reduce((sum, s) => sum + s.amount, 0);
  
  return {
    countMatch: settlements1.length === settlements2.length,
    count1: settlements1.length,
    count2: settlements2.length,
    totalMatch: Math.abs(total1 - total2) < 0.01,
    total1: parseFloat(total1.toFixed(2)),
    total2: parseFloat(total2.toFixed(2)),
    difference: parseFloat(Math.abs(total1 - total2).toFixed(2)),
  };
};

/**
 * Check if all settlements can be completed (sum to zero)
 * 
 * @param {Array} balances - User balances
 * @returns {Boolean} True if balances sum to approximately zero
 */
export const canSettleAll = (balances) => {
  const EPSILON = 0.01;
  const sum = balances.reduce((total, b) => total + b.amount, 0);
  return Math.abs(sum) < EPSILON;
};

/**
 * Get the minimum number of transactions theoretically needed
 * 
 * @param {Array} balances - User balances
 * @returns {Number} Minimum transactions needed
 */
export const getMinimumTransactions = (balances) => {
  const EPSILON = 0.01;
  
  const creditorCount = balances.filter(b => b.amount > EPSILON).length;
  const debtorCount = balances.filter(b => b.amount < -EPSILON).length;
  
  // Minimum transactions = max(creditors, debtors)
  // In practice, it's often creditors + debtors - 1
  return Math.max(creditorCount, debtorCount);
};

export default {
  calculateSettlements,
  validateSettlements,
  getSettlementStats,
  getUserSettlements,
  sortSettlementsByAmount,
  groupSettlementsByCreditor,
  groupSettlementsByDebtor,
  isUserInvolved,
  formatSettlementForDisplay,
  getUserInvolvementPercentage,
  compareSettlements,
  canSettleAll,
  getMinimumTransactions,
};
