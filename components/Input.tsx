import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className, ...props }) => {
    return (
        <div className="flex flex-col gap-1 mb-2">
            {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>}
            <input 
                className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white/80 ${className}`}
                {...props}
            />
        </div>
    );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, className, children, ...props }) => {
    return (
        <div className="flex flex-col gap-1 mb-2">
            {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>}
            <select 
                className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white/80 ${className}`}
                {...props}
            >
                {children}
            </select>
        </div>
    );
};
