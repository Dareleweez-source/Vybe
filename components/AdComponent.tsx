import React from 'react';

const AdComponent: React.FC = () => {
  return (
    <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-surface">
      <p className="text-xs text-on-surface-secondary font-bold">Sponsored</p>
      <a href="#" className="flex items-center gap-3 mt-2 hover:bg-gray-100 p-2 rounded-lg -m-2 transition-colors duration-200">
        <img src="https://picsum.photos/id/1015/200/200" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" alt="Ad visual for Travel Inc." />
        <div className="overflow-hidden">
          <p className="font-bold text-on-surface truncate">Explore the Mountains</p>
          <p className="text-sm text-on-surface-secondary">Book your next adventure with Travel Inc.</p>
        </div>
      </a>
    </div>
  );
};

export default AdComponent;