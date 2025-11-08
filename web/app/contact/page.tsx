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
          <AnimatedCard delay={0.1} className="bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="text-5xl mb-4 text-center">📧</div>
            <h3 className="text-2xl font-bold mb-4 text-center text-purple-600">Email</h3>
            <p className="text-lg text-center">
              <a 
                href="mailto:Charactermattersng@gmail.com" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Charactermattersng@gmail.com
              </a>
            </p>
          </AnimatedCard>

          <AnimatedCard delay={0.2} className="bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="text-5xl mb-4 text-center">📱</div>
            <h3 className="text-2xl font-bold mb-4 text-center text-blue-600">Phone</h3>
            <p className="text-lg text-center space-y-2">
              <a href="tel:08028289610" className="block text-gray-700 hover:text-blue-600">
                08028289610
              </a>
              <a href="tel:0813..." className="block text-gray-700 hover:text-blue-600">
                0813...
              </a>
            </p>
          </AnimatedCard>
        </div>

        <div className="max-w-6xl mx-auto mb-12">
          <AnimatedCard delay={0.3} className="bg-gradient-to-br from-yellow-50 to-orange-50">
            <h2 className="text-3xl font-bold mb-6 text-center text-orange-600">
              Connect With Us on Social Media 🌐
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center"
              >
                <div className="text-4xl mb-2">📘</div>
                <p className="font-bold text-blue-600">Facebook</p>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center"
              >
                <div className="text-4xl mb-2">📷</div>
                <p className="font-bold text-pink-600">Instagram</p>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center"
              >
                <div className="text-4xl mb-2">🐦</div>
                <p className="font-bold text-blue-400">Twitter</p>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center"
              >
                <div className="text-4xl mb-2">📹</div>
                <p className="font-bold text-red-600">YouTube</p>
              </a>
            </div>
          </AnimatedCard>
        </div>

        <div className="max-w-6xl mx-auto">
          <AnimatedCard delay={0.4} className="bg-gradient-to-br from-green-50 to-emerald-50">
            <h2 className="text-3xl font-bold mb-6 text-center text-green-600">
              Media Partners 📺
            </h2>
            <p className="text-lg text-gray-700 text-center mb-6">
              Watch Character Matters on these amazing TV channels:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="font-bold text-xl text-purple-600">WAP TV</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="font-bold text-xl text-blue-600">RAVE TV</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="font-bold text-xl text-green-600">R2TV</p>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
}
