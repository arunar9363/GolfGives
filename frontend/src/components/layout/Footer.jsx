import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Twitter, Instagram, Facebook } from 'lucide-react';

const Footer = () => (
  <footer className="bg-surface border-t border-theme mt-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-xl text-primary">GolfGives</span>
          </div>
          <p className="text-muted text-sm leading-relaxed max-w-sm">
            Play golf. Win prizes. Change lives. A platform where your passion for golf creates real impact for charities around the world.
          </p>
          <div className="flex gap-3 mt-6">
            {[Twitter, Instagram, Facebook].map((Icon, i) => (
              <a key={i} href="#"
                className="w-9 h-9 bg-black/5 dark:bg-white/5 hover:bg-brand-500/15 rounded-lg flex items-center justify-center text-muted hover:text-brand-500 transition-all">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-primary font-semibold mb-4">Platform</h4>
          <div className="flex flex-col gap-3">
            {[['How It Works', '/how-it-works'], ['Pricing', '/pricing'], ['Charities', '/charities']].map(([label, to]) => (
              <Link key={to} to={to} className="text-muted hover:text-primary text-sm transition-colors">{label}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-primary font-semibold mb-4">Legal</h4>
          <div className="flex flex-col gap-3">
            {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Responsible Gaming'].map(label => (
              <a key={label} href="#" className="text-muted hover:text-primary text-sm transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-theme mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-faint text-sm">© {new Date().getFullYear()} GolfGives. All rights reserved.</p>
        <p className="text-faint text-sm flex items-center gap-1.5">
          Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> for a better world
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
