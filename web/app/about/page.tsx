import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';

export default function About() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-8 text-rainbow">
          About Character Matters ✨
        </h1>

        <div className="max-w-4xl mx-auto">
          <AnimatedCard delay={0.1} className="mb-8">
            <h2 className="text-3xl font-bold mb-4 text-purple-600">Our Vision</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              <strong>Character Matters Concept</strong> is an organization envisioned to raise the standard 
              of good character and sound morals in children and young adolescents. We believe that building 
              strong character foundations in young people is essential for creating impeccable leaders of 
              sound Character.
            </p>
          </AnimatedCard>

          <AnimatedCard delay={0.2} className="mb-8">
            <h2 className="text-3xl font-bold mb-4 text-blue-600">Our Impact</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Since our establishment in <strong>2012</strong>, Character Matters has been at the forefront 
              of character education in Nigeria. We have:
            </p>
            <ul className="list-disc list-inside space-y-2 text-lg text-gray-700">
              <li>Trained over <strong>40,000 students</strong> across Nigeria</li>
              <li>Distributed more than <strong>50,000 books</strong> to schools and families</li>
              <li>Reached communities in <strong>10 states</strong>: Lagos, Oyo, Ogun, FCT, Edo, Bayelsa, Rivers, Akwa-Ibom, Ondo, and Ekiti</li>
              <li>Received approval from the <strong>Lagos State Ministry of Education</strong> in 2023</li>
            </ul>
          </AnimatedCard>

          <AnimatedCard delay={0.3} className="mb-8 bg-linear-to-br from-yellow-50 to-orange-50">
            <h2 className="text-3xl font-bold mb-4 text-orange-600">Three Core Pillars</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2 text-purple-600">1. 🎓 Trainings & Conferences</h3>
                <p className="text-lg text-gray-700">
                  We conduct interactive training sessions and conferences in schools, teaching essential 
                  values such as Trustworthiness, Compassion, Responsibility, Respect, Fairness, Empathy, 
                  and Leadership.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-2 text-pink-600">2. 📺 Television Programme</h3>
                <p className="text-lg text-gray-700">
                  Since 2016, our Character Matters TV programme has been broadcasting on multiple channels 
                  including WAP TV, RAVE TV, R2TV, and JYBE TV, reaching thousands of families across Nigeria.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-2 text-blue-600">3. 📚 Character Building Books</h3>
                <p className="text-lg text-gray-700">
                  Our 14 approved books, including bestsellers like &quot;The ABC of Good Character&quot; and 
                  the &quot;World Kindness Day&quot; series, are being used in schools across 10 states in Nigeria.
                </p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.4} className="bg-linear-to-br from-purple-100 to-pink-100">
            <h2 className="text-3xl font-bold mb-4 text-center text-purple-600">
              Our Mission
            </h2>
            <p className="text-xl text-gray-700 text-center leading-relaxed">
              To raise impeccable leaders of sound Character by instilling values, morals, and 
              character traits that will enable children and young adolescents to become responsible, 
              compassionate, and ethical members of society.
            </p>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
}
