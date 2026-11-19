'use client'

import { BlogCard } from '@/components/blog-card'
import { blogArticles } from '@/lib/blog-content'
import { useState } from 'react'

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    'all',
    ...new Set(blogArticles.map((post) => post.category)),
  ]

  const filteredPosts =
    selectedCategory === 'all'
      ? blogArticles
      : blogArticles.filter((post) => post.category === selectedCategory)

  return (
    <div className="w-full bg-white dark:bg-[#0a0e14]">
      {/* Header */}
      <section className="pt-20 pb-12 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              Health Tips & Articles
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-200 max-w-2xl">
              Stay informed with our latest articles on health, wellness, and diagnostics.
            </p>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 pt-4">
              {(categories as string[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ease-out ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white shadow-lg'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-teal-300 dark:hover:border-teal-400'
                  }`}
                >
                  {cat === 'all' ? 'All Articles' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                No articles found
              </h3>
              <p className="text-slate-600 dark:text-slate-200">
                Please try another category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Stay Updated
          </h2>
          <p className="text-slate-600 dark:text-slate-200">
            Get the latest health tips and wellness insights delivered to your inbox.
          </p>

          <form className="flex gap-2 mt-6 flex-col sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium btn-hover hover:shadow-lg"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Other Resources
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Test Preparation Guide',
                description:
                  'Learn how to prepare for different lab tests to ensure accurate results.',
                icon: '📋',
              },
              {
                title: 'Health Check FAQ',
                description:
                  'Common questions about health checkups and lab tests answered.',
                icon: '❓',
              },
              {
                title: 'Home Collection Process',
                description:
                  'Understand how our home collection service works and what to expect.',
                icon: '🏥',
              },
            ].map((resource, idx) => (
              <div
                key={idx}
                className="card-hover p-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 space-y-4 text-center"
              >
                <div className="text-5xl">{resource.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {resource.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-200">
                  {resource.description}
                </p>
                <button className="text-teal-600 dark:text-teal-300 font-semibold hover:text-teal-700 dark:hover:text-teal-300 transition-all duration-300 ease-out">
                  Learn More →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
