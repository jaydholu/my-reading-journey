import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  BookOpen, Star, BarChart2, Heart, ListChecks,
  ArrowRight, Download, Upload, BookPlus, Users,
  Check, ChevronRight, Sparkles
} from 'lucide-react';
import AppLogo from '../components/common/AppLogo';


/* ─── Static data ─────────────────────────────────────── */
const HERO_BOOKS = [
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-Help',
    rating: 4.5,
    pages: 320,
    bg: 'from-amber-400 to-orange-500',
    rotate: '-rotate-3',
    floatDelay: 0,
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    genre: 'Fiction',
    rating: 5.0,
    pages: 208,
    bg: 'from-emerald-400 to-teal-600',
    rotate: 'rotate-1',
    floatDelay: 0.4,
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    genre: 'History',
    rating: 4.0,
    pages: 443,
    bg: 'from-violet-400 to-indigo-600',
    rotate: 'rotate-3',
    floatDelay: 0.8,
  },
];

const FEATURES = [
  {
    icon: BookPlus,
    title: 'Track every book you read',
    desc: 'Log books with dates, ratings, your personal review, cover image, format, and 10+ metadata fields. Your reading history, exactly how you lived it.',
    accent: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  },
  {
    icon: BarChart2,
    title: 'Understand your reading habits',
    desc: "Genre breakdowns, monthly reading trends, page counts, average ratings — your personal stats dashboard shows patterns you didn't know existed.",
    accent: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Heart,
    title: 'Curate your favorites',
    desc: "Mark the books that moved you. Filter by favorites, revisit them anytime, and build a collection you're genuinely proud of.",
    accent: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400',
  },
  {
    icon: ListChecks,
    title: 'Never lose a "to-read" title',
    desc: 'A smart wishlist with priority levels, price tracking, and acquisition notes. Know exactly which books are next — and where to get them.',
    accent: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  },
];

const STEPS = [
  {
    step: '1',
    title: 'Create your free account',
    desc: 'Sign up in 30 seconds. No credit card, no hidden fees — just your email and a password.',
    icon: Users,
    color: 'from-primary-500 to-primary-600',
  },
  {
    step: '2',
    title: 'Add books you have read',
    desc: "Search, fill in details, upload a cover, leave your rating. Each book takes under a minute to log.",
    icon: BookPlus,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    step: '3',
    title: 'Watch your library grow',
    desc: 'Browse your collection, explore stats, build your wishlist, and export your data anytime.',
    icon: Sparkles,
    color: 'from-violet-500 to-indigo-600',
  },
];

const STATS = [
  { value: '10K+', label: 'Books tracked' },
  { value: '5K+', label: 'Active readers' },
  { value: '4.9', label: 'Average rating' },
];

