import React from 'react';
import { FeatureProps } from '../types';

const FeatureCard: React.FC<FeatureProps> = ({ title, description, icon }) => {
  return (
    <div className="flex flex-col gap-4 p-4 opacity-80 hover:opacity-100 transition-opacity duration-500">
      <div className="text-white/80">
        {React.cloneElement(icon as React.ReactElement, { strokeWidth: 1.5, className: "w-6 h-6" })}
      </div>
      <div>
        <h3 className="text-sm font-medium text-white mb-2 uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-sm text-neutral-500 font-light leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;