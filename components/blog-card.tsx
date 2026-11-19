import Link from 'next/link'
import { BlogPost } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Clock, ArrowRight } from 'lucide-react'

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  const postDate = new Date(post.date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <article className="card-hover bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden group flex flex-col">
      {/* Featured Image */}
      {post.image && (
        <div className="relative w-full h-48 bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        </div>
      )}

      {/* Background Gradient */}
      <div className="h-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500" />

      <div className="p-6 space-y-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className="text-teal-600 border-teal-200 bg-teal-50 dark:bg-teal-900/20"
            >
              {post.category}
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-200">
              {postDate}
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-teal-600 transition-all duration-300 ease-out">
            {post.title}
          </h3>
        </div>

        {/* Excerpt */}
        <p className="text-sm text-slate-600 dark:text-slate-200 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-200">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{post.readTime} min read</span>
          </div>
          <span className="text-slate-500 dark:text-slate-200">
            By {post.author}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-3" />

        {/* CTA */}
        <Link
          href={`/blog/${post.id}`}
          className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-300 font-medium hover:gap-3 transition-all duration-300 ease-out group/link"
        >
          <span>Read Article</span>
          <ArrowRight
            size={16}
            className="group-hover/link:translate-x-1 transition-all duration-300 ease-out"
          />
        </Link>
      </div>
    </article>
  )
}
