// Toolbar.js
export default function Toolbar({
  onDownload,
  onReset,
  onApplyAI,
  onApplyAdjustments,
  isLoading,
  hasImage,
  isAIEnhanced
}) {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <button
        onClick={onDownload}
        disabled={!hasImage || isLoading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Download'}
      </button>
      
      <button
        onClick={onReset}
        disabled={!hasImage || isLoading}
        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Reset
      </button>
      
      <button
        onClick={onApplyAI}
        disabled={!hasImage || isLoading}
        className={`px-6 py-3 rounded-lg font-semibold ${
          isAIEnhanced 
            ? 'bg-purple-700 text-white shadow-lg' 
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
        } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300`}
      >
        {isLoading ? 'Enhancing...' : '✨ AI Enhance'}
      </button>
      
      <button
        onClick={onApplyAdjustments}
        disabled={!hasImage || isLoading}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Apply Adjustments
      </button>
    </div>
  );
}