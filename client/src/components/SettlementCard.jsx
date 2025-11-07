/**
 * SettlementCard Component
 * ========================
 * 
 * Displays a single settlement transaction in a visually appealing card format.
 */

import { ArrowRight, User } from 'lucide-react';
import { formatCurrency, getUserInitials, getRandomColor } from '../utils/helpers';

const SettlementCard = ({ 
  settlement, 
  currency = 'USD',
  isSelected = false,
  onClick = null,
  showDescription = true,
  compact = false,
}) => {
  const { from, to, amount, isUserPayer, isUserReceiver, isUserInvolved, displayText } = settlement;

  const getCardStyle = () => {
    if (!isUserInvolved) {
      return 'border-gray-200 bg-gray-50 opacity-75';
    }
    if (isSelected) {
      return 'border-blue-500 bg-blue-50 shadow-md';
    }
    return 'border-gray-200 hover:border-blue-300 hover:shadow-sm';
  };

  const getAmountColor = () => {
    if (!isUserInvolved) return 'text-gray-600';
    if (isUserPayer) return 'text-red-600';
    if (isUserReceiver) return 'text-green-600';
    return 'text-gray-600';
  };

  const getAvatarColor = (userName) => {
    return getRandomColor(userName);
  };

  return (
    <div
      className={`
        border-2 rounded-lg p-4 transition-all cursor-pointer
        ${getCardStyle()}
        ${!isUserInvolved && 'cursor-not-allowed'}
      `}
      onClick={() => isUserInvolved && onClick && onClick(settlement)}
    >
      <div className={`flex items-center justify-between ${compact ? 'gap-2' : 'gap-4'}`}>
        {/* From User Avatar and Name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
            style={{ backgroundColor: getAvatarColor(from.name) }}
          >
            {getUserInitials(from.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {isUserPayer ? 'You' : from.name}
            </p>
            {!compact && (
              <p className="text-xs text-gray-500 truncate">{from.email}</p>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="shrink-0">
          <ArrowRight className={`w-5 h-5 ${isUserInvolved ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>

        {/* To User Avatar and Name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
            style={{ backgroundColor: getAvatarColor(to.name) }}
          >
            {getUserInitials(to.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {isUserReceiver ? 'You' : to.name}
            </p>
            {!compact && (
              <p className="text-xs text-gray-500 truncate">{to.email}</p>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <p className={`text-lg font-bold ${getAmountColor()}`}>
            {formatCurrency(amount, currency)}
          </p>
        </div>
      </div>

      {/* Description */}
      {showDescription && displayText && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {displayText}
          </p>
          {!isUserInvolved && (
            <p className="text-xs text-gray-500 mt-1">
              (Not involving you)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SettlementCard;
