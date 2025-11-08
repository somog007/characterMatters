import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';

export default function Team() {
  const teamMembers = [
    {
      name: 'Anuoluwapo Awofisan',
      role: 'Team Lead Trainer, Author & Publisher',
      icon: '👩‍🏫',
      delay: 0.1,
    },
    {
      name: 'Femi Odubawo',
      role: 'Strategic Partner',
      icon: '🤝',
      delay: 0.2,
    },
    {
      name: 'Kehinde Oyedeji',
      role: 'Strategic Partner',
      icon: '🤝',
      delay: 0.3,
    },
    {
      name: 'Jerry Xavier Osagie',
      role: 'Strategic Partner',
      icon: '🤝',
      delay: 0.4,
    },
  ];

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-8 text-rainbow">
          Meet Our Team 👥
        </h1>

        <p className="text-xl text-gray-700 text-center mb-12 max-w-3xl mx-auto">
          Our dedicated team of professionals is committed to raising the standard of character 
          and morals in children across Nigeria.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {teamMembers.map((member, index) => (
            <AnimatedCard 
              key={index} 
              delay={member.delay}
              className="bg-gradient-to-br from-purple-50 to-pink-50 text-center"
            >
              <div className="text-7xl mb-4">{member.icon}</div>
              <h3 className="text-2xl font-bold mb-2 text-purple-600">
                {member.name}
              </h3>
              <p className="text-lg text-gray-700 font-semibold">
                {member.role}
              </p>
            </AnimatedCard>
          ))}
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <AnimatedCard delay={0.5} className="bg-gradient-to-br from-blue-100 to-cyan-100">
            <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
              Join Our Mission
            </h2>
            <p className="text-lg text-gray-700 text-center leading-relaxed">
              We are always looking for passionate individuals who want to make a difference in 
              the lives of children. Whether you are an educator, parent, or organization, 
              we welcome partnerships and collaborations to expand our reach and impact.
            </p>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
}
