import React from "react";
import { X, AlertTriangle } from "lucide-react";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, imageName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                {/* Warning Icon */}
                <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-red-100 p-3">
                        <AlertTriangle className="text-red-600" size={32} />
                    </div>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-center text-2xl font-bold text-gray-800">
                    Delete Image?
                </h3>

                {/* Message */}
                <p className="mb-6 text-center text-gray-600">
                    Are you sure you want to delete this image? This action cannot be undone.
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:from-red-600 hover:to-red-700 hover:shadow-xl"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
