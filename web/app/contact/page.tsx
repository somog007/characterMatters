import Image from 'next/image';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';

export default function Contact() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-8 text-rainbow">
          Contact Us 📞
        </h1>

        <p className="text-xl text-gray-700 text-center mb-12 max-w-3xl mx-auto">
          We would love to hear from you! Reach out to us for trainings, book orders, 
          partnerships, or any inquiries.
        </p>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <AnimatedCard delay={0.1} className="bg-gradient-to-br from-brand-purple-50 to-brand-yellow-100">
            <div className="text-5xl mb-4 text-center">📧</div>
            <h3 className="text-2xl font-bold mb-4 text-center text-brand-purple-600">Email</h3>
            <p className="text-lg text-center">
              <a 
                href="mailto:charactermattersng@gmail.com" 
                className="text-brand-purple-500 hover:text-brand-purple-700 underline"
              >
                charactermattersng@gmail.com
              </a>
            </p>
          </AnimatedCard>

          <AnimatedCard delay={0.2} className="bg-gradient-to-br from-brand-yellow-100 to-brand-orange-100">
            <div className="text-5xl mb-4 text-center">📱</div>
            <h3 className="text-2xl font-bold mb-4 text-center text-brand-purple-600">Phone</h3>
            <p className="text-lg text-center font-bold">
              <a href="tel:08028289610" className="block text-gray-700 hover:text-brand-purple-600">
                08028289610
              </a>
            </p>
          </AnimatedCard>
        </div>

        <div className="max-w-6xl mx-auto mb-12">
          <AnimatedCard delay={0.3} className="bg-gradient-to-br from-brand-yellow-50 to-brand-orange-50">
            <h2 className="text-3xl font-bold mb-6 text-center text-brand-purple-500">
              Connect With Us on Social Media 🌐
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <a 
                href="https://facebook.com/charactermattersng" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <Image 
                    src="/images/social/facebook.svg" 
                    alt="Facebook" 
                    fill
                    className="object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
                <p className="font-bold text-brand-purple-600 text-center">Facebook</p>
              </a>
              <a 
                href="https://instagram.com/charactermattersng" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <Image 
                    src="/images/social/instagram.svg" 
                    alt="Instagram" 
                    fill
                    className="object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
                <p className="font-bold text-brand-orange-500 text-center">Instagram</p>
              </a>
              <a 
                href="https://www.youtube.com/channel/UCX8jyQwm3ofvKuXttchHdJw" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <Image 
                    src="/images/social/youtube.svg" 
                    alt="YouTube" 
                    fill
                    className="object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
                <p className="font-bold text-brand-purple-500 text-center">YouTube</p>
              </a>
            </div>
          </AnimatedCard>
        </div>

        <div className="max-w-6xl mx-auto">
          <AnimatedCard delay={0.4} className="bg-gradient-to-br from-brand-purple-50 to-brand-yellow-50">
            <h2 className="text-3xl font-bold mb-6 text-center text-brand-purple-600">
              Media Partners 📺
            </h2>
            <p className="text-lg text-gray-700 text-center mb-6">
              Watch Character Matters on these amazing TV channels:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="group bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all hover:scale-105">
                <div className="relative w-24 h-24 mx-auto">
                  <Image 
                    src="/images/tv-stations/wap-tv.svg" 
                    alt="WAP TV" 
                    fill
                    className="object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
              </div>
              <div className="group bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all hover:scale-105">
                <div className="relative w-24 h-24 mx-auto">
                  <Image 
                    src="/images/tv-stations/rave-tv.svg" 
                    alt="RAVE TV" 
                    fill
                    className="object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
              </div>
              <div className="group bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all hover:scale-105">
                <div className="relative w-24 h-24 mx-auto">
                  <Image 
                    src="/images/tv-stations/r2tv.svg" 
                    alt="R2TV" 
                    fill
                    className="object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
              </div>
              <div className="group bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all hover:scale-105">
                <div className="relative w-24 h-24 mx-auto">
                  <Image 
                    src="/images/tv-stations/jybe-tv.svg" 
                    alt="JYBE TV" 
                    fill
                    className="object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
}
