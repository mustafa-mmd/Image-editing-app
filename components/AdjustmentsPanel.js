
// components/AdjustmentsPanel.js
'use client';

import { useState } from 'react';
import { Slider } from './ui/Slider';
import { Palette } from 'lucide-react';

const backgroundColors = [
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#ff0000' },
  { name: 'Green', value: '#00ff00' },
  { name: 'Blue', value: '#0000ff' },
  { name: 'Yellow', value: '#ffff00' },
  { name: 'Cyan', value: '#00ffff' },
  { name: 'Magenta', value: '#ff00ff' },
  { name: 'Gray', value: '#808080' },
  { name: 'Transparent', value: 'transparent' },
];

export default function AdjustmentsPanel({
  adjustments,
  onAdjustmentsChange,
  onBackgroundRemove,
  onBackgroundReplace,
  onFormatChange,
  isLoading,
}) {
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [customColor, setCustomColor] = useState('#ff0000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'advanced', 'background'

  const handleColorSelect = (colorValue) => {
    setSelectedColor(colorValue);
    onBackgroundReplace(colorValue);
  };

  const handleCustomColorChange = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    setSelectedColor(color);
    onBackgroundReplace(color);
  };

  const handleColorPickerClick = () => {
    setShowColorPicker(!showColorPicker);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Adjustments</h3>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('basic')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'basic' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Basic
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'advanced' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Advanced
        </button>
        <button
          onClick={() => setActiveTab('background')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'background' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Background
        </button>
      </div>

      {/* Basic Adjustments */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          <Slider
            label="Brightness"
            value={adjustments.brightness}
            min={-100}
            max={100}
            step={1}
            onChange={(value) => onAdjustmentsChange({ brightness: value })}
            disabled={isLoading}
          />
          
          <Slider
            label="Contrast"
            value={adjustments.contrast}
            min={-100}
            max={100}
            step={1}
            onChange={(value) => onAdjustmentsChange({ contrast: value })}
            disabled={isLoading}
          />
          
          <Slider
            label="Saturation"
            value={adjustments.saturation}
            min={-100}
            max={100}
            step={1}
            onChange={(value) => onAdjustmentsChange({ saturation: value })}
            disabled={isLoading}
          />
          
          <Slider
            label="Exposure"
            value={adjustments.exposure}
            min={-100}
            max={100}
            step={1}
            onChange={(value) => onAdjustmentsChange({ exposure: value })}
            disabled={isLoading}
          />
          
          <Slider
            label="Sharpness"
            value={adjustments.sharpness}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onAdjustmentsChange({ sharpness: value })}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Advanced Adjustments */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          <Slider
            label="Blur"
            value={adjustments.blur}
            min={0}
            max={20}
            step={0.5}
            onChange={(value) => onAdjustmentsChange({ blur: value })}
            disabled={isLoading}
          />
          
          <Slider
            label="Hue"
            value={adjustments.hue}
            min={-180}
            max={180}
            step={1}
            onChange={(value) => onAdjustmentsChange({ hue: value })}
            disabled={isLoading}
          />
          
          <Slider
            label="Opacity"
            value={adjustments.opacity}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onAdjustmentsChange({ opacity: value })}
            disabled={isLoading}
          />
          
          <Slider
            label="Zoom"
            value={adjustments.zoom}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onAdjustmentsChange({ zoom: value })}
            disabled={isLoading}
          />
          
          <Slider
            label="Temperature"
            value={adjustments.temperature}
            min={-100}
            max={100}
            step={1}
            onChange={(value) => onAdjustmentsChange({ temperature: value })}
            disabled={isLoading}
          />
          
          <Slider
            label="Vignette"
            value={adjustments.vignette}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onAdjustmentsChange({ vignette: value })}
            disabled={isLoading}
          />
          


        </div>
      )}

      {/* Background Tab */}
      {activeTab === 'background' && (
        <div className="space-y-4">
          <button
            onClick={onBackgroundRemove}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Remove Background
          </button>
          
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">Solid Colors</h5>
            <div className="grid grid-cols-5 gap-2">
              {backgroundColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorSelect(color.value)}
                  disabled={isLoading}
                  className={`w-8 h-8 rounded border-2 hover:border-gray-400 disabled:opacity-50 transition-all ${
                    selectedColor === color.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-gray-700">Custom Color</h5>
              <button
                onClick={handleColorPickerClick}
                disabled={isLoading}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                title="Color picker"
              >
                <Palette className="w-4 h-4" />
              </button>
            </div>
            
            {showColorPicker && (
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  disabled={isLoading}
                  className="w-10 h-10 p-0 border border-gray-300 rounded cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setSelectedColor(e.target.value);
                    onBackgroundReplace(e.target.value);
                  }}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  placeholder="#FF0000"
                />
              </div>
            )}
            
            {!showColorPicker && (
              <button
                onClick={() => handleColorSelect(customColor)}
                disabled={isLoading}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center"
                style={{ backgroundColor: customColor, color: '#ffffff' }}
              >
                Use Custom Color
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Format</h4>
        <select
          onChange={(e) => onFormatChange(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        >
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="webp">WEBP</option>
          <option value="avif">AVIF</option>
          <option value="tiff">TIFF</option>
        </select>
      </div>
    </div>
  );
}





