'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Fragment } from 'react'
import { Activity, Users, Stethoscope, Handshake, UserCircle } from 'lucide-react'

export function TopBreadcrumbs() {
  const pathname = usePathname()
  
  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean)
  const isHome = pathSegments.length === 0

  if (isHome) return null

  return (
    <div className="bg-muted/20 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.map((segment, index) => {
              const href = `/${pathSegments.slice(0, index + 1).join('/')}`
              const isLast = index === pathSegments.length - 1
              const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

              return (
                <Fragment key={href}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  )
}

export function ExploreMore() {
  return (
    <div className="bg-primary/5 border-t mt-12 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-2xl font-semibold mb-6">Explore More</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/services" className="flex items-center gap-2 bg-background border px-4 py-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm">
            <Activity className="w-4 h-4" /> Services
          </Link>
          <Link href="/doctors" className="flex items-center gap-2 bg-background border px-4 py-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm">
            <Stethoscope className="w-4 h-4" /> Doctors
          </Link>
          <Link href="/health-camps" className="flex items-center gap-2 bg-background border px-4 py-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm">
            <Users className="w-4 h-4" /> Health Camps
          </Link>
          <Link href="/partner" className="flex items-center gap-2 bg-background border px-4 py-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm">
            <Handshake className="w-4 h-4" /> Partner With Us
          </Link>
          <Link href="/sktaslimuddin" className="flex items-center gap-2 bg-background border px-4 py-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm">
            <UserCircle className="w-4 h-4" /> Founder & CEO
          </Link>
        </div>
      </div>
    </div>
  )
}
