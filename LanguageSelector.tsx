import React from 'react';
import { LANGUAGES } from '../constants';
import type { Language } from '../types';

interface LanguageSelectorProps {
  id: string;
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ id, label, value, onChange, multiple = false, className = '', disabled = false }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (multiple) {
      // FIX: Use `e.target.selectedOptions` to get selected values directly.
      // This is more efficient and resolves TypeScript errors caused by incorrect type inference on the option elements.
      const selectedValues = Array.from(e.target.selectedOptions).map(o => o.value);
      onChange(selectedValues);
    } else {
      onChange(e.target.value);
    }
  };
  
  const selectSize = multiple ? Math.min(LANGUAGES.length, 5) : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-2">
        {label}
      </label>
      <select
        id={id}
        multiple={multiple}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        size={selectSize}
        className="block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-200 py-2 px-3 disabled:opacity-50"
      >
        {!multiple && <option value="">Select language...</option>}
        {LANGUAGES.map((lang: Language) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;