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
            trainings, TV shows, and character building books since 2012.
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
            <p className="text-lg text-gray-700">Students Trained Since 2012</p>
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

        {/* Episode Packages & Pricing Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <span className="text-sm font-bold tracking-widest text-purple-600 uppercase bg-purple-100 px-4 py-1.5 rounded-full inline-block mb-3">
              Flexible Packages
            </span>
            <h2 className="text-4xl font-bold text-rainbow mb-4">
              Episode Packages & Pricing 💎
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select an episode package crafted specifically for your child&apos;s developmental stage and learning goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 1st Package */}
            <AnimatedCard delay={0.1} className="relative flex flex-col justify-between bg-linear-to-br from-purple-50 via-pink-50 to-amber-50 p-6 rounded-3xl border-2 border-purple-300 shadow-lg">
              <span className="absolute -top-3 right-4 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold uppercase text-white shadow">
                Best Value (20 Ep)
              </span>
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">1st Package</h3>
                <p className="text-xs font-semibold text-purple-700 mb-3">20 Episodes Master Collection</p>
                <div className="text-3xl font-black text-purple-600 mb-4">$25 <span className="text-sm font-normal text-gray-500">/ ₦25,000</span></div>
                
                <div className="bg-white/90 rounded-2xl p-4 border border-purple-200 mb-4 space-y-2 text-xs">
                  <div className="font-bold text-purple-800 uppercase tracking-wider text-[10px] mb-1">🎬 Episode Breakdown</div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 2 & 3</span>
                    <span className="font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">8 episodes</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 4 & 5</span>
                    <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">8 episodes</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 6 - 10</span>
                    <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">4 episodes</span>
                  </div>
                </div>
              </div>
              <Link href="/subscribe?plan=package_1" className="mt-4 block text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-full shadow-md transition">
                Select 1st Package
              </Link>
            </AnimatedCard>

            {/* 2nd Package */}
            <AnimatedCard delay={0.2} className="relative flex flex-col justify-between bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-3xl border-2 border-blue-300 shadow-lg">
              <span className="absolute -top-3 right-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase text-white shadow">
                Most Popular (16 Ep)
              </span>
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">2nd Package</h3>
                <p className="text-xs font-semibold text-blue-700 mb-3">16 Episodes Gold Pack</p>
                <div className="text-3xl font-black text-purple-600 mb-4">$20 <span className="text-sm font-normal text-gray-500">/ ₦20,000</span></div>
                
                <div className="bg-white/90 rounded-2xl p-4 border border-blue-200 mb-4 space-y-2 text-xs">
                  <div className="font-bold text-blue-800 uppercase tracking-wider text-[10px] mb-1">🎬 Episode Breakdown</div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 2 & 3</span>
                    <span className="font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">6 episodes</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 4 & 5</span>
                    <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">6 episodes</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 6 - 10</span>
                    <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">4 episodes</span>
                  </div>
                </div>
              </div>
              <Link href="/subscribe?plan=package_2" className="mt-4 block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full shadow-md transition">
                Select 2nd Package
              </Link>
            </AnimatedCard>

            {/* 3rd Package */}
            <AnimatedCard delay={0.3} className="relative flex flex-col justify-between bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 rounded-3xl border border-gray-200 shadow-md">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">3rd Package</h3>
                <p className="text-xs font-semibold text-emerald-700 mb-3">13 Episodes Silver Pack</p>
                <div className="text-3xl font-black text-purple-600 mb-4">$16 <span className="text-sm font-normal text-gray-500">/ ₦16,000</span></div>
                
                <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200 mb-4 space-y-2 text-xs">
                  <div className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] mb-1">🎬 Episode Breakdown</div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 2 & 3</span>
                    <span className="font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">5 episodes</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 4 & 5</span>
                    <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">5 episodes</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 6 - 10</span>
                    <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">3 episodes</span>
                  </div>
                </div>
              </div>
              <Link href="/subscribe?plan=package_3" className="mt-4 block text-center bg-gray-800 hover:bg-black text-white font-bold py-3 rounded-full shadow-md transition">
                Select 3rd Package
              </Link>
            </AnimatedCard>

            {/* 4th Package */}
            <AnimatedCard delay={0.4} className="relative flex flex-col justify-between bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 rounded-3xl border border-gray-200 shadow-md">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">4th Package</h3>
                <p className="text-xs font-semibold text-amber-700 mb-3">8 Episodes Bronze Pack</p>
                <div className="text-3xl font-black text-purple-600 mb-4">$10 <span className="text-sm font-normal text-gray-500">/ ₦10,000</span></div>
                
                <div className="bg-white/90 rounded-2xl p-4 border border-amber-200 mb-4 space-y-2 text-xs">
                  <div className="font-bold text-amber-800 uppercase tracking-wider text-[10px] mb-1">🎬 Episode Breakdown</div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 2 & 3</span>
                    <span className="font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">3 episodes</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 4 & 5</span>
                    <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">3 episodes</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 6 - 10</span>
                    <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">2 episodes</span>
                  </div>
                </div>
              </div>
              <Link href="/subscribe?plan=package_4" className="mt-4 block text-center bg-gray-800 hover:bg-black text-white font-bold py-3 rounded-full shadow-md transition">
                Select 4th Package
              </Link>
            </AnimatedCard>

            {/* 5th Package */}
            <AnimatedCard delay={0.5} className="relative flex flex-col justify-between bg-linear-to-br from-rose-50 via-pink-50 to-purple-50 p-6 rounded-3xl border border-gray-200 shadow-md">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">5th Package</h3>
                <p className="text-xs font-semibold text-rose-700 mb-3">5 Episodes Starter Pack</p>
                <div className="text-3xl font-black text-purple-600 mb-4">$7 <span className="text-sm font-normal text-gray-500">/ ₦7,000</span></div>
                
                <div className="bg-white/90 rounded-2xl p-4 border border-rose-200 mb-4 space-y-2 text-xs">
                  <div className="font-bold text-rose-800 uppercase tracking-wider text-[10px] mb-1">🎬 Episode Breakdown</div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 2 & 3</span>
                    <span className="font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">2 episodes</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 4 & 5</span>
                    <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">2 episodes</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 6 - 10</span>
                    <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">1 episode</span>
                  </div>
                </div>
              </div>
              <Link href="/subscribe?plan=package_5" className="mt-4 block text-center bg-gray-800 hover:bg-black text-white font-bold py-3 rounded-full shadow-md transition">
                Select 5th Package
              </Link>
            </AnimatedCard>

            {/* 6th Package */}
            <AnimatedCard delay={0.6} className="relative flex flex-col justify-between bg-linear-to-br from-cyan-50 via-sky-50 to-blue-50 p-6 rounded-3xl border border-gray-200 shadow-md">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">6th Package</h3>
                <p className="text-xs font-semibold text-cyan-700 mb-3">3 Episodes Mini Sampler</p>
                <div className="text-3xl font-black text-purple-600 mb-4">$5 <span className="text-sm font-normal text-gray-500">/ ₦5,000</span></div>
                
                <div className="bg-white/90 rounded-2xl p-4 border border-cyan-200 mb-4 space-y-2 text-xs">
                  <div className="font-bold text-cyan-800 uppercase tracking-wider text-[10px] mb-1">🎬 Episode Breakdown</div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 2 & 3</span>
                    <span className="font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">1 episode</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 4 & 5</span>
                    <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">1 episode</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Ages 6 - 10</span>
                    <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">1 episode</span>
                  </div>
                </div>
              </div>
              <Link href="/subscribe?plan=package_6" className="mt-4 block text-center bg-gray-800 hover:bg-black text-white font-bold py-3 rounded-full shadow-md transition">
                Select 6th Package
              </Link>
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
