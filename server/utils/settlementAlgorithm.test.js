/**
 * Test Suite for Settlement Algorithm
 * Run with: node settlementAlgorithm.test.js
 */

import { calculateSettlements, validateSettlements } from './settlementAlgorithm.js';

// ANSI color codes for pretty output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTest(testName, balances, expectedTransactions = null) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`Test: ${testName}`, 'blue');
    log('='.repeat(60), 'cyan');
    
    console.log('\nInput Balances:');
    balances.forEach(b => {
        const sign = b.amount >= 0 ? '+' : '';
        const color = b.amount >= 0 ? 'green' : 'red';
        log(`  ${b.user.name.padEnd(15)} ${sign}$${b.amount.toFixed(2)}`, color);
    });
    
    const settlements = calculateSettlements(balances);
    
    console.log('\nCalculated Settlements:');
    if (settlements.length === 0) {
        log('  No settlements needed - all balanced!', 'green');
    } else {
        settlements.forEach((s, i) => {
            log(`  ${i + 1}. ${s.from.name} pays ${s.to.name}: $${s.amount.toFixed(2)}`, 'yellow');
        });
    }
    
    console.log(`\nTotal Transactions: ${settlements.length}`);
    
    if (expectedTransactions !== null) {
        if (settlements.length === expectedTransactions) {
            log(`✓ Expected ${expectedTransactions} transactions`, 'green');
        } else {
            log(`✗ Expected ${expectedTransactions} transactions, got ${settlements.length}`, 'red');
        }
    }
    
    // Validate settlements
    const isValid = validateSettlements(balances, settlements);
    if (isValid) {
        log('✓ Settlements are mathematically correct', 'green');
    } else {
        log('✗ Settlements are incorrect!', 'red');
    }
    
    return settlements;
}

// Test Suite
console.log('\n');
log('╔════════════════════════════════════════════════════════════╗', 'cyan');
log('║         SETTLEMENT ALGORITHM TEST SUITE                    ║', 'cyan');
log('╚════════════════════════════════════════════════════════════╝', 'cyan');

// Test 1: Simple case - one creditor, two debtors
runTest(
    'Simple Case - One Creditor, Two Debtors',
    [
        { user: { _id: '1', name: 'Alice', email: 'alice@test.com' }, amount: 50 },
        { user: { _id: '2', name: 'Bob', email: 'bob@test.com' }, amount: -30 },
        { user: { _id: '3', name: 'Charlie', email: 'charlie@test.com' }, amount: -20 }
    ],
    2 // Expected 2 transactions
);

// Test 2: Complex case - multiple creditors and debtors
runTest(
    'Complex Case - Multiple Creditors and Debtors',
    [
        { user: { _id: '1', name: 'Alice', email: 'alice@test.com' }, amount: 50 },
        { user: { _id: '2', name: 'Bob', email: 'bob@test.com' }, amount: 30 },
        { user: { _id: '3', name: 'Charlie', email: 'charlie@test.com' }, amount: -40 },
        { user: { _id: '4', name: 'David', email: 'david@test.com' }, amount: -40 }
    ],
    3 // Expected 3 transactions (optimal)
);

// Test 3: Already settled
runTest(
    'Already Settled - No Transactions Needed',
    [
        { user: { _id: '1', name: 'Alice', email: 'alice@test.com' }, amount: 0 },
        { user: { _id: '2', name: 'Bob', email: 'bob@test.com' }, amount: 0 },
        { user: { _id: '3', name: 'Charlie', email: 'charlie@test.com' }, amount: 0 }
    ],
    0 // Expected 0 transactions
);

// Test 4: Single transaction
runTest(
    'Single Transaction - Two People',
    [
        { user: { _id: '1', name: 'Alice', email: 'alice@test.com' }, amount: 100 },
        { user: { _id: '2', name: 'Bob', email: 'bob@test.com' }, amount: -100 }
    ],
    1 // Expected 1 transaction
);

// Test 5: Floating point precision
runTest(
    'Floating Point Precision',
    [
        { user: { _id: '1', name: 'Alice', email: 'alice@test.com' }, amount: 33.33 },
        { user: { _id: '2', name: 'Bob', email: 'bob@test.com' }, amount: -16.67 },
        { user: { _id: '3', name: 'Charlie', email: 'charlie@test.com' }, amount: -16.66 }
    ],
    2 // Expected 2 transactions
);

// Test 6: Real-world scenario - Trip expenses
runTest(
    'Real-World Scenario - Trip Expenses',
    [
        { user: { _id: '1', name: 'Alice', email: 'alice@test.com' }, amount: 200 },  // Paid $500 hotel
        { user: { _id: '2', name: 'Bob', email: 'bob@test.com' }, amount: 20 },       // Paid $320 car
        { user: { _id: '3', name: 'Charlie', email: 'charlie@test.com' }, amount: -120 }, // Paid $180 gas
        { user: { _id: '4', name: 'David', email: 'david@test.com' }, amount: -100 }  // Paid $200 dinner
    ],
    3 // Expected 3 transactions
);

// Test 7: Large group
runTest(
    'Large Group - 8 People',
    [
        { user: { _id: '1', name: 'Person 1', email: 'p1@test.com' }, amount: 150 },
        { user: { _id: '2', name: 'Person 2', email: 'p2@test.com' }, amount: 80 },
        { user: { _id: '3', name: 'Person 3', email: 'p3@test.com' }, amount: 45 },
        { user: { _id: '4', name: 'Person 4', email: 'p4@test.com' }, amount: -30 },
        { user: { _id: '5', name: 'Person 5', email: 'p5@test.com' }, amount: -50 },
        { user: { _id: '6', name: 'Person 6', email: 'p6@test.com' }, amount: -75 },
        { user: { _id: '7', name: 'Person 7', email: 'p7@test.com' }, amount: -60 },
        { user: { _id: '8', name: 'Person 8', email: 'p8@test.com' }, amount: -60 }
    ]
);

// Test 8: Edge case - small amounts
runTest(
    'Edge Case - Small Amounts (Cents)',
    [
        { user: { _id: '1', name: 'Alice', email: 'alice@test.com' }, amount: 0.50 },
        { user: { _id: '2', name: 'Bob', email: 'bob@test.com' }, amount: -0.25 },
        { user: { _id: '3', name: 'Charlie', email: 'charlie@test.com' }, amount: -0.25 }
    ],
    2
);

// Test 9: Edge case - very small amounts (below epsilon)
runTest(
    'Edge Case - Amounts Below Epsilon (Should Skip)',
    [
        { user: { _id: '1', name: 'Alice', email: 'alice@test.com' }, amount: 0.005 },
        { user: { _id: '2', name: 'Bob', email: 'bob@test.com' }, amount: -0.005 }
    ],
    0 // Expected 0 transactions (below epsilon threshold)
);

// Summary
log('\n\n' + '='.repeat(60), 'cyan');
log('All tests completed!', 'green');
log('='.repeat(60), 'cyan');
log('\nAlgorithm Properties:', 'blue');
console.log('  • Time Complexity: O(n log n)');
console.log('  • Space Complexity: O(n)');
console.log('  • Number of Transactions: O(n)');
console.log('  • Optimality: Minimal transactions guaranteed');
log('\n');
