import React from 'react';

const FilterPanel = ({ 
  filters, 
  onFilterChange,
  onClearFilters,
  filterOptions
}) => {
  return (
    <div className="filter-panel">
      <h3>Filters</h3>
      {filterOptions.map(option => {
        switch (option.type) {
          case 'text':
            return (
              <input
                key={option.name}
                type="text"
                placeholder={option.placeholder}
                value={filters[option.name] || ''}
                onChange={e => onFilterChange(option.name, e.target.value)}
              />
            );
          case 'number':
            return (
              <input
                key={option.name}
                type="number"
                placeholder={option.placeholder}
                value={filters[option.name] || ''}
                onChange={e => onFilterChange(option.name, e.target.value)}
              />
            );
          case 'checkbox':
            return (
              <label key={option.name} className="styled-checkbox">
                <input
                  type="checkbox"
                  checked={filters[option.name] || false}
                  onChange={e => onFilterChange(option.name, e.target.checked)}
                />
                {option.label}
              </label>
            );
          default:
            return null;
        }
      })}
      <button className="clear-filters" onClick={onClearFilters}>
        Clear Filters
      </button>
    </div>
  );
};

export default FilterPanel;