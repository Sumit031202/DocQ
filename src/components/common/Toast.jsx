import React, { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        info: 'bg-blue-600',
        success: 'bg-green-600',
        error: 'bg-red-600',
    };

    return (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded shadow-lg text-white ${bgColors[type]} transition-opacity duration-300`}>
            {message}
        </div>
    );
}
