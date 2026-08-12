import React from 'react';

export const AppBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[#0b0f19]">
      {/* Dark Ambient Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Secondary Soft Cyan/Blue Subtle Glow */}
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.04)_0%,rgba(15,23,42,0)_70%)] blur-3xl rounded-full" />

      {/* Bottom Subtle Purple/Navy Accent Glow */}
      <div className="absolute -bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.04)_0%,rgba(15,23,42,0)_70%)] blur-3xl rounded-full" />
    </div>
  );
};
