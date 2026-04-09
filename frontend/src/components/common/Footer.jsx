import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Instagram, Mail, Heart, MapPin, GalleryHorizontalEnd } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { icon: Mail, href: 'mailto:codecosmostech@gmail.com', label: 'Email' },
    { icon: Linkedin, href: 'https://linkedin.com/in/codecosmostech', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://x.com/codecosmostech', label: 'Twitter' },
    { icon: Instagram, href: 'https://www.instagram.com/codecosmostech/', label: 'Instagram' },
    { icon: Github, href: 'https://github.com/organizations/code-cosmos-tech', label: 'GitHub' },
  ];

  return (
    <footer className="relative mt-8 border-t border-dark-200 dark:border-dark-800">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-200/30 to-primary-300/50 
                      dark:via-primary-900/10 dark:to-primary-900/20 pointer-events-none" />

      <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 gradient-primary rounded-lg flex items-center justify-center shadow-md shadow-primary-500/30">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-primary-600">My Reading Journey</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400">Track, rate, and organize your reading adventures</p>
              </div>
            </div>
            <p className="text-dark-600 dark:text-dark-400 leading-relaxed max-w-md">
              Your personal companion for discovering and remembering the books that shape your journey.
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="font-bold text-xl text-end text-dark-900 dark:text-dark-50">Connect with us</h4>
            <div className="flex flex-row flex-wrap gap-3 justify-end">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-dark-200 dark:bg-dark-800 
                           flex items-center justify-center text-dark-600 dark:text-dark-400
                           hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-dark-50
                           transition-all duration-100 shadow-sm hover:shadow-lg hover:shadow-primary-500/30"
                  aria-label={label}
                >
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
            <div className="flex flex-row flex-wrap gap-6 justify-end text-sm text-dark-500 dark:text-dark-400">
              <p className="inline-flex items-center gap-1">
                <GalleryHorizontalEnd size={16} strokeWidth={2.5} className="text-dark-700 dark:text-dark-300"/>
                <span className="text-dark-700 dark:text-dark-300">
                  <b>v4.0.0</b>
                </span>
              </p>
              <p className="inline-flex items-center gap-1">
                <MapPin size={16} strokeWidth={2.5} className="text-dark-700 dark:text-dark-300"/>
                <span className="text-dark-700 dark:text-dark-300">
                  <b>India</b>
                </span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-dark-200 dark:border-dark-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-dark-500 dark:text-dark-400 text-center sm:text-left">
              © 2025 Code And Cosmos. Crafted with{' '}
              <Heart className="inline w-4 h-4 text-red-500 fill-red-500" />{' '}
              for readers.
            </p>
            <div className="flex gap-6 text-sm text-dark-500 dark:text-dark-400">
              <a href="/about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                About
              </a>
              <a href="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Privacy
              </a>
              <a href="/feedback" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Feedback
              </a>
              <a href="/terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Terms
              </a>
              <a href="/contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;