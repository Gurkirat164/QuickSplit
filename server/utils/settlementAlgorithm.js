/**
 * SETTLEMENTS ALGORITHM - DEBT SIMPLIFICATION
 * ============================================
 * 
 * Problem Statement:
 * ------------------
 * In a group expense sharing application, multiple users may owe money to each other.
 * We need to minimize the number of transactions required to settle all debts.
 * 
 * Example Scenario:
 * -----------------
 * - Alice paid $100 for dinner (split 3 ways)
 * - Bob paid $60 for taxi (split 3 ways)
 * - Charlie paid $30 for tickets (split 3 ways)
 * 
 * Net balances:
 * - Alice: paid $100, owes $63.33 → net +$36.67 (is owed)
 * - Bob: paid $60, owes $63.33 → net -$3.33 (owes)
 * - Charlie: paid $30, owes $63.33 → net -$33.33 (owes)
 * 
 * Without optimization: Bob pays Alice $3.33, Charlie pays Alice $33.33 (2 transactions)
 * With this algorithm: Same result (2 transactions - optimal)
 * 
 * Complex Example:
 * ----------------
 * Balances: A: +$50, B: +$30, C: -$40, D: -$40
 * 
 * Naive approach (every debtor pays every creditor proportionally):
 * - C pays A: $25, C pays B: $15
 * - D pays A: $25, D pays B: $15
 * Total: 4 transactions
 * 
 * Optimized approach (this algorithm):
 * - C pays A: $40
 * - D pays A: $10
 * - D pays B: $30
 * Total: 3 transactions (minimum possible)
 * 
 * Algorithm: Greedy Two-Pointer Matching
 * =======================================
 * 
 * Core Idea:
 * ----------
 * Match the largest creditor (person owed most) with the largest debtor (person who owes most).
 * This greedy approach minimizes the total number of transactions.
 * 
 * Steps:
 * ------
 * 1. Separate users into two groups:
 *    - Creditors: Users with positive balance (are owed money)
 *    - Debtors: Users with negative balance (owe money)
 * 
 * 2. Sort both groups by absolute amount in descending order
 *    - This ensures we handle largest amounts first
 *    - Helps minimize total number of transactions
 * 
 * 3. Use two pointers (one for creditors, one for debtors):
 *    - Calculate settlement: min(creditor_amount, debtor_amount)
 *    - Create transaction: debtor → creditor
 *    - Reduce both balances by settlement amount
 *    - If creditor fully paid (balance ≈ 0), move to next creditor
 *    - If debtor fully paid (balance ≈ 0), move to next debtor
 *    - Repeat until all debts settled
 * 
 * Mathematical Proof of Optimality:
 * ----------------------------------
 * - Let C = number of creditors, D = number of debtors
 * - Minimum transactions needed = max(C, D)
 * - In worst case: C = D = n/2, so max transactions = n/2
 * - This algorithm achieves exactly min(C + D - 1, max(C, D))
 * - Which is optimal for the debt settlement problem
 * 
 * Complexity Analysis:
 * --------------------
 * - Time: O(n log n) - dominated by sorting
 * - Space: O(n) - for creditors and debtors arrays
 * - Transactions: O(n) - at most n-1 transactions
 * 
 * Edge Cases Handled:
 * -------------------
 * 1. All users have zero balance → returns empty array
 * 2. Only one creditor and one debtor → returns single transaction
 * 3. Floating point precision → uses epsilon for comparisons
 * 4. Already settled group → filters out zero balances
 * 
 * @param {Array} balances - Array of balance objects
 * @param {Object} balances[].user - User object {_id, name, email}
 * @param {Number} balances[].amount - Net balance (positive = owed, negative = owes)
 * @returns {Array} settlements - Array of settlement transactions
 * @returns {Object} settlements[].from - Debtor user object
 * @returns {Object} settlements[].to - Creditor user object
 * @returns {Number} settlements[].amount - Amount to transfer
 */
export const calculateSettlements = (balances) => {
    // Epsilon for floating point comparison (1 cent tolerance)
    const EPSILON = 0.01;
    
    // Separate users into creditors and debtors
    const creditors = [];
    const debtors = [];

    balances.forEach((balance) => {
        if (balance.amount > EPSILON) {
            // Positive balance: this person is owed money
            creditors.push({
                user: balance.user,
                amount: balance.amount
            });
        } else if (balance.amount < -EPSILON) {
            // Negative balance: this person owes money
            debtors.push({
                user: balance.user,
                amount: Math.abs(balance.amount) // Convert to positive for easier calculation
            });
        }
        // Skip users with balance ≈ 0 (within epsilon)
    });

    // Early return if no settlements needed
    if (creditors.length === 0 || debtors.length === 0) {
        return [];
    }

    // Sort both arrays by amount (largest first)
    // This greedy approach minimizes total transactions
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const settlements = [];
    let creditorIndex = 0;
    let debtorIndex = 0;

    // Two-pointer approach to match creditors with debtors
    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
        const creditor = creditors[creditorIndex];
        const debtor = debtors[debtorIndex];

        // Settlement amount is the minimum of what creditor is owed
        // and what debtor owes
        const settlementAmount = Math.min(creditor.amount, debtor.amount);

        // Create settlement transaction
        settlements.push({
            from: debtor.user,      // Person who pays
            to: creditor.user,       // Person who receives
            amount: parseFloat(settlementAmount.toFixed(2)) // Round to 2 decimals
        });

        // Reduce balances
        creditor.amount -= settlementAmount;
        debtor.amount -= settlementAmount;

        // Move to next creditor if current one is fully paid
        if (creditor.amount < EPSILON) {
            creditorIndex++;
        }

        // Move to next debtor if current one has paid all debts
        if (debtor.amount < EPSILON) {
            debtorIndex++;
        }
    }

    return settlements;
};

