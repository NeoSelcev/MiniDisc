import React from 'react';

const DimensionCard = ({ 
  title, 
  widthValue, 
  heightValue, 
  onWidthChange, 
  onHeightChange,
  widthDisabled = false,
  heightDisabled = false,
  widthHint = null,
  heightHint = null,
  min = 5,
  max = 200,
  step = 0.1
}) => {
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded p-4">
      <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">{title}</h4>
      <div className="space-y-2">
        <label className="block text-sm text-gray-700 dark:text-gray-300">
          Width (mm) {widthHint && <span className="text-gray-500 dark:text-gray-400 text-xs">{widthHint}</span>}
          <input
            type="number"
            value={widthValue || ''}
            onChange={onWidthChange}
            disabled={widthDisabled}
            className={`mt-1 input-field w-full ${widthDisabled ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}
            min={min}
            max={max}
            step={step}
          />
        </label>
        <label className="block text-sm text-gray-700 dark:text-gray-300">
          Height (mm) {heightHint && <span className="text-gray-500 dark:text-gray-400 text-xs">{heightHint}</span>}
          <input
            type="number"
            value={heightValue || ''}
            onChange={onHeightChange}
            disabled={heightDisabled}
            className={`mt-1 input-field w-full ${heightDisabled ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}
            min={min}
            max={max}
            step={step}
          />
        </label>
      </div>
    </div>
  );
};

export default DimensionCard;
