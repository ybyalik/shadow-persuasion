'use client';

export const Footer = () => {
  return (
    <footer className="bg-black py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <div className="flex justify-center gap-x-6 font-mono text-sm text-gray-500">
            <a href="#" className="transition-colors hover:text-[#FF8C00]">System</a>
            <a href="#" className="transition-colors hover:text-[#FF8C00]">Modules</a>
            <a href="#" className="transition-colors hover:text-[#FF8C00]">Pricing</a>
            <a href="#" className="transition-colors hover:text-[#FF8C00]">Contact</a>
        </div>
        <p className="mt-8 text-xs uppercase tracking-widest text-gray-700">
            SHADOW PERSUASION // EST. 2026 // ALL RIGHTS RESERVED
        </p>
      </div>
    </footer>
  );
};
