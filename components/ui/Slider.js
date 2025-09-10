// components/ui/Slider.js
'use client';

export function Slider({ label, value, min, max, step, onChange, disabled, defaultValue = 0 }) {
  const handleReset = () => {
    onChange(defaultValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{value}</span>
          {value !== defaultValue && (
            <button
              onClick={handleReset}
              className="text-xs text-blue-600 hover:text-blue-800"
              title="Reset to default"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>Default: {defaultValue}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}