# Capsic Care - Medical Healthcare Website

A modern, production-ready healthcare diagnostics website for Capsic Care with home sample collection services in Kolkata. Built with Next.js 16, React 19, Tailwind CSS, shadcn/ui, and Supabase backend integration.

## 🎯 Features

### **Core Functionality**
- **Multi-Page Architecture** - 8 main pages with optimized routing
- **Advanced Filtering** - Frontend-based filtering for lab tests with real-time updates
- **Responsive Design** - Mobile-first approach, fully responsive across all devices
- **Modern Animations** - Smooth transitions, fade-ins, and interactive elements
- **Glassmorphism UI** - Premium glass effect navbar with blur effects

### **Database Integration**
- **Supabase Backend** - Real-time database for all transactions
- **Partner Management** - Health & business partner registration and approval system
- **Booking System** - Complete checkout with promo and partner code tracking
- **Promo Codes** - Dynamic discount management with real-time validation
- **Customer Reports** - Analytics dashboard with booking and revenue tracking

### **Public Pages**
1. **Home** - Hero section with featured tests, packages, testimonials, and CTA
2. **Lab Tests** - Comprehensive test catalog with advanced filtering sidebar
3. **Health Packages** - Pre-built and customizable health package options
4. **Blog** - Health tips and wellness articles with category filtering
5. **Partner** - Health & business partner registration with 3-step forms
6. **Checkout** - Complete booking system with promo/partner codes
7. **About** - Company mission, values, team, and journey
8. **Contact** - Contact form, location, and FAQ section
9. **404** - Custom not found page

### **Admin Dashboard** (`/admin/dashboard`)
1. **Tests Management** - CRUD operations for lab tests
2. **Packages Management** - Create and manage health packages
3. **Categories Management** - Organize tests by health categories
4. **Blog Management** - Content management system for articles
5. **Partner Management** - Approve/reject health & business partners
6. **Promo Codes** - Create discount codes with percentage or fixed amounts
7. **Bookings** - Track all customer bookings with status updates
8. **Customer Reports** - Analytics by promo code, partner code, and date range

### **Components**
- **Navbar** - Sticky glassmorphic navigation with mobile menu
- **Footer** - Multi-column footer with social links and contact info
- **Cards** - TestCard, PackageCard, BlogCard components
- **Filter Sidebar** - Advanced filtering with collapsible sections
- **Sort Control** - Sorting options for test results

