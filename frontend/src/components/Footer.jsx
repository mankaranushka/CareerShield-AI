import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 pt-20 pb-10 border-t border-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6 group">
              <svg viewBox="0 0 32 32" width="28" height="28" className="transform group-hover:scale-110 transition-transform">
                <path d="M16 2L4 8v8c0 7.18 5.12 13.9 12 15.4C22.88 29.9 28 23.18 28 16V8L16 2z" fill="url(#shield-grad-f)" opacity="0.9"/>
                <path d="M14 17l-3-3 1.4-1.4L14 14.2l5.6-5.6L21 10l-7 7z" fill="#fff"/>
                <defs>
                  <linearGradient id="shield-grad-f" x1="4" y1="2" x2="28" y2="32">
                    <stop offset="0%" stopColor="#10b981"/>
                    <stop offset="100%" stopColor="#34d399"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-xl font-bold tracking-tight text-white">CareerShield <span className="text-emerald-400">AI</span></span>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              Your AI-powered career companion. Powering them toward success.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Features</a></li>
              <li><a href="/resume-scanner.html" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Resume Scanner</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Legal &amp; Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <p>&copy; 2026 CareerShield AI. All rights reserved. Built with 🛡️ for students everywhere.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-emerald-400 transition-colors" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-emerald-400 transition-colors" aria-label="Facebook">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-emerald-400 transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-emerald-400 transition-colors" aria-label="Discord">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
