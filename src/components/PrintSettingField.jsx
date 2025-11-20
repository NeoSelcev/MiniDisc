import React from 'react';

const PrintSettingField = ({ 
  label, 
  value, 
  onChange,
  min = 0,
  max = 1000,
  step = 1,
  type = 'number'
}) => {
  return (
    <label className="block text-sm text-gray-700 dark:text-gray-300">
      {label}
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        className="mt-1 input-field w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        min={min}
        max={max}
        step={step}
      />
    </label>
  );
};

export default PrintSettingField;
