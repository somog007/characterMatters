import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-7xl font-black text-rainbow mb-6">404</h1>
      <p className="text-2xl text-gray-700 mb-8">Oops! The page you’re looking for doesn’t exist.</p>
      <Link href="/" className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-full">
        Go Home
      </Link>
    </div>
  );
}
