import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative z-10 mt-12 border-t border-purple-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold text-purple-800">Character Matters</h3>
            <p className="mt-2 text-sm text-gray-600">
              Building good character and sound morals in children and young adolescents.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-purple-700">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li>
                <Link href="/about" className="hover:text-purple-700">About</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-purple-700">Services</Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-purple-700">Gallery</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-purple-700">Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-purple-700">Contact</h4>
            <p className="mt-3 text-sm text-gray-700">Email: support@charactermatters.com</p>
            <p className="mt-1 text-sm text-gray-700">Lagos, Nigeria</p>
          </div>
        </div>

        <div className="mt-6 border-t border-purple-100 pt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Character Matters. All rights reserved.
        </div>
      </div>
    </footer>
  );
}