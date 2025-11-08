import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';

export default function Products() {
  const books = [
    { title: 'The ABC of Good Character', icon: '📖', category: 'Foundation' },
    { title: 'World Kindness Day Series 1', icon: '❤️', category: 'Kindness' },
    { title: 'World Kindness Day Series 2', icon: '💝', category: 'Kindness' },
    { title: 'Character Matters & Social Etiquettes Book 1', icon: '📘', category: 'Etiquettes' },
    { title: 'Character Matters & Social Etiquettes Book 2', icon: '📗', category: 'Etiquettes' },
    { title: 'Character Matters & Social Etiquettes Book 3', icon: '📙', category: 'Etiquettes' },
    { title: 'Character Matters & Social Etiquettes Book 4', icon: '📕', category: 'Etiquettes' },
    { title: 'Character Matters & Social Etiquettes Book 5', icon: '📔', category: 'Etiquettes' },
    { title: 'Character is Who You Are', icon: '⭐', category: 'Character' },
    { title: 'French Language Book 1', icon: '🇫🇷', category: 'French' },
    { title: 'French Language Book 2', icon: '🗼', category: 'French' },
    { title: 'French Language Book 3', icon: '🥐', category: 'French' },
    { title: 'Character Building Workbook 1', icon: '✏️', category: 'Workbooks' },
    { title: 'Character Building Workbook 2', icon: '📝', category: 'Workbooks' },
  ];

  const categories = ['All', 'Foundation', 'Kindness', 'Etiquettes', 'Character', 'French', 'Workbooks'];

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-8 text-rainbow">
          Our Books 📚
        </h1>

        <div className="max-w-6xl mx-auto mb-12">
          <AnimatedCard delay={0.1} className="bg-gradient-to-br from-purple-100 to-pink-100">
            <h2 className="text-3xl font-bold text-center mb-4 text-purple-600">
              Approved by Lagos State Ministry of Education ✅
            </h2>
            <p className="text-lg text-gray-700 text-center leading-relaxed">
              All our books have been officially approved by the Lagos State Ministry of Education in 2023. 
              With over <strong>50,000 copies</strong> sold and distributed, our books are being used in schools 
              across <strong>10 states</strong> in Nigeria: Lagos, Oyo, Ogun, FCT, Edo, Bayelsa, Rivers, Akwa-Ibom, Ondo, and Ekiti.
            </p>
          </AnimatedCard>
        </div>

        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Browse Our Collection
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {books.map((book, index) => (
              <AnimatedCard 
                key={index} 
                delay={index * 0.05}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{book.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800 min-h-[3rem]">
                    {book.title}
                  </h3>
                  <span className="inline-block bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {book.category}
                  </span>
                </div>
              </AnimatedCard>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedCard delay={0.7} className="bg-gradient-to-br from-yellow-50 to-orange-50">
              <div className="text-center">
                <div className="text-5xl mb-4">🏫</div>
                <h3 className="text-2xl font-bold mb-3 text-orange-600">For Schools</h3>
                <p className="text-gray-700">
                  Bulk orders available for schools and educational institutions. Contact us for special pricing.
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.8} className="bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="text-center">
                <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
                <h3 className="text-2xl font-bold mb-3 text-green-600">For Families</h3>
                <p className="text-gray-700">
                  Perfect for home learning and character development. Individual copies available.
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.9} className="bg-gradient-to-br from-pink-50 to-rose-50">
              <div className="text-center">
                <div className="text-5xl mb-4">🎁</div>
                <h3 className="text-2xl font-bold mb-3 text-pink-600">Gift Sets</h3>
                <p className="text-gray-700">
                  Special gift sets available for birthdays, graduations, and special occasions.
                </p>
              </div>
            </AnimatedCard>
          </div>

          <div className="mt-12 text-center">
            <AnimatedCard delay={1.0} className="bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                Order Your Books Today! 📦
              </h2>
              <p className="text-xl text-gray-700 mb-6">
                Contact us to place your order or for more information about our books.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a 
                  href="mailto:Charactermattersng@gmail.com"
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
                >
                  Email Us 📧
                </a>
                <a 
                  href="tel:08028289610"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
                >
                  Call Us 📞
                </a>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
