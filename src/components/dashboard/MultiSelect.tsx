import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ChevronDown, X, Search, MapPin } from 'lucide-react';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export default function MultiSelect({ options, selected, onChange, placeholder = "Select options" }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    let newSelected;
    if (option === 'All') {
      newSelected = ['All'];
    } else {
      if (selected.includes('All')) {
        newSelected = [option];
      } else {
        if (selected.includes(option)) {
           newSelected = selected.filter(s => s !== option);
           if (newSelected.length === 0) newSelected = ['All'];
        } else {
           newSelected = [...selected, option];
        }
      }
    }
    onChange(newSelected);
  };

  const removeChip = (e: React.MouseEvent, option: string) => {
    e.stopPropagation();
    const newSelected = selected.filter(s => s !== option);
    onChange(newSelected.length === 0 ? ['All'] : newSelected);
  };

  const filteredOptions = useMemo(() => options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  ), [options, searchTerm]);

  return (
    <div className="relative group" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
            w-full border rounded-lg p-2 flex justify-between items-center cursor-pointer 
            bg-white min-h-[44px] transition-all duration-200
            ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'}
        `}
      >
        <div className="flex flex-wrap gap-1.5 overflow-hidden text-sm w-full pr-2">
            {selected.includes('All') ? (
                <span className="text-gray-600 font-medium px-1 flex items-center gap-1">
                    <MapPin size={14} className="text-blue-500" />
                    All Cities
                </span>
            ) : (
                selected.map(city => (
                    <span 
                        key={city}
                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-100"
                    >
                        {city}
                        <X 
                            size={12} 
                            className="cursor-pointer hover:text-blue-900 hover:bg-blue-100 rounded-full"
                            onClick={(e) => removeChip(e, city)}
                        />
                    </span>
                ))
            )}
            {!selected.includes('All') && selected.length === 0 && (
                <span className="text-gray-400">{placeholder}</span>
            )}
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-lg shadow-xl max-h-80 flex flex-col animate-in fade-in zoom-in-95 duration-150 origin-top">
          <div className="p-3 border-b border-gray-50">
            <div className="flex items-center bg-gray-50 rounded-md px-3 py-1.5 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-colors">
                <Search size={14} className="text-gray-400" />
                <input 
                    type="text"
                    className="w-full bg-transparent p-1 text-sm focus:outline-none placeholder:text-gray-400"
                    placeholder="Search cities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
             <div 
                className={`
                    flex items-center gap-3 p-2.5 mx-1 my-0.5 hover:bg-blue-50 cursor-pointer rounded-md text-sm transition-colors
                    ${selected.includes('All') ? 'bg-blue-50/80 text-blue-700 font-semibold' : 'text-gray-700'}
                `}
                onClick={() => toggleOption('All')}
             >
                <div className={`w-5 h-5 border rounded flex items-center justify-center transition-all ${selected.includes('All') ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                    {selected.includes('All') && <Check size={14} className="text-white" />}
                </div>
                <span>Select All Cities</span>
             </div>
             
             {filteredOptions.length > 0 && <div className="h-px bg-gray-100 my-1 mx-2"></div>}
             
             {filteredOptions.map(option => {
               const isSelected = selected.includes(option);
               return (
                   <div 
                     key={option}
                     className={`
                        flex items-center gap-3 p-2.5 mx-1 my-0.5 hover:bg-blue-50 cursor-pointer rounded-md text-sm transition-colors
                        ${isSelected ? 'bg-blue-50/50 text-blue-700 font-medium' : 'text-gray-700'}
                     `}
                     onClick={() => toggleOption(option)}
                   >
                     <div className={`w-5 h-5 border rounded flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                        {isSelected && <Check size={14} className="text-white" />}
                     </div>
                     <span>{option}</span>
                   </div>
               );
             })}
             
             {filteredOptions.length === 0 && (
                 <div className="p-4 text-center text-gray-400 text-sm">No cities found</div>
             )}
          </div>
          
          <div className="p-2 border-t border-gray-50 bg-gray-50/50 rounded-b-lg text-xs text-gray-400 text-center">
             {selected.includes('All') ? 'All 103 cities selected' : `${selected.length} cities selected`}
          </div>
        </div>
      )}
    </div>
  );
}
