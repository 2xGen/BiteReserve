import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-primary-200 border-t border-primary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="col-span-2 md:col-span-2">
            <span className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4 block">BiteReserve</span>
            <p className="text-xs sm:text-sm text-primary-300 mb-4 max-w-md">
              A demand-tracking platform for restaurants, designed to capture high-intent diners at the moment of decision.
            </p>
          </div>
          
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-4">Product</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-xs sm:text-sm text-primary-300 hover:text-white transition-colors block"
                >
                  About
                </Link>
              </li>
              <li>
                <a
                  href="#example"
                  className="text-xs sm:text-sm text-primary-300 hover:text-white transition-colors block"
                >
                  How It Works
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-4">Company</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <a
                  href="https://2xgen.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-primary-300 hover:text-white transition-colors block"
                >
                  Partner with Us
                </a>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-xs sm:text-sm text-primary-300 hover:text-white transition-colors block"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-xs sm:text-sm text-primary-300 hover:text-white transition-colors block"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 sm:pt-8 border-t border-primary-800 pb-16 sm:pb-0">
          <p className="text-[10px] sm:text-xs text-primary-400 text-center">
            © {new Date().getFullYear()} BiteReserve
          </p>
        </div>
      </div>
    </footer>
  )
}
