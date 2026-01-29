"use client";

import React from 'react';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewUrl: string;
}

const LivePreviewModal: React.FC<LivePreviewModalProps> = ({ isOpen, onClose, previewUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-4xl h-3/4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Live Preview</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
          {previewUrl ? (
            <iframe src={previewUrl} className="w-full h-full" title="Live Project Preview" />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-500">
              No preview URL available.
            </div>
          )}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Viewing: <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{previewUrl || 'N/A'}</a>
        </div>
      </div>
    </div>
  );
};

export default LivePreviewModal;