/* ─── Sub-components ──────────────────────────────────── */
function StarRow({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(1, Math.max(0, rating - (i - 1)));
        return (
          <div key={i} className="relative" style={{ width: size, height: size }}>
            <Star size={size} className="text-dark-300" fill="currentColor" />
            {fill > 0 && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="text-amber-400" fill="currentColor" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BookCard({ book, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.15, duration: 0.6, ease: 'easeOut' }}
      className={`relative w-44 sm:w-48 bg-white dark:bg-dark-900 rounded-2xl shadow-xl overflow-hidden border border-dark-100 dark:border-dark-800 ${book.rotate} flex-shrink-0`}
    >
      {/* Animated float */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5 + index * 0.5, repeat: Infinity, ease: 'easeInOut', delay: book.floatDelay }}
      >
        {/* Cover */}
        <div className={`h-28 bg-gradient-to-br ${book.bg} flex items-end p-3`}>
          <div>
            <p className="text-white font-bold text-sm leading-tight line-clamp-2">{book.title}</p>
            <p className="text-white/70 text-xs mt-0.5 truncate">{book.author}</p>
          </div>
        </div>
        {/* Info */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <StarRow rating={book.rating} size={12} />
            <span className="text-xs font-semibold text-dark-700 dark:text-dark-300">{book.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium">
              {book.genre}
            </span>
            <span className="text-xs text-dark-400">{book.pages} pp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-dark-500 dark:text-dark-400">Finished reading</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SectionReveal({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Landing page ────────────────────────────────────── */
const Landing = () => {
  const featuresRef = useRef(null);

  const scrollToFeatures = (e) => {
    e.preventDefault();
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 overflow-x-hidden">

      {/* ── Minimal landing nav ───────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-dark-950/90 backdrop-blur-md border-b border-dark-100 dark:border-dark-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center shadow-md shadow-primary-500/30 group-hover:scale-105 transition-transform">
              <AppLogo size={32} />
            </div>
            <span className="font-serif font-bold text-2xl text-gradient hidden sm:block">My Reading Journey</span>
          </Link>

          {/* Nav actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="px-3 sm:px-4 py-2 rounded-xl text-md font-medium text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="px-4 sm:px-5 py-2 rounded-xl text-md font-medium btn-primary"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 bg-gradient-to-b from-primary-50/60 via-white to-white dark:from-dark-900 dark:via-dark-950 dark:to-dark-950 relative overflow-hidden">

        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-400/10 dark:bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">

          {/* Left: Text */}
          <div className="text-center lg:text-left order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6"
            >
              <Sparkles size={14} />
              Your personal reading companion
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif  tracking-wide text-4xl sm:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-dark-50 leading-tight mb-6"
            >
              Every book you've read,{' '}
              <span className="text-gradient">beautifully organized.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-dark-600 dark:text-dark-400 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0"
            >
              Track your reading history, rate books, manage a wishlist, and explore stats that reveal how you read — all in one private, beautiful app.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8"
            >
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base btn-primary shadow-lg shadow-primary-500/30"
              >
                Start for free
                <ArrowRight size={18} />
              </Link>
              <button
                onClick={scrollToFeatures}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base btn-secondary"
              >
                See how it works
              </button>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center lg:justify-start text-sm text-dark-500 dark:text-dark-400"
            >
              {['Free forever', 'No credit card needed', 'Export your data anytime'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={14} className="text-green-500" />
                  {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: Floating book cards */}
          <div className="order-2 hidden lg:flex items-center justify-center lg:justify-end">
            <div className="relative flex flex-row lg:flex-col gap-4 lg:gap-5 items-center lg:items-end">
              {/* Decorative ring behind cards */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                  className="w-72 h-72 rounded-full border border-primary-200/50 dark:border-primary-800/30"
                />
              </div>

              {/* Show 2 cards on mobile, 3 on lg */}
              {HERO_BOOKS.map((book, i) => (
                <div key={book.title} className={i === 2 ? 'hidden lg:block' : ''}>
                  <BookCard book={book} index={i} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────── */}
      <SectionReveal>
        <section className="border-y border-dark-100 dark:border-dark-800 bg-dark-50 dark:bg-dark-900/50 py-8 sm:py-10 px-4">
          <div className="max-w-2xl mx-auto grid grid-cols-3 gap-6 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="font-serif text-3xl sm:text-4xl font-bold text-gradient">{value}</p>
                <p className="text-sm sm:text-base text-dark-500 dark:text-dark-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </SectionReveal>

      {/* ── Features ─────────────────────────────────────── */}
      <section ref={featuresRef} className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <SectionReveal className="text-center mb-14 sm:mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-3">What you can do</p>
            <h2 className="font-serif tracking-wide text-3xl  sm:text-4xl lg:text-5xl font-bold text-dark-900 dark:text-dark-50 leading-snug">
              Everything a reader needs,<br className="hidden sm:block" /> nothing they don't.
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <SectionReveal key={f.title}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="card p-6 sm:p-8 h-full hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className={`w-11 h-11 rounded-xl ${f.accent} flex items-center justify-center mb-5`}>
                      <Icon size={22} />
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-dark-900 dark:text-dark-50 mb-3 leading-snug">
                      {f.title}
                    </h3>
                    <p className="text-dark-600 dark:text-dark-400 leading-relaxed text-sm sm:text-base">
                      {f.desc}
                    </p>
                  </motion.div>
                </SectionReveal>
              );
            })}
          </div>

          {/* Import/export callout */}
          <SectionReveal className="mt-5 sm:mt-6">
            <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-50 to-amber-50 dark:from-primary-900/40 dark:to-dark-900 border-primary-200 dark:border-primary-800/50">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex gap-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                    <Download size={20} />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                    <Upload size={20} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-dark-900 dark:text-dark-50 text-base sm:text-lg mb-1">
                    Your data belongs to you
                  </h3>
                  <p className="text-sm sm:text-base text-dark-600 dark:text-dark-400">
                    Export your entire library as JSON or CSV at any time. Import from a spreadsheet or a previous backup. No lock-in, ever.
                  </p>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-dark-50 dark:bg-dark-900/40">
        <div className="max-w-6xl mx-auto">
          <SectionReveal className="text-center mb-14 sm:mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-3">Getting started</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-900 dark:text-dark-50">
              Up and running in minutes.
            </h2>
          </SectionReveal>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-gradient-to-r from-primary-300 via-emerald-300 to-violet-300 dark:from-primary-800 dark:via-emerald-800 dark:to-violet-800" />

            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <SectionReveal key={s.step}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="relative text-center"
                  >
                    {/* Step icon */}
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg mb-5 relative z-10`}>
                      <Icon className="text-white" size={32} />
                    </div>

                    {/* Arrow between steps (mobile) */}
                    {i < STEPS.length - 1 && (
                      <div className="flex justify-center md:hidden my-4 text-dark-300 dark:text-dark-700">
                        <ChevronRight size={20} className="rotate-90" />
                      </div>
                    )}

                    <div className="inline-flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Step {s.step}</span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-dark-900 dark:text-dark-50 mb-3 leading-snug">
                      {s.title}
                    </h3>
                    <p className="text-dark-600 dark:text-dark-400 text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
                      {s.desc}
                    </p>
                  </motion.div>
                </SectionReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── App preview strip ─────────────────────────────── */}
      <SectionReveal>
        <section className="py-16 sm:py-20 px-4 sm:px-6 border-y border-dark-100 dark:border-dark-800">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-dark-400 dark:text-dark-500 mb-8">
              Built for every kind of reader
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {[
                'Rate with half-star precision',
                'Dark & light mode',
                'Upload book covers',
                'Filter & sort your library',
                'Monthly reading trends',
                'Genre breakdown charts',
                'Priority wishlist',
                'CSV & JSON export',
                'Email verification',
                'Secure JWT auth',
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── Final CTA ────────────────────────────────────── */}
      <SectionReveal>
        <section className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-100 dark:bg-amber-900/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-2xl mx-auto text-center">
            {/* Open book SVG illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto mb-8 w-20 h-20"
            >
              <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Book pages */}
                <path d="M40 18 C40 18 14 15 12 20 L12 62 C14 58 40 60 40 60 Z" fill="#fae6c0" stroke="#eb9d44" strokeWidth="1.5" />
                <path d="M40 18 C40 18 66 15 68 20 L68 62 C66 58 40 60 40 60 Z" fill="#fdf4e1" stroke="#eb9d44" strokeWidth="1.5" />
                <path d="M40 18 L40 60 C41 61 39 61 40 60 Z" fill="#eb9d44" />
                {/* Text lines on left page */}
                <line x1="20" y1="30" x2="35" y2="30" stroke="#dc7f34" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                <line x1="20" y1="37" x2="33" y2="37" stroke="#dc7f34" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                <line x1="20" y1="44" x2="35" y2="44" stroke="#dc7f34" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                <line x1="20" y1="51" x2="30" y2="51" stroke="#dc7f34" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                {/* Star on right page */}
                <path d="M54 28 L56 34 L62 34 L57 38 L59 44 L54 40 L49 44 L51 38 L46 34 L52 34 Z" fill="#eb9d44" opacity="0.8" />
              </svg>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-900 dark:text-dark-50 mb-5 leading-tight"
            >
              Ready to start your reading journey?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-dark-600 dark:text-dark-400 mb-10 leading-relaxed"
            >
              Join readers who have already organized over 10,000 books. Free to use, always.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-xl btn-primary shadow-xl shadow-primary-500/30"
              >
                Create free account
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-xl btn-secondary"
              >
                Sign in
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-10 text-md text-dark-400 dark:text-dark-500"
            >
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                Sign in here
              </Link>
            </motion.p>
          </div>
        </section>
      </SectionReveal>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-dark-100 dark:border-dark-800 py-10 px-4 sm:px-6 bg-dark-50 dark:bg-dark-900/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-sm">
              <AppLogo size={22} />
            </div>
            <span className="font-serif font-bold text-base text-gradient">My Reading Journey</span>
          </Link>
          <p className="text-sm text-dark-500 dark:text-dark-400 text-center sm:text-right">
            © 2025 Code And Cosmos · Crafted for readers
          </p>
          <div className="flex gap-5 text-sm text-dark-500 dark:text-dark-400">
            <Link to="/about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy</Link>
            <Link to="/signup" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium text-primary-600 dark:text-primary-400">Get started</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
