'use client';

const FileCard = ({ file, title, description, classification }) => (
  <div className="bg-[#E8DCC8] p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 relative border-l-4 border-gray-400">
    <div className="absolute -top-4 left-4 bg-gray-300 px-3 py-1 text-sm font-bold border-t-2 border-x-2 border-gray-400 rounded-t-md">{file}</div>
    <p className="text-red-700 font-bold absolute top-4 right-4 text-sm">{classification}</p>
    <h3 className="text-2xl font-bold mt-4">{title}</h3>
    <p className="text-gray-700 mt-2 h-12">{description}</p>
  </div>
);

const SubjectFiles = () => {
  const files = [
    { file: 'FILE-001', title: 'AI Operator Console', description: 'Real-time conversational analysis and tactical guidance for any interaction.', classification: 'RESTRICTED' },
    { file: 'FILE-002', title: 'Visual Intelligence Module', description: 'Analyze body language and micro-expressions from uploaded images.', classification: 'SENSITIVE' },
    { file: 'FILE-003', title: 'Dark Psychology Engine', description: 'Leverages a proprietary dataset of high-stakes human influence scenarios.', classification: 'RESTRICTED' },
    { file: 'FILE-004', title: 'Negotiation Warfare System', description: 'Game-theory models to secure favorable outcomes in any negotiation.', classification: 'SENSITIVE' },
    { file: 'FILE-005', title: 'Persuasion Script Library', description: 'Pre-built and AI-generated scripts to handle common objections and scenarios.', classification: 'SENSITIVE' },
    { file: 'FILE-006', title: 'Psychological Profiling Unit', description: 'Generate detailed personality and vulnerability profiles from limited data inputs.', classification: 'RESTRICTED' },
  ];

  return (
    <section>
      <h2 className="text-4xl font-bold uppercase tracking-wider mb-12 text-center">Subject Files</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
        {files.map((file) => <FileCard key={file.file} {...file} />)}
      </div>
    </section>
  );
};

export default SubjectFiles;
