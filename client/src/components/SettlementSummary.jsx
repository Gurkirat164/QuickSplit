/**
 * SettlementSummary Component
 * ===========================
 * 
 * Displays a summary overview of settlements in a group.
 */

import { TrendingUp, TrendingDown, Users, ArrowRightLeft } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { useSettlements } from '../hooks/useSettlements';

const SettlementSummary = ({ groupId, currency = 'USD' }) => {
  const { stats, userSettlements, hasSettlements, minimumTransactions } = useSettlements(groupId);

  if (!hasSettlements) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900">All Settled!</h3>
            <p className="text-sm text-green-700">Everyone is balanced in this group.</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: ArrowRightLeft,
      label: 'Total Transactions',
      value: stats.totalTransactions,
      subtext: `Min. needed: ${minimumTransactions}`,
      color: 'blue',
    },
    {
      icon: TrendingUp,
      label: 'You Receive',
      value: formatCurrency(userSettlements.totalToReceive, currency),
      subtext: `${userSettlements.toReceive.length} payment(s)`,
      color: 'green',
    },
    {
      icon: TrendingDown,
      label: 'You Pay',
      value: formatCurrency(userSettlements.totalToPay, currency),
      subtext: `${userSettlements.toPay.length} payment(s)`,
      color: 'red',
    },
    {
      icon: Users,
      label: 'Participants',
      value: stats.uniqueParticipants,
      subtext: 'people involved',
      color: 'purple',
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-900',
      subtext: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-900',
      subtext: 'text-green-600',
    },
    red: {
      bg: 'bg-red-50',
      icon: 'bg-red-100 text-red-600',
      text: 'text-red-900',
      subtext: 'text-red-600',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-purple-100 text-purple-600',
      text: 'text-purple-900',
      subtext: 'text-purple-600',
    },
  };

  return (
    <div className="space-y-4">
      {/* Net Amount Summary */}
      {userSettlements.netAmount !== 0 && (
        <div className={`
          border-2 rounded-lg p-4
          ${userSettlements.netAmount > 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
          }
        `}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Your Net Balance</p>
              <p className={`text-2xl font-bold ${
                userSettlements.netAmount > 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {formatCurrency(Math.abs(userSettlements.netAmount), currency)}
              </p>
            </div>
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center
              ${userSettlements.netAmount > 0 ? 'bg-green-100' : 'bg-red-100'}
            `}>
              {userSettlements.netAmount > 0 
                ? <TrendingUp className="w-8 h-8 text-green-600" />
                : <TrendingDown className="w-8 h-8 text-red-600" />
              }
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {userSettlements.netAmount > 0 
              ? 'You are owed this amount overall'
              : 'You owe this amount overall'
            }
          </p>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const colors = colorClasses[stat.color];
          const Icon = stat.icon;
          
          return (
            <div
              key={index}
              className={`${colors.bg} border border-gray-200 rounded-lg p-4`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {stat.label}
                </p>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colors.icon}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${colors.text} mb-1`}>
                {stat.value}
              </p>
              <p className={`text-xs ${colors.subtext}`}>
                {stat.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Optimization Info */}
      {stats.totalTransactions > minimumTransactions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This could be optimized to {minimumTransactions} transaction(s), 
            but current settlements show {stats.totalTransactions} transaction(s).
          </p>
        </div>
      )}

      {stats.totalTransactions === minimumTransactions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            ✓ <strong>Optimized:</strong> Using minimum number of transactions ({minimumTransactions}).
          </p>
        </div>
      )}
    </div>
  );
};

export default SettlementSummary;
