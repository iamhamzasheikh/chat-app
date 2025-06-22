// components/Loader.js
import React from 'react';

const Loader = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-purple-500 border-dashed rounded-full animate-spin"></div>
        </div>
    );
};

export default Loader;
