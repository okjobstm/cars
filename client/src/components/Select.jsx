import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function Select({ label, options, value, onChange, placeholder = 'Select option', className = '' }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const selectedLabel = options.find(opt => opt.value === value)?.label || value || placeholder;

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2 block ml-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-zinc-900/50 border border-zinc-800 text-left px-5 py-3.5 rounded-full flex items-center justify-between group transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-zinc-600 ${isOpen ? 'border-zinc-600 ring-1 ring-zinc-600 bg-zinc-900' : 'hover:border-zinc-700'
                    }`}
            >
                <span className={`block truncate ${!value ? 'text-zinc-500' : 'text-zinc-100'}`}>
                    {value ? selectedLabel : placeholder}
                </span>
                <ChevronDownIcon
                    className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'group-hover:text-zinc-300'}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden"
                    >
                        <ul className="max-h-60 overflow-auto py-2 px-1 custom-scrollbar">
                            {options.map((option) => {
                                const isSelected = option.value === value;
                                return (
                                    <li key={option.value}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(option.value)}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors ${isSelected
                                                    ? 'bg-zinc-800 text-white font-medium'
                                                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                                                }`}
                                        >
                                            <span className="truncate">{option.label}</span>
                                            {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
