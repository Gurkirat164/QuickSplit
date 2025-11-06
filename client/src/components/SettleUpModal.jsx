import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, ArrowRight, CheckCircle } from "lucide-react";
import toast from 'react-hot-toast';
import { closeModal } from "../store/slices/uiSlice";
import { settleUp } from "../store/slices/groupSlice";
import { formatCurrency, simplifyDebts } from "../utils/helpers";

const SettleUpModal = () => {
    const dispatch = useDispatch();
    const { modals } = useSelector((state) => state.ui);
    const { currentGroup } = useSelector((state) => state.groups);
    const { user } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(false);
    const [selectedSettlement, setSelectedSettlement] = useState(null);

    // Calculate settlements from current group members
    const currentGroupBalances = currentGroup?.members?.map(member => ({
        user: {
            _id: member._id,
            name: member.name,
            email: member.email
        },
        amount: member.balance
    })) || [];

    const settlements = simplifyDebts(currentGroupBalances);

    // Filter settlements involving the current user
    const userSettlements = settlements.filter(
        s => s.from._id === user._id || s.to._id === user._id
    );

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (modals.settleUp) {
            document.body.style.overflow = "hidden";
            setSelectedSettlement(null);
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [modals.settleUp]);

    const handleClose = () => {
        setSelectedSettlement(null);
        dispatch(closeModal("settleUp"));
    };

    const handleSettleUp = async (settlement) => {
        setLoading(true);
        try {
            if (!currentGroup) {
                throw new Error("No group selected");
            }

            await dispatch(
                settleUp({
                    groupId: currentGroup._id,
                    payerId: settlement.from._id,
                    receiverId: settlement.to._id,
                    amount: settlement.amount
                })
            ).unwrap();

            toast.success('Settlement recorded successfully!');
            handleClose();
        } catch (err) {
            toast.error(err.message || "Failed to settle up");
            console.error("Failed to settle up:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!modals.settleUp) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto">
                <div 
                    className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 my-8 animate-fadeIn max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Settle Up</h2>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        {settlements.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-gray-900 mb-2">All Settled!</p>
                                <p className="text-gray-600">Everyone is settled up in this group.</p>
                            </div>
                        ) : userSettlements.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-gray-900 mb-2">You're Settled!</p>
                                <p className="text-gray-600">You don't have any pending settlements.</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-600">
                                    Select a settlement to record the payment:
                                </p>

                                <div className="space-y-3">
                                    {userSettlements.map((settlement, index) => {
                                        const isUserPayer = settlement.from._id === user._id;
                                        const otherPerson = isUserPayer ? settlement.to : settlement.from;

                                        return (
                                            <div
                                                key={index}
                                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                                    selectedSettlement === index
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                }`}
                                                onClick={() => setSelectedSettlement(index)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                                                            isUserPayer ? 'bg-red-500' : 'bg-green-500'
                                                        }`}>
                                                            {otherPerson.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-semibold text-gray-900">
                                                                    {isUserPayer ? 'You' : otherPerson.name}
                                                                </span>
                                                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                                                <span className="font-semibold text-gray-900">
                                                                    {isUserPayer ? otherPerson.name : 'You'}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {isUserPayer
                                                                    ? `You pay ${otherPerson.name}`
                                                                    : `${otherPerson.name} pays you`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-lg font-bold ${
                                                            isUserPayer ? 'text-red-600' : 'text-green-600'
                                                        }`}>
                                                            {formatCurrency(settlement.amount, currentGroup.baseCurrency)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {userSettlements.length > 0 && (
                        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (selectedSettlement !== null) {
                                        handleSettleUp(userSettlements[selectedSettlement]);
                                    } else {
                                        toast.error('Please select a settlement');
                                    }
                                }}
                                disabled={loading || selectedSettlement === null}
                                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Recording...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Record Payment</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettleUpModal;
