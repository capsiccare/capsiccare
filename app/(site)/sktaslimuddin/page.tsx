import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, MapPin, Globe, Mail, Heart, Building2, Stethoscope, Handshake, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sk. Taslimuddin | Founder & CEO | Capsic Care',
  description: 'Connect with Sk. Taslimuddin, Founder & CEO of Capsic Care for healthcare partnerships, health camps, assisted telemedicine and Healthcare Facility Centre opportunities.',
}

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
          CAPSIC CARE
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
          Sk. Taslimuddin
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-medium">
          Founder & CEO
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold mt-8 text-foreground/90">
          Building the Future of Primary Healthcare
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
          Making quality healthcare more accessible through Assisted Telemedicine and community-based healthcare.
        </p>
      </section>

      {/* Primary Actions */}
      <section className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
        <Button asChild size="lg" className="w-full sm:w-auto text-base">
          <Link href="tel:+919830225334">
            <Phone className="mr-2 h-5 w-5" />
            Call Now
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-base border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700">
          <Link href="https://wa.me/919830225334" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" />
            WhatsApp
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto text-base">
          <Link href="/partner">
            Become a Partner
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto text-base">
          <Link href="/health-camps">
            Organize a Health Camp
          </Link>
        </Button>
      </section>

      {/* About Section */}
      <section className="bg-muted/50 rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold mb-4">About Capsic Care</h3>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Capsic Care, led by Founder & CEO Sk. Taslimuddin, is building a comprehensive network of Assisted Telemedicine and Healthcare Facility Centres. Our mission is to bridge the gap in primary healthcare delivery, ensuring that communities have improved, affordable access to quality medical attention exactly when they need it most.
        </p>
      </section>

      {/* Partnerships Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h3 className="text-3xl font-bold tracking-tight">Partnership Opportunities</h3>
          <p className="text-muted-foreground mt-2">Join us in making healthcare accessible for everyone.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Heart className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Health Camps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Collaborate with us to organize community health camps, providing essential checkups and medical awareness at the grassroots level.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Building2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Healthcare Facility Centres</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Partner with us to establish and operate modern facility centres that serve as primary care hubs in your area.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Stethoscope className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Assisted Telemedicine</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Integrate our Assisted Telemedicine solutions to connect patients with expert doctors virtually, breaking geographical barriers.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Handshake className="h-10 w-10 text-primary mb-2" />
              <CardTitle>CSR & Institutional</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We work with corporations and institutions on impactful CSR initiatives focused on community health and wellness.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-card border rounded-3xl overflow-hidden shadow-sm">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-12 space-y-8">
            <div>
              <h3 className="text-3xl font-bold tracking-tight mb-2">Get in Touch</h3>
              <p className="text-muted-foreground">Reach out to discuss partnerships or inquiries.</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Phone</p>
                  <a href="tel:+919830225334" className="text-muted-foreground hover:text-primary transition-colors">
                    +91 98302 25334
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <a href="mailto:sktaslimuddin9@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                    sktaslimuddin9@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Website</p>
                  <a href="https://capsic.in" className="text-muted-foreground hover:text-primary transition-colors">
                    https://capsic.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Location</p>
                  <address className="text-muted-foreground not-italic leading-relaxed">
                    Bankra Bazar, Dewan Para Road,<br />
                    Domjur, Howrah – 711403,<br />
                    West Bengal, India
                  </address>
                </div>
              </div>
            </div>
          </div>
          <div className="min-h-[400px] h-full relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14736.036814234033!2d88.2709!3d22.6358!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f88365824c13a3%3A0x6b6e4e83c078024d!2sBankra%2C%20Howrah%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1707000000000!5m2!1sen!2sin"
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  )
}
