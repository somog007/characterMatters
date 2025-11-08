import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';

export default function Services() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-8 text-rainbow">
          Our Services 🌟
        </h1>

        <div className="max-w-6xl mx-auto space-y-12">
          {/* Trainings Section */}
          <AnimatedCard delay={0.1} className="bg-gradient-to-br from-orange-50 to-yellow-50">
            <div className="text-5xl mb-4 text-center">🎓</div>
            <h2 className="text-4xl font-bold mb-6 text-center text-orange-600">
              TRAININGS/CONFERENCES
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Our interactive training sessions and conferences are designed to engage children and young 
              adolescents in meaningful discussions about character and values. We focus on seven core 
              values that form the foundation of good character:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-purple-600 mb-2">🤝 Trustworthiness</h3>
                <p className="text-gray-700">Building honesty and integrity in every action</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-pink-600 mb-2">❤️ Compassion</h3>
                <p className="text-gray-700">Developing empathy and kindness toward others</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-blue-600 mb-2">✊ Responsibility</h3>
                <p className="text-gray-700">Taking ownership of actions and decisions</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-green-600 mb-2">🙏 Respect</h3>
                <p className="text-gray-700">Honoring others and showing courtesy</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-yellow-600 mb-2">⚖️ Fairness</h3>
                <p className="text-gray-700">Treating everyone with justice and equality</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-indigo-600 mb-2">🤗 Empathy</h3>
                <p className="text-gray-700">Understanding and sharing others feelings</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md md:col-span-2">
                <h3 className="text-xl font-bold text-red-600 mb-2">👑 Leadership</h3>
                <p className="text-gray-700">Inspiring and guiding others with integrity</p>
              </div>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed">
              Since 2011, we have trained over <strong>40,000 students</strong> across Nigeria through 
              these comprehensive programs.
            </p>
          </AnimatedCard>

          {/* TV Programme Section */}
          <AnimatedCard delay={0.2} className="bg-gradient-to-br from-pink-50 to-rose-50">
            <div className="text-5xl mb-4 text-center">📺</div>
            <h2 className="text-4xl font-bold mb-6 text-center text-pink-600">
              TELEVISION PROGRAMME
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              The Character Matters TV programme started in <strong>2016</strong> and has become a 
              cornerstone of character education in Nigerian homes. Our engaging shows teach children 
              about values, morals, and good character through entertaining stories and activities.
            </p>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-2xl font-bold text-purple-600 mb-4 text-center">
                Broadcasting On:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg">
                  <p className="font-bold text-lg">WAP TV</p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-lg">
                  <p className="font-bold text-lg">RAVE TV</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-lg">
                  <p className="font-bold text-lg">R2TV</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-4 rounded-lg">
                  <p className="font-bold text-lg">JYBE TV</p>
                </div>
              </div>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed">
              Our TV programme reaches thousands of families across Nigeria, making character education 
              accessible and entertaining for children of all ages.
            </p>
          </AnimatedCard>

          {/* Books Section */}
          <AnimatedCard delay={0.3} className="bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-5xl mb-4 text-center">📚</div>
            <h2 className="text-4xl font-bold mb-6 text-center text-blue-600">
              CHARACTER BUILDING BOOKS
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Our comprehensive collection of character building books has been approved by the 
              <strong> Lagos State Ministry of Education in 2023</strong>. With over <strong>50,000 copies</strong> 
              sold and distributed, our books are being used in schools across <strong>10 states</strong> 
              in Nigeria.
            </p>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-2xl font-bold text-purple-600 mb-4">States Reached:</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {['Lagos', 'Oyo', 'Ogun', 'FCT', 'Edo', 'Bayelsa', 'Rivers', 'Akwa-Ibom', 'Ondo', 'Ekiti'].map((state, index) => (
                  <div key={index} className="bg-gradient-to-br from-purple-100 to-blue-100 p-3 rounded-lg text-center">
                    <p className="font-semibold">{state}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-center text-purple-600 mb-4">
                📖 14 Approved Books Available
              </h3>
              <p className="text-lg text-gray-700 text-center">
                Including bestsellers like "The ABC of Good Character," "World Kindness Day" series, 
                "Character Matters & Social Etiquettes" books, French language editions, and character 
                building workbooks.
              </p>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
}
