"use client";

import React from 'react';

interface CheckpointModalProps {
  isOpen: boolean;
  onApprove: () => void;
  onDeny: () => void;
  title: string;
  children: React.ReactNode;
}

const CheckpointModal: React.FC<CheckpointModalProps> = ({ isOpen, onApprove, onDeny, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="mb-6">{children}</div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onDeny}
            className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            Deny
          </button>
          <button
            onClick={onApprove}
            className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckpointModal;
