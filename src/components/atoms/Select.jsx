import { forwardRef } from 'react'

const Select = forwardRef(({ 
  label,
  error,
  options = [],
  placeholder = 'Select option...',
  className = '',
  containerClassName = '',
  ...props 
}, ref) => {
  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <select
        ref={ref}
        className={`
          block w-full rounded-md border-gray-300 shadow-sm
          focus:border-primary focus:ring-primary focus:ring-1
          px-3 py-2
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select