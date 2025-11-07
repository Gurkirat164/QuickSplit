// Format currency with symbol
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format datetime
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
};

// Calculate split amount
export const calculateSplit = (amount, numberOfPeople) => {
  return (amount / numberOfPeople).toFixed(2);
};

// Get user initials
export const getUserInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Generate random color for avatars
export const getRandomColor = (seed) => {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];
  
  if (!seed) return colors[0];
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Calculate Simplified Settlements - Greedy Debt Simplification Algorithm
 * ========================================================================
 * 
 * @deprecated This function is deprecated and should not be used for new code.
 * The backend is now the single source of truth for settlement calculations.
 * Use the settlements returned from the backend API (fetchBalances) instead.
 * This function is kept only for backward compatibility or fallback scenarios.
 * 
 * Purpose:
 * --------
 * Minimize the number of transactions needed to settle all debts within a group.
 * Instead of everyone paying everyone they owe (O(n²) transactions), this reduces
 * it to at most O(n-1) transactions.
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
 * Example:
 * --------
 * Input:  Alice: +$50, Bob: -$30, Charlie: -$20
 * Output: [Bob → Alice: $30, Charlie → Alice: $20]
 * Transactions: 2 (optimal)
 * 
 * Complex Example:
 * ----------------
 * Input:  A: +$50, B: +$30, C: -$40, D: -$40
 * Without optimization: 4 transactions
 * With this algorithm: 3 transactions (25% reduction)
 * 
 * Complexity:
 * -----------
 * Time: O(n log n) - dominated by sorting
 * Space: O(n) - for creditor and debtor arrays
 * Transactions: O(n) - at most n-1 transactions
 * 
 * @param {Array} balances - Array of balance objects:
 *   {
 *     user: { _id, name, email },
 *     amount: number (positive = owed, negative = owes)
 *   }
 * @returns {Array} Array of settlement transactions:
 *   {
 *     from: { _id, name, email },  // person who pays
 *     to: { _id, name, email },    // person who receives
 *     amount: number                // amount to transfer
 *   }
 */
export const calculateSettlements = (balances) => {
  const EPSILON = 0.01; // Tolerance for floating point comparisons
  const creditors = [];
  const debtors = [];

  // Step 1: Separate into creditors and debtors
  balances.forEach((balance) => {
    if (balance.amount > EPSILON) {
      // Positive balance: this person is owed money
      creditors.push({ ...balance, amount: balance.amount });
    } else if (balance.amount < -EPSILON) {
      // Negative balance: this person owes money
      debtors.push({ ...balance, amount: Math.abs(balance.amount) });
    }
    // Skip balances near zero (within epsilon)
  });

  // Early return if no settlements needed
  if (creditors.length === 0 || debtors.length === 0) {
    return [];
  }

  // Step 2: Sort both arrays by amount (largest first) for optimal matching
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  // Step 3: Greedy two-pointer matching
  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    // Settlement amount is the minimum of what creditor is owed and what debtor owes
    const settlementAmount = Math.min(creditor.amount, debtor.amount);
    
    // Create settlement transaction
    settlements.push({
      from: debtor.user,
      to: creditor.user,
      amount: parseFloat(settlementAmount.toFixed(2)),
    });

    // Reduce both balances
    creditor.amount -= settlementAmount;
    debtor.amount -= settlementAmount;

    // Move to next creditor if current one is fully paid
    if (creditor.amount < EPSILON) creditorIndex++;
    
    // Move to next debtor if current one has paid all debts
    if (debtor.amount < EPSILON) debtorIndex++;
  }

  return settlements;
};

/**
 * @deprecated Use calculateSettlements instead
 * This is an alias kept for backward compatibility
 */
export const simplifyDebts = calculateSettlements;