### **Design System**
- **Color Scheme** - Teal primary (#0D9488), green accent, orange highlights
- **Typography** - Geist Sans for clean, modern appearance
- **Components** - shadcn/ui components with custom theming
- **Animations** - Fade-in, slide-in, float, and pulse animations
- **Spacing** - Consistent 8-unit spacing system

## 🏗️ Project Structure

```
app/
├── (site)/                    # Main site layout group
│   ├── layout.tsx            # Shared layout with navbar/footer
│   ├── page.tsx              # Home page
│   ├── lab-tests/
│   │   └── page.tsx          # Lab tests with filters
│   ├── health-packages/
│   │   └── page.tsx          # Health packages page
│   ├── blog/
│   │   └── page.tsx          # Blog articles
│   ├── partner/
│   │   └── page.tsx          # Partnership page
│   ├── about/
│   │   └── page.tsx          # About us page
│   ├── contact/
│   │   └── page.tsx          # Contact page
│   └── not-found.tsx         # 404 page
├── layout.tsx                # Root layout
└── globals.css               # Global styles

components/
├── navbar.tsx                # Navigation with mobile menu
├── footer.tsx                # Footer with links
├── test-card.tsx             # Lab test card component
├── package-card.tsx          # Health package card
├── blog-card.tsx             # Blog post card
├── filter-sidebar.tsx        # Advanced filter controls
└── sort-control.tsx          # Sort dropdown

hooks/
└── use-filters.ts            # Custom hook for filtering logic

lib/
├── data.ts                   # Mock data and interfaces
└── utils.ts                  # Utility functions

public/                        # Static assets
tailwind.config.ts            # Tailwind configuration
```

## 📊 Mock Data

The application includes comprehensive mock data:
- **12+ Health Categories** (Cardiac, Diabetes, Thyroid, etc.)
- **12 Lab Tests** with pricing, organs, and home collection info
- **7 Health Packages** with customizable benefits
- **6 Blog Posts** with categories and read times
- **4 Customer Testimonials** with ratings
- **2 Partnership Programs** (Ambassador + QSC)

## 🎨 Design Features

### **Glassmorphism Navbar**
- Backdrop blur effect with semi-transparent background
- Sticky positioning with smooth transitions
- Mobile-responsive hamburger menu
- WhatsApp "Book Now" CTA button

### **Color System (3-5 Colors)**
1. **Teal (#0D9488)** - Primary brand color
2. **Green (#10b981)** - Secondary/accents
3. **Orange (#f97316)** - Call-to-action highlights
4. **Gray scales** - Neutral backgrounds and text
5. **White/Dark** - Light/dark mode support

### **Animations**
- `fade-in` - Content entrance with opacity and translation
- `slide-in` - Sidebar and mobile menu animations
- `float` - Floating elements for visual interest
- `pulse-soft` - Subtle pulsing for emphasis
- `btn-hover` - Scale and shadow on button hover
- `card-hover` - Lift effect on card interactions

## 🔍 Filtering System

The `use-filters` hook enables advanced filtering with:
- **Search** - By test name and description
- **Category** - Filter by health categories
- **Price Range** - Min/max price sliders
- **Organs** - Body system filtering
- **Gender** - Gender-specific tests
- **Features** - Home collection, special offers
- **Sorting** - By price, discount, name, or popularity

## 📱 Responsive Breakpoints

- **Mobile** - 320px and up (full-width filters as drawer)
- **Tablet** - 768px (md) breakpoint
- **Desktop** - 1024px (lg) breakpoint
- **Large** - 1280px+ (xl, 2xl)

## 🌙 Dark Mode

Built-in dark mode support with Tailwind's dark variant:
- Automatic theme detection
- Custom dark color tokens
- Smooth transitions between modes

## 🚀 Getting Started

### **Installation**
```bash
# Clone the repository
git clone <repo-url>

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### **Environment Variables**
Required for Supabase integration:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Admin Panel Access**
Navigate to `/admin/auth` and login with:
- **Email**: `capsiccare@gmail.com`
- **Password**: `#Uddin09`

After login, access the full admin dashboard at `/admin/dashboard`

## 📞 Contact Integration

All contact methods link directly to:
- **WhatsApp** - +91 8910260709
- **Email** - capsiccare@gmail.com
- **Phone** - +91 8910260709

Social media links included:
- Facebook, Instagram, YouTube, Twitter/X, Threads

## 🔄 Workflow

### **User Journey**
1. User visits home page with featured services
2. Explores lab tests with advanced filtering
3. Discovers health packages and saves money
4. Reads blog articles for health tips
5. Learns about partnership opportunities
6. Books through WhatsApp or phone contact

### **Data Flow**
- Mock data from `lib/data.ts`
- Filter hook manages state with useMemo optimization
- Components render based on filtered data
- All CTAs route to WhatsApp/phone (no backend needed)

## 🎯 Production Readiness

### **SEO Optimization**
- Semantic HTML with proper heading hierarchy
- Meta tags and Open Graph support
- Mobile-friendly viewport settings
- Schema.org markup ready

### **Accessibility**
- WCAG 2.1 AA compliant
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Screen reader optimized

### **Performance**
- Next.js 16 with Turbopack
- Optimized images and assets
- Client-side filtering (no server load)
- Code splitting and lazy loading ready

### **Security**
- No sensitive data in frontend
- WhatsApp for contact (encrypted)
- No authentication required for demo
- XSS protection via React's built-in escaping

## 📦 Dependencies

- **Next.js 16** - React framework
- **React 19** - UI library
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **Supabase** - Backend database and real-time updates
- **Vercel Analytics** - Performance monitoring
- **Vercel Speed Insights** - Core Web Vitals tracking

## 🎓 Learning Resources

### **Key Patterns**
- React hooks for state management
- Client-side filtering with useMemo
- Responsive grid layouts with Tailwind
- Custom animations with Tailwind keyframes
- Mobile-first design approach

### **Best Practices**
- Semantic HTML structure
- Component composition and reusability
- CSS utility-first approach
- Responsive design patterns
- Accessibility standards

## 📝 Future Enhancements

Potential features for scaling:
- Backend API integration for real data
- User authentication and profiles
- Booking system with payment integration
- Admin dashboard for content management
- Email notifications system
- Advanced analytics and reporting

## 📄 License

Built for Capsic Care - Medical Healthcare Diagnostics

---

**Built with ❤️ using Next.js 16, React 19, and Tailwind CSS**
