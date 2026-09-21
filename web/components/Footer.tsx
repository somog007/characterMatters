import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="relative z-10 mt-12 border-t border-purple-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <Image 
                src="/images/logo-icon.jpg" 
                alt="Character Matters Logo" 
                width={36} 
                height={36} 
                className="rounded-full shadow-sm"
              />
              <h3 className="text-lg font-bold text-purple-800">Character Matters</h3>
            </div>
            <p className="text-sm text-gray-600">
              Building good character and sound morals in children and young adolescents since 2012.
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <a 
                href="https://facebook.com/charactermattersng" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook"
                className="hover:scale-110 transition-transform"
              >
                <Image src="/images/social/facebook.svg" alt="Facebook" width={28} height={28} />
              </a>
              <a 
                href="https://instagram.com/charactermattersng" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram"
                className="hover:scale-110 transition-transform"
              >
                <Image src="/images/social/instagram.svg" alt="Instagram" width={28} height={28} />
              </a>
              <a 
                href="https://www.youtube.com/channel/UCX8jyQwm3ofvKuXttchHdJw" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="YouTube"
                className="hover:scale-110 transition-transform"
              >
                <Image src="/images/social/youtube.svg" alt="YouTube" width={28} height={28} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-purple-700">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li>
                <Link href="/about" className="hover:text-purple-700 font-medium">About Us</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-purple-700 font-medium font-medium">Services & Media</Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-purple-700 font-medium font-medium">Gallery</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-purple-700 font-medium font-medium">Contact Us</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-purple-700">Contact Info</h4>
            <p className="mt-3 text-sm text-gray-700">Email: charactermattersng@gmail.com</p>
            <p className="mt-1 text-sm text-gray-700 font-medium">Phone: 08028289610</p>
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