import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Instagram, Mail, Heart, MapPin, GalleryHorizontalEnd } from 'lucide-react';
import AppLogo from './AppLogo';

const Footer = () => {
  const socialLinks = [
    { icon: Mail, href: 'mailto:codecosmostech@gmail.com', label: 'Email' },
    { icon: Linkedin, href: 'https://linkedin.com/in/codecosmostech', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://x.com/codecosmostech', label: 'Twitter' },
    { icon: Instagram, href: 'https://www.instagram.com/codecosmostech/', label: 'Instagram' },
    { icon: Github, href: 'https://github.com/organizations/code-cosmos-tech', label: 'GitHub' },
  ];

  return (
    <footer className="mt-8 border-t border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">

          {/* Brand */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <AppLogo size={26} />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-xl sm:text-2xl text-dark-900 dark:text-dark-50">My Reading Journey</h3>
                <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400">Track, rate, and organize your reading adventures</p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-dark-600 dark:text-dark-400 leading-relaxed max-w-md">
              Your personal companion for discovering and remembering the books that shape your journey.
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-base sm:text-lg text-dark-900 dark:text-dark-50 md:text-end">Connect with us</h4>
            <div className="flex flex-row flex-wrap gap-3 md:justify-end">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 flex items-center justify-center text-dark-500 dark:text-dark-400 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                  aria-label={label}
                >
                  <Icon size={17} />
                </motion.a>
              ))}
            </div>
            <div className="flex flex-row flex-wrap gap-4 sm:gap-6 md:justify-end text-xs sm:text-sm text-dark-500 dark:text-dark-400">
              <p className="inline-flex items-center gap-1.5">
                <GalleryHorizontalEnd size={13} className="text-dark-400 dark:text-dark-500" />
                <span>v5.0.0</span>
              </p>
              <p className="inline-flex items-center gap-1.5">
                <MapPin size={13} className="text-dark-400 dark:text-dark-500" />
                <span>India</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-dark-200 dark:border-dark-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs sm:text-sm text-dark-400 dark:text-dark-500 text-center sm:text-left">
              © 2025 Code And Cosmos. Crafted with{' '}
              <Heart className="inline w-3.5 h-3.5 text-rose-500 fill-rose-500" />{' '}
              for readers.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-2 text-xs sm:text-sm text-dark-400 dark:text-dark-500">
              {['About', 'Privacy', 'Terms', 'Feedback', 'Contact', 'Support'].map((item) => (
                <a key={item} href={`/${item.toLowerCase()}`}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors whitespace-nowrap">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