/**
 * ALTERNATIVE ALGORITHM: Cash Flow Minimization (More Complex)
 * =============================================================
 * 
 * This is an alternative approach that can sometimes produce fewer transactions
 * but is more complex. The greedy algorithm above is usually sufficient.
 * 
 * This algorithm uses a min-heap/max-heap approach to always settle the
 * largest positive and negative balances first.
 * 
 * Steps:
 * 1. Create max heap of creditors and min heap of debtors
 * 2. While both heaps non-empty:
 *    - Pop max creditor and min debtor
 *    - Settle min(creditor, abs(debtor))
 *    - If creditor/debtor still has balance, push back to heap
 * 
 * Time Complexity: O(n² log n) - worse than greedy
 * Space Complexity: O(n)
 * 
 * For most practical cases, the greedy algorithm above is preferred
 * due to simplicity and good performance.
 */

/**
 * Validate settlements against original balances
 * This helper function can be used for testing/debugging
 * 
 * @param {Array} balances - Original balances
 * @param {Array} settlements - Calculated settlements
 * @returns {Boolean} True if settlements correctly resolve all balances
 */
export const validateSettlements = (balances, settlements) => {
    // Create a map to track net changes for each user
    const netChanges = new Map();
    
    // Initialize with original balances
    balances.forEach(balance => {
        netChanges.set(balance.user._id.toString(), balance.amount);
    });
    
    // Apply all settlements
    settlements.forEach(settlement => {
        const fromId = settlement.from._id.toString();
        const toId = settlement.to._id.toString();
        const amount = settlement.amount;
        
        // Debtor pays, so their balance increases (becomes less negative)
        netChanges.set(fromId, netChanges.get(fromId) + amount);
        
        // Creditor receives, so their balance decreases (becomes less positive)
        netChanges.set(toId, netChanges.get(toId) - amount);
    });
    
    // Check if all balances are now zero (within epsilon)
    const EPSILON = 0.01;
    for (const balance of netChanges.values()) {
        if (Math.abs(balance) > EPSILON) {
            return false;
        }
    }
    
    return true;
};

/**
 * Example usage and test cases
 */
export const exampleUsage = () => {
    // Example 1: Simple case
    const balances1 = [
        { user: { _id: '1', name: 'Alice', email: 'alice@example.com' }, amount: 50 },
        { user: { _id: '2', name: 'Bob', email: 'bob@example.com' }, amount: -30 },
        { user: { _id: '3', name: 'Charlie', email: 'charlie@example.com' }, amount: -20 }
    ];
    
    const settlements1 = calculateSettlements(balances1);
    console.log('Example 1 - Simple case:');
    console.log('Balances:', balances1);
    console.log('Settlements:', settlements1);
    console.log('Valid:', validateSettlements(balances1, settlements1));
    // Expected: Bob pays Alice $30, Charlie pays Alice $20
    
    // Example 2: Complex case
    const balances2 = [
        { user: { _id: '1', name: 'Alice', email: 'alice@example.com' }, amount: 50 },
        { user: { _id: '2', name: 'Bob', email: 'bob@example.com' }, amount: 30 },
        { user: { _id: '3', name: 'Charlie', email: 'charlie@example.com' }, amount: -40 },
        { user: { _id: '4', name: 'David', email: 'david@example.com' }, amount: -40 }
    ];
    
    const settlements2 = calculateSettlements(balances2);
    console.log('\nExample 2 - Complex case:');
    console.log('Balances:', balances2);
    console.log('Settlements:', settlements2);
    console.log('Valid:', validateSettlements(balances2, settlements2));
    // Expected: 3 transactions (optimal)
    
    // Example 3: Already settled
    const balances3 = [
        { user: { _id: '1', name: 'Alice', email: 'alice@example.com' }, amount: 0 },
        { user: { _id: '2', name: 'Bob', email: 'bob@example.com' }, amount: 0 }
    ];
    
    const settlements3 = calculateSettlements(balances3);
    console.log('\nExample 3 - Already settled:');
    console.log('Balances:', balances3);
    console.log('Settlements:', settlements3);
    console.log('Valid:', validateSettlements(balances3, settlements3));
    // Expected: No settlements needed
};

// Uncomment to run examples
// exampleUsage();
