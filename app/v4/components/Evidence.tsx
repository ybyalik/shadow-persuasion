'use client';

const TableRow = ({ metric, before, after, change, highlight = false }) => (
  <tr className="border-b-2 border-gray-300">
    <td className="p-3">{metric}</td>
    <td className="p-3">{before}</td>
    <td className="p-3">{after}</td>
    <td className={`p-3 font-bold ${highlight ? 'relative' : ''}`}>
      {change}
      {highlight && <div className="absolute inset-0 border-2 border-red-600 rounded-full scale-125 opacity-70"></div>}
      {highlight && <span className="absolute -top-4 -right-24 text-blue-700 italic transform -rotate-12 text-xl">significant ↑</span>}
    </td>
  </tr>
);

const Evidence = () => {
  return (
    <section>
      <h2 className="text-4xl font-bold uppercase tracking-wider mb-8 text-center">Exhibit A: Operational Effectiveness Data</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-lg text-left border-collapse">
          <thead>
            <tr className="border-b-4 border-black">
              <th className="p-3">Metric</th>
              <th className="p-3">Before Protocol</th>
              <th className="p-3">After Protocol</th>
              <th className="p-3">Δ Change</th>
            </tr>
          </thead>
          <tbody>
            <TableRow metric="Negotiation Win Rate" before="28%" after="74%" change="+164%" />
            <TableRow metric="Information Extraction Yield" before="1.2 units/hr" after="7.8 units/hr" change="+550%" highlight />
            <TableRow metric="Subject Compliance Rate" before="41%" after="92%" change="+124%" />
            <TableRow metric="Time-to-Conversion" before="14.2 days" after="3.1 days" change="-78%" />
            <TableRow metric="Operator Confidence Score" before="5.6/10" after="9.8/10" change="+75%" />
            <TableRow metric="Detected Deception Rate" before="18% accurate" after="89% accurate" change="+394%" />
          </tbody>
        </table>
      </div>
      <p className="text-center mt-8 text-sm text-gray-700">Note: Data collected across 20,847 active operators over 18-month period.</p>
    </section>
  );
};

export default Evidence;
