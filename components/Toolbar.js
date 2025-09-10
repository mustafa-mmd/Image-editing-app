// // components/Toolbar.js - Simplified version
// 'use client';

// import { Download, RotateCcw, Sparkles } from 'lucide-react';

// export default function Toolbar({ onDownload, onReset, onApplyAI, isLoading, hasImage }) {
//   return (
//     <div className="flex items-center justify-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
//       <button
//         onClick={onDownload}
//         disabled={!hasImage || isLoading}
//         className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//       >
//         <Download className="w-5 h-5" />
//         <span>Download</span>
//       </button>

//       <button
//         onClick={onReset}
//         disabled={!hasImage || isLoading}
//         className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//       >
//         <RotateCcw className="w-5 h-5" />
//         <span>Reset</span>
//       </button>

//       <button
//         onClick={onApplyAI}
//         disabled={!hasImage || isLoading}
//         className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//       >
//         <Sparkles className="w-5 h-5" />
//         <span>AI Enhance</span>
//       </button>
//     </div>
//   );
// }



// components/Toolbar.js - Enhanced reset functionality
'use client';

import { Download, RotateCcw, Sparkles } from 'lucide-react';

export default function Toolbar({ onDownload, onReset, onApplyAI, isLoading, hasImage }) {
  return (
    <div className="flex items-center justify-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
      <button
        onClick={onDownload}
        disabled={!hasImage || isLoading}
        className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="w-5 h-5" />
        <span>Download</span>
      </button>

      <button
        onClick={onReset}
        disabled={!hasImage || isLoading}
        className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative group"
        title="Reset all adjustments to default"
      >
        <RotateCcw className="w-5 h-5" />
        <span>Reset</span>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Reset all adjustments to default
        </div>
      </button>

      <button
        onClick={onApplyAI}
        disabled={!hasImage || isLoading}
        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Sparkles className="w-5 h-5" />
        <span>AI Enhance</span>
      </button>
    </div>
  );
}