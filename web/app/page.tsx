import AnimatedCard from '@/components/AnimatedCard';
import BouncyButton from '@/components/BouncyButton';
import PageTransition from '@/components/PageTransition';
import Link from 'next/link';

export default function Home() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 text-rainbow animate-bounce-slow">
            Welcome to Character Matters! ⭐
          </h1>
          <p className="text-2xl text-gray-700 mb-4 font-semibold">
            ...raising impeccable leaders of sound Character
          </p>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Building character and sound morals in children and young adolescents through 
            trainings, TV shows, and character building books since 2011.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/about">
              <BouncyButton variant="primary">
                Learn More 🎯
              </BouncyButton>
            </Link>
            <Link href="/products">
              <BouncyButton variant="secondary">
                View Books 📚
              </BouncyButton>
            </Link>
            <Link href="/contact">
              <BouncyButton variant="success">
                Contact Us 📞
              </BouncyButton>
            </Link>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <AnimatedCard delay={0.1} className="text-center bg-linear-to-br from-purple-100 to-pink-100">
            <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-4xl font-bold text-purple-600 mb-2">40,000+</h3>
            <p className="text-lg text-gray-700">Students Trained Since 2011</p>
          </AnimatedCard>
          
          <AnimatedCard delay={0.2} className="text-center bg-linear-to-br from-blue-100 to-cyan-100">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-4xl font-bold text-blue-600 mb-2">50,000+</h3>
            <p className="text-lg text-gray-700">Books Sold & Distributed</p>
          </AnimatedCard>
          
          <AnimatedCard delay={0.3} className="text-center bg-linear-to-br from-green-100 to-emerald-100">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-4xl font-bold text-green-600 mb-2">10 States</h3>
            <p className="text-lg text-gray-700">Across Nigeria</p>
          </AnimatedCard>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-rainbow">
            What We Offer 🌟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedCard delay={0.1} className="bg-linear-to-br from-yellow-50 to-orange-50">
              <div className="text-5xl mb-4 text-center">🎓</div>
              <h3 className="text-2xl font-bold mb-4 text-center text-orange-600">
                Trainings & Conferences
              </h3>
              <p className="text-gray-700 text-center">
                Interactive sessions teaching values like Trustworthiness, Compassion, 
                Responsibility, Respect, Fairness, Empathy, and Leadership.
              </p>
              <div className="text-center mt-4">
                <Link href="/services">
                  <BouncyButton variant="secondary" className="text-sm">
                    Learn More
                  </BouncyButton>
                </Link>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.2} className="bg-linear-to-br from-pink-50 to-rose-50">
              <div className="text-5xl mb-4 text-center">📺</div>
              <h3 className="text-2xl font-bold mb-4 text-center text-pink-600">
                TV Shows
              </h3>
              <p className="text-gray-700 text-center">
                Character Matters TV programme airs on WAP TV, RAVE TV, R2TV, and JYBE TV, 
                reaching thousands of families since 2016.
              </p>
              <div className="text-center mt-4">
                <Link href="/videos">
                  <BouncyButton variant="success" className="text-sm">
                    Watch Now
                  </BouncyButton>
                </Link>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.3} className="bg-linear-to-br from-blue-50 to-indigo-50">
              <div className="text-5xl mb-4 text-center">📖</div>
              <h3 className="text-2xl font-bold mb-4 text-center text-blue-600">
                Character Building Books
              </h3>
              <p className="text-gray-700 text-center">
                14 approved books including &quot;The ABC of Good Character,&quot; &quot;World Kindness Day&quot; series, 
                and &quot;Character Matters & Social Etiquettes&quot; series.
              </p>
              <div className="text-center mt-4">
                <Link href="/products">
                  <BouncyButton variant="primary" className="text-sm">
                    View Books
                  </BouncyButton>
                </Link>
              </div>
            </AnimatedCard>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-linear-to-r from-purple-200 via-pink-200 to-blue-200 rounded-3xl p-12 shadow-rainbow">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">
            Ready to Build Character? 🚀
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Join thousands of families and schools across Nigeria in raising children with 
            impeccable character and sound morals.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register">
              <BouncyButton variant="primary" className="text-lg px-8">
                Get Started 🎉
              </BouncyButton>
            </Link>
            <Link href="/team">
              <BouncyButton variant="secondary" className="text-lg px-8">
                Meet Our Team 👥
              </BouncyButton>
            </Link>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
