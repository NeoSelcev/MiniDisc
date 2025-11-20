import React from 'react';

const Checkbox = ({ 
  checked, 
  onChange, 
  label,
  bold = false,
  italic = false,
  underline = false,
  className = ''
}) => {
  const textStyles = [
    bold && 'font-bold',
    italic && 'italic',
    underline && 'underline'
  ].filter(Boolean).join(' ');

  // Determine if this is a small checkbox (text-xs in className)
  const isSmall = className.includes('text-xs');
  const textSize = isSmall ? 'text-xs' : 'text-sm';

  return (
    <label className={`flex items-center cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={isSmall ? 'mr-1' : 'mr-2'}
      />
      <span className={`${textSize} text-gray-700 dark:text-gray-300 ${textStyles}`}>
        {label}
      </span>
    </label>
  );
};

export default Checkbox;
