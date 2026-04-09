import TechniqueDetailClient from './TechniqueDetailClient';

export default async function TechniqueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TechniqueDetailClient techniqueId={id} />;
}
