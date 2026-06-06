import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <svg className="h-7 w-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-white text-lg font-bold">Toolshop</span>
            </div>
            <p className="text-sm leading-relaxed">
              Your one-stop shop for professional tools. Quality hand tools, power tools, storage, and measuring instruments for DIY enthusiasts and professionals alike.
            </p>
            <p className="text-xs mt-3 text-gray-500">
              Practice Software Testing Application — for QA training purposes.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/?category_id=cat-1" className="hover:text-white transition-colors">Hand Tools</Link></li>
              <li><Link to="/?category_id=cat-6" className="hover:text-white transition-colors">Power Tools</Link></li>
              <li><Link to="/?category_id=cat-11" className="hover:text-white transition-colors">Storage</Link></li>
              <li><Link to="/?category_id=cat-14" className="hover:text-white transition-colors">Measuring</Link></li>
              <li><Link to="/?is_rental=true" className="hover:text-white transition-colors">Rentals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/auth/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/account/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link to="/account/favorites" className="hover:text-white transition-colors">Favorites</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Toolshop. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <Link to="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
