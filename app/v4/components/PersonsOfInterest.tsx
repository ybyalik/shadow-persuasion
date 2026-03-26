'use client';

import Image from 'next/image';

const ProfileCard = ({ img, name, alias, role, description }) => (
  <div className="border border-gray-400 p-4 relative">
    <div className="relative w-48 h-48 mx-auto mb-4">
      <div className="absolute -top-1 -left-1 w-8 h-4 bg-white/70 transform -rotate-45 z-10"></div>
      <div className="absolute -bottom-1 -left-1 w-8 h-4 bg-white/70 transform rotate-45 z-10"></div>
      <div className="absolute -top-1 -right-1 w-8 h-4 bg-white/70 transform rotate-45 z-10"></div>
      <div className="absolute -bottom-1 -right-1 w-8 h-4 bg-white/70 transform -rotate-45 z-10"></div>
      <Image
        src={img}
        alt={`Mugshot of ${name}`}
        width={200}
        height={200}
        className="grayscale sepia-[25%] transform rotate-[-2deg] object-cover w-full h-full"
      />
    </div>
    <div className="text-left space-y-1 font-mono">
      <p><span className="font-bold">NAME:</span> {name}</p>
      <p><span className="font-bold">ALIAS:</span> {alias}</p>
      <p><span className="font-bold">ROLE:</span> {role}</p>
      <p><span className="font-bold">STATUS:</span> ACTIVE</p>
    </div>
    <p className="mt-4 text-lg leading-relaxed">{description}</p>
  </div>
);

const PersonsOfInterest = () => {
  return (
    <section>
      <h2 className="text-4xl font-bold uppercase tracking-wider mb-12 text-center">Persons of Interest</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ProfileCard
          img="https://i.pravatar.cc/200?img=32"
          name="Dr. Alistair Finch"
          alias="The Architect"
          role="Lead Psychologist, Dark Psychology Engine"
          description="Subject is the primary architect of the core persuasion model. Background in clinical psychology and behavioral engineering. Known for his unorthodox methods and an ability to model complex human motivations."
        />
        <ProfileCard
          img="https://i.pravatar.cc/200?img=36"
          name="Isabella Rossi"
          alias="Nyx"
          role="Lead Engineer, AI Operator Console"
          description="Subject is a prodigy in human-computer interaction. Responsible for translating the Architect's models into the operational interface. Obsessed with creating seamless, intuitive systems that feel like an extension of the user's will."
        />
        <ProfileCard
          img="https://i.pravatar.cc/200?img=40"
          name="[REDACTED]"
          alias="Control"
          role="Project Director"
          description="Subject's background is classified. Assumed to have deep connections within intelligence and private military sectors. Oversees all operational deployments and strategic direction of the project. Extremely pragmatic."
        />
      </div>
    </section>
  );
};

export default PersonsOfInterest;
