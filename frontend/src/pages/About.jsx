import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Heart, TrendingUp, Target,
  Zap, Shield, Waypoints, Lock, Sparkles,
  Palette, BookCopy
} from 'lucide-react';
import Hero from '../components/common/Hero';

const About = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Track Your Reading',
      description: 'Keep a detailed record of every book you read with custom notes and ratings.'
    },
    {
      icon: TrendingUp,
      title: 'View Your Stats',
      description: 'Visualize your reading habits with insightful statistics and progress tracking.'
    },
    {
      icon: Heart,
      title: 'Curate Favorites',
      description: 'Mark your favorite books and create personalized reading lists.'
    },
    {
      icon: Target,
      title: 'Set Goals',
      description: 'Define reading goals and track your progress throughout the year.'
    },
    {
      icon: Zap,
      title: 'Fast & Intuitive',
      description: 'Clean, modern interface designed for speed and ease of use.'
    },
    {
      icon: Shield,
      title: 'Private & Secure',
      description: 'Your reading data is encrypted and always remains private.'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Books Tracked' },
    { value: '5K+', label: 'Active Readers' },
    { value: '4.9', label: 'User Rating' },
    { value: '99.9%', label: 'Uptime' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 
                  dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 mt-4">

      {/* Hero Section */}
      <Hero
        title="My Reading Journey"
        subtitle="Your personal companion for a more organized and memorable reading life"
        icon={Waypoints}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">

        {/* Mission Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold font-serif text-dark-900 dark:text-dark-50 mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-dark-600 dark:text-dark-400 leading-relaxed">
            We believe that reading is one of life's greatest pleasures. My Reading Journey was created
            to help readers like you organize, track, and celebrate every book you read. Whether
            you're a casual reader or a bookworm, we're here to make your reading journey more memorable,
            enjoyable and meaningful.
          </p>
        </motion.section>

        {/* Features Grid */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold font-serif text-dark-900 dark:text-dark-50 mb-4">
              Everything You Need To Know
            </h2>
            <p className="text-xl text-dark-600 dark:text-dark-400">
              Powerful features to enhance your reading experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-hover p-6 text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-flex w-16 h-16 items-center justify-center rounded-2xl 
                             bg-gradient-to-br from-primary-500 to-primary-600 mb-4 
                             shadow-xl shadow-primary-500/30"
                  >
                    <Icon className="text-white" size={32} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-dark-600 dark:text-dark-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Stats Section */}
        <section className="card p-12 text-center bg-gradient-to-br from-primary-500 to-primary-600 
                          text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold font-serif mb-12"
            >
              Trusted by Thousands of Users
            </motion.h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-white/80 text-lg">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="card p-8 md:p-12">
            <h2 className="text-4xl font-bold font-serif text-center text-dark-900 dark:text-dark-50 mb-6">
              Our Story
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-4 
                          text-dark-600 dark:text-dark-400">
              <p>
                My Reading Journey was born from a simple frustration: keeping track of books read,
                ratings, and personal notes was scattered across notebooks, spreadsheets, and
                various apps.
              </p>
              <p>
                We wanted something better; a dedicated space that feels like your own personal
                library, where every book you've read has a home, and where you can see your
                reading journey unfold over time.
              </p>
              <p>
                Today, My Reading Journey helps thousands of readers organize their reading lives,
                discover patterns in their reading habits, and celebrate their love of books.
              </p>
              <p className="text-right">
                That Frustrated Person <br /> - Jay Manoj Dholu
              </p>
            </div>
          </div>
        </motion.section>

        {/* Values Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Simple',
              description: 'Clean, intuitive design that gets out of your way',
              icon: Sparkles
            },
            {
              title: 'Private',
              description: 'Your reading data belongs to you, always',
              icon: Lock
            },
            {
              title: 'Delightful',
              description: 'Beautiful animations and thoughtful interactions',
              icon: Palette
            }
          ].map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-8 text-center"
            >
              <div className="flex justify-center mb-4">
                { <value.icon className="w-10 h-10" /> }
              </div>
              <h3 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-2">
                {value.title}
              </h3>
              <p className="text-dark-600 dark:text-dark-400">
                {value.description}
              </p>
            </motion.div>
          ))}
        </section>

        {/* Team Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold font-serif text-dark-900 dark:text-dark-50 mb-6">
            Built with Love
          </h2>
          <p className="text-xl text-dark-600 dark:text-dark-400 max-w-3xl mx-auto mb-8">
            My Reading Journey is crafted by a small team of book lovers and developers who are
            passionate about creating tools that make reading more enjoyable.
          </p>
          <div className="flex justify-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 
                          flex items-center justify-center text-white text-2xl font-bold 
                          shadow-xl shadow-primary-500/30">
              <BookCopy className="w-10 h-10" />
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;