import { blogArticles } from '@/lib/blog-content'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import { notFound } from 'next/navigation'
import { FormattedText } from '@/components/ui/formatted-text'

export async function generateStaticParams() {
  return blogArticles.map((article) => ({
    id: article.id,
  }))
}

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const article = blogArticles.find((a) => a.id === id)

  if (!article) {
    notFound()
  }

  const postDate = new Date(article.date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Get related articles (same category, excluding current)
  const relatedArticles = blogArticles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 3)

  return (
    <div className="w-full bg-white dark:bg-[#0a0e14]">
      {/* Header Navigation */}
      <div className="sticky top-16 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-300 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-all duration-300 ease-out"
          >
            <ArrowLeft size={18} />
            Back to Articles
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <section className="pt-12 pb-8 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Category & Meta */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-block px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-medium">
                {article.category}
              </span>
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-200">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  {postDate}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  {article.readTime} min read
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              {article.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                {article.author.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {article.author}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-200">
                  Health & Wellness Expert
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose dark:prose-invert max-w-none">
            <div className="space-y-6 text-slate-700 dark:text-slate-200">
              {article.content.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('##')) {
                  return (
                    <h2
                      key={idx}
                      className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4"
                    >
                      {paragraph.replace('## ', '')}
                    </h2>
                  )
                }
                if (paragraph.startsWith('###')) {
                  return (
                    <h3
                      key={idx}
                      className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-3"
                    >
                      {paragraph.replace('### ', '')}
                    </h3>
                  )
                }
                if (paragraph.startsWith('-')) {
                  return (
                    <ul key={idx} className="list-disc list-inside space-y-2">
                      {paragraph.split('\n').map((item, i) => (
                        <li key={i} className="text-base leading-relaxed">
                          {item.replace('- ', '')}
                        </li>
                      ))}
                    </ul>
                  )
                }
                return (
                  <p key={idx} className="text-base leading-relaxed">
                    <FormattedText text={paragraph} />
                  </p>
                )
              })}
            </div>
          </article>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Ready for Your Health Checkup?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-200 max-w-2xl mx-auto">
            Book your lab tests with Capsic Care and get professional diagnostics with convenient home collection.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/lab-tests"
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 ease-out"
            >
              Browse Tests
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 border-2 border-teal-500 text-teal-600 dark:text-teal-300 font-semibold rounded-lg hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-all duration-300 ease-out"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">
              Related Articles
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {relatedArticles.map((relArticle) => {
                const relDate = new Date(relArticle.date).toLocaleDateString(
                  'en-IN',
                  {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }
                )
                return (
                  <Link
                    key={relArticle.id}
                    href={`/blog/${relArticle.id}`}
                    className="group card-hover bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="h-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500" />
                    <div className="p-6 space-y-3">
                      <span className="inline-block text-xs font-medium text-teal-600 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded">
                        {relArticle.category}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors line-clamp-2">
                        {relArticle.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-200 line-clamp-2">
                        {relArticle.excerpt}
                      </p>
                      <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-200 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span>{relDate}</span>
                        <span>{relArticle.readTime} min</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog */}
      <section className="py-8 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-300 font-semibold hover:text-teal-700 dark:hover:text-teal-300 transition-all duration-300 ease-out"
        >
          <ArrowLeft size={18} />
          Back to All Articles
        </Link>
      </section>
    </div>
  )
}
