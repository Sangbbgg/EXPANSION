import React from 'react';

interface LiveLogViewerProps {
  logs: string[];
}

const LiveLogViewer: React.FC<LiveLogViewerProps> = ({ logs }) => {
  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md font-mono text-sm h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2">Live Terminal Output</h2>
      {logs.length === 0 ? (
        <p className="text-gray-400">Waiting for logs...</p>
      ) : (
        logs.map((log, index) => (
          <p key={index} className={
            log.startsWith('[INFO]') ? 'text-blue-300' :
            log.startsWith('[SUCCESS]') ? 'text-green-300' :
            log.startsWith('[WARNING]') ? 'text-yellow-300' :
            log.startsWith('[ERROR]') ? 'text-red-300' :
            'text-gray-200'
          }>
            {log}
          </p>
        ))
      )}
    </div>
  );
};

export default LiveLogViewer;