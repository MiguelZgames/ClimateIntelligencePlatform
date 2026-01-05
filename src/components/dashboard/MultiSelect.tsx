import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';

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
      // If All is clicked, it clears everything else and just selects All
      // Or if All is already selected, it deselects it (but we usually want at least one selection, so maybe keep All)
      newSelected = ['All'];
    } else {
      // If a specific city is clicked
      if (selected.includes('All')) {
        // If All was selected, remove it and select the new option
        newSelected = [option];
      } else {
        if (selected.includes(option)) {
           newSelected = selected.filter(s => s !== option);
           if (newSelected.length === 0) newSelected = ['All']; // Fallback to All if empty
        } else {
           newSelected = [...selected, option];
        }
      }
    }
    onChange(newSelected);
  };

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayValue = () => {
    if (selected.includes('All')) return "All Cities";
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) return selected[0];
    return `${selected[0]} (+${selected.length - 1} more)`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border rounded-md p-2 flex justify-between items-center cursor-pointer bg-white min-h-[42px] hover:border-blue-400 transition-colors"
      >
        <div className="flex flex-wrap gap-1 overflow-hidden text-sm">
            {displayValue()}
        </div>
        <ChevronDown size={16} className="text-gray-500" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 flex flex-col">
          <div className="p-2 border-b">
            <div className="flex items-center bg-gray-50 rounded px-2">
                <Search size={14} className="text-gray-400" />
                <input 
                    type="text"
                    className="w-full bg-transparent p-1.5 text-sm focus:outline-none"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-1">
             <div 
                className={`flex items-center gap-2 p-2 hover:bg-blue-50 cursor-pointer rounded text-sm ${selected.includes('All') ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                onClick={() => toggleOption('All')}
             >
                <div className={`w-4 h-4 border rounded flex items-center justify-center ${selected.includes('All') ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                    {selected.includes('All') && <Check size={12} className="text-white" />}
                </div>
                <span>Select All</span>
             </div>
             
             {filteredOptions.map(option => (
               <div 
                 key={option}
                 className={`flex items-center gap-2 p-2 hover:bg-blue-50 cursor-pointer rounded text-sm ${selected.includes(option) ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                 onClick={() => toggleOption(option)}
               >
                 <div className={`w-4 h-4 border rounded flex items-center justify-center ${selected.includes(option) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                    {selected.includes(option) && <Check size={12} className="text-white" />}
                 </div>
                 <span>{option}</span>
               </div>
             ))}
             
             {filteredOptions.length === 0 && (
                 <div className="p-2 text-center text-gray-500 text-xs">No results found</div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
