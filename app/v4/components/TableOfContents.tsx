'use client';

const TOCEntry = ({ number, title, page, redacted = false }) => (
  <li className="flex items-end justify-between py-2 text-lg">
    <div className="flex items-end">
      <span className="mr-2">{number}.</span>
      <span>{redacted ? <span className="bg-black text-black">{title}</span> : title}</span>
    </div>
    <div className="flex-grow border-b-2 border-dotted border-black mx-4"></div>
    <span>{page}</span>
  </li>
);

const TableOfContents = () => {
  return (
    <section className="relative">
      <h2 className="text-4xl font-bold uppercase tracking-wider mb-8 text-center">Contents</h2>
      <ul className="space-y-2 max-w-2xl mx-auto">
        <TOCEntry number="1" title="Executive Summary" page="1" />
        <TOCEntry number="2" title="Introduction: The Asymmetric Advantage" page="3" />
        <TOCEntry number="3" title="Subject File: The AI Operator Console" page="5" />
        <TOCEntry number="4" title="Subject File: █████████ Techniques" page="8" redacted />
        <TOCEntry number="5" title="Operational Evidence: Field Test Results" page="15" />
        <TOCEntry number="6" title="Witness Statements: Operator Testimonials" page="21" />
        <TOCEntry number="7" title="Persons of Interest: Project Leads" page="28" />
        <TOCEntry number="8" title="Appendix C: FAQ (Sanitized)" page="32" />
        <TOCEntry number="9" title="Request for Unredacted Access" page="35" />
      </ul>
      <div className="absolute bottom-[-2rem] right-[-2rem] text-red-700 text-3xl font-bold border-4 border-red-700 p-2 transform rotate-6 opacity-80">
        APPROVED FOR RELEASE
      </div>
    </section>
  );
};

export default TableOfContents;
