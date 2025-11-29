import Image from 'next/image';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';

export default function Products() {
  const books = [
    {
      title: 'Character Matters & Social Etiquette · Book 1',
      image: '/images/books/book-1.svg',
      category: 'Etiquettes',
    },
    {
      title: 'Character Matters & Social Etiquette · Book 2',
      image: '/images/books/book-2.svg',
      category: 'Etiquettes',
    },
    {
      title: 'Character Matters & Social Etiquette · Book 3',
      image: '/images/books/book-3.svg',
      category: 'Etiquettes',
    },
    {
      title: 'Character Matters & Social Etiquette · Book 4',
      image: '/images/books/book-4.svg',
      category: 'Etiquettes',
    },
    {
      title: 'Character Matters & Social Etiquette · Book 5',
      image: '/images/books/book-5.svg',
      category: 'Etiquettes',
    },
    { title: 'The ABC of Good Character', icon: '📖', category: 'Foundation' },
    { title: 'World Kindness Day Series 1', icon: '❤️', category: 'Kindness' },
    { title: 'World Kindness Day Series 2', icon: '💝', category: 'Kindness' },
    { title: 'Character is Who You Are', icon: '⭐', category: 'Character' },
    { title: 'French Language Book 1', icon: '🇫🇷', category: 'French' },
    { title: 'French Language Book 2', icon: '🗼', category: 'French' },
    { title: 'French Language Book 3', icon: '🥐', category: 'French' },
    { title: 'Character Building Workbook 1', icon: '✏️', category: 'Workbooks' },
    { title: 'Character Building Workbook 2', icon: '📝', category: 'Workbooks' },
  ];

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <div className="relative h-28 w-28">
            <Image
              src="/images/character-matters-logo.svg"
              alt="Character Matters logo"
              priority
              sizes="112px"
              fill
            />
          </div>
          <h1 className="text-5xl font-bold text-center text-rainbow drop-shadow-sm">
            Our Books 📚
          </h1>
        </div>

        <div className="max-w-6xl mx-auto mb-12">
          <AnimatedCard delay={0.1} className="bg-linear-to-br from-brand-purple-100 to-brand-yellow-100">
            <div className="flex items-center gap-6 flex-wrap justify-center mb-6">
              <div className="relative w-32 h-32 shrink-0">
                <Image 
                  src="/images/partners/lagos-ministry-education.svg" 
                  alt="Lagos State Ministry of Education" 
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1 min-w-[250px] text-center">
                <h2 className="text-3xl font-bold mb-2 text-brand-purple-600">
                  Approved by Lagos State Ministry of Education ✅
                </h2>
              </div>
            </div>
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
                key={book.title}
                delay={index * 0.05}
                className="flex h-full flex-col bg-white/90 shadow-sm transition-transform hover:-translate-y-1"
              >
                <div className="flex flex-col gap-4">
                  {book.image ? (
                    <div className="relative mx-auto h-56 w-40 overflow-hidden rounded-3xl border-4 border-brand-purple-200 shadow-lg">
                      <Image src={book.image} alt={book.title} fill sizes="160px" />
                    </div>
                  ) : (
                    <div className="flex h-56 w-full items-center justify-center rounded-3xl bg-linear-to-br from-blue-50 to-indigo-50 text-6xl">
                      {book.icon}
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-800">
                      {book.title}
                    </h3>
                    <span className="mt-2 inline-block rounded-full bg-brand-purple-200 px-3 py-1 text-sm font-semibold text-brand-purple-800">
                      {book.category}
                    </span>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedCard delay={0.7} className="bg-linear-to-br from-brand-yellow-50 to-brand-orange-100">
              <div className="text-center">
                <div className="text-5xl mb-4">🏫</div>
                <h3 className="text-2xl font-bold mb-3 text-brand-purple-600">For Schools</h3>
                <p className="text-gray-700">
                  Bulk orders available for schools and educational institutions. Contact us for special pricing.
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.8} className="bg-linear-to-br from-brand-purple-50 to-brand-yellow-50">
              <div className="text-center">
                <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
                <h3 className="text-2xl font-bold mb-3 text-brand-yellow-600">For Families</h3>
                <p className="text-gray-700">
                  Perfect for home learning and character development. Individual copies available.
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.9} className="bg-linear-to-br from-brand-yellow-50 to-brand-purple-50">
              <div className="text-center">
                <div className="text-5xl mb-4">🎁</div>
                <h3 className="text-2xl font-bold mb-3 text-brand-orange-600">Gift Sets</h3>
                <p className="text-gray-700">
                  Special gift sets available for birthdays, graduations, and special occasions.
                </p>
              </div>
            </AnimatedCard>
          </div>

          <div className="mt-12 text-center">
            <AnimatedCard delay={1.0} className="bg-linear-to-r from-brand-yellow-200 via-brand-purple-200 to-brand-yellow-200">
              <h2 className="text-3xl font-bold mb-4 text-brand-purple-700">
                Order Your Books Today! 📦
              </h2>
              <p className="text-xl text-gray-700 mb-6">
                Contact us to place your order or for more information about our books.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a 
                  href="mailto:Charactermattersng@gmail.com"
                  className="bg-brand-purple-500 hover:bg-brand-purple-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
                >
                  Email Us 📧
                </a>
                <a 
                  href="tel:08028289610"
                  className="bg-brand-yellow-500 hover:bg-brand-yellow-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
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
