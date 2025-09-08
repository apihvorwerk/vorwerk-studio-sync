import React, { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import BookingForm from '@/components/BookingForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Smartphone,
  Monitor,
  Tablet,
  Zap,
  Shield,
  HeadphonesIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const studios = [
    {
      id: 'experience-store',
      name: 'Experience Store',
      description: 'Interactive product demonstrations and customer experiences',
      capacity: '20 people',
      duration: '11:00 AM - 7:00 PM',
      features: ['Demo Kitchen', 'Product Display', 'Customer Lounge'],
      rating: 4.9,
      image: '/api/placeholder/400/250',
      popular: true
    },
    {
      id: 'studio-1',
      name: 'Studio 1',
      description: 'Professional recording and content creation space',
      capacity: '8 people',
      duration: '2 sessions available',
      features: ['4K Recording', 'Professional Lighting', 'Sound Booth'],
      rating: 4.8,
      image: '/api/placeholder/400/250'
    },
    {
      id: 'studio-2',
      name: 'Studio 2',
      description: 'Versatile meeting and presentation room',
      capacity: '12 people',
      duration: '2 sessions available',
      features: ['Video Conferencing', '75" Display', 'Whiteboard'],
      rating: 4.7,
      image: '/api/placeholder/400/250'
    },
    {
      id: 'studio-3',
      name: 'Studio 3',
      description: 'Creative workshop and collaboration space',
      capacity: '15 people',
      duration: '2 sessions available',
      features: ['Flexible Layout', 'Creative Tools', 'Breakout Areas'],
      rating: 4.8,
      image: '/api/placeholder/400/250'
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />
      
      {/* Main Content */}
      <main id="main-content" className="relative">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="container-responsive spacing-responsive-lg">
            <div className={cn(
              "text-center transition-all duration-1000 transform",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}>
              {/* Hero Badge */}
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                <span>Book Your Perfect Studio</span>
              </div>

              {/* Hero Title */}
              <h1 className="text-responsive-3xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight">
                Book Your Perfect
                <span className="text-primary block sm:inline sm:ml-3">
                  Studio Space
                </span>
              </h1>

              {/* Hero Description */}
              <p className="text-responsive-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Experience world-class studio facilities with cutting-edge technology. 
                Perfect for recordings, meetings, presentations, and creative collaborations.
              </p>

              {/* Hero CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  size="lg" 
                  className="btn-responsive w-full sm:w-auto"
                  onClick={() => {
                    const bookingSection = document.getElementById('booking-form');
                    bookingSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="btn-responsive w-full sm:w-auto"
                  onClick={() => {
                    const studiosSection = document.getElementById('studios');
                    studiosSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  View Studios
                </Button>
              </div>

              {/* Stats */}
              <div className="grid-responsive sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div 
                      key={index}
                      className={cn(
                        "card-responsive text-center transition-all duration-500 transform hover:scale-105",
                        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      )}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <IconComponent className="h-8 w-8 text-primary mx-auto mb-3" />
                      <div className="text-responsive-2xl font-bold text-foreground mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          </div>
        </section>

        {/* Studios Section */}
        <section id="studios" className="spacing-responsive-lg bg-muted/30">
          <div className="container-responsive">
            <div className="text-center mb-12">
              <h2 className="text-responsive-2xl font-bold text-foreground mb-4">
                Our Studio Spaces
              </h2>
              <p className="text-responsive text-muted-foreground max-w-2xl mx-auto">
                Choose from our premium studio spaces, each designed for specific needs and experiences
              </p>
            </div>

            <div className="grid-responsive md:grid-cols-2 lg:grid-cols-2 gap-8">
              {studios.map((studio, index) => (
                <Card 
                  key={studio.id}
                  className={cn(
                    "overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1",
                    studio.popular && "ring-2 ring-primary"
                  )}
                >
                  {studio.popular && (
                    <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 text-center">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Monitor className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">{studio.name}</p>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-responsive-lg mb-2">
                          {studio.name}
                        </CardTitle>
                        <p className="text-responsive text-muted-foreground">
                          {studio.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-yellow-700">
                          {studio.rating}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {studio.capacity}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {studio.duration}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {studio.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button 
                        className="w-full btn-responsive"
                        onClick={() => {
                          const bookingSection = document.getElementById('booking-form');
                          bookingSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        Book {studio.name}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Booking Form Section */}
        <section id="booking-form" className="spacing-responsive-lg">
          <div className="container-responsive">
            <div className="text-center mb-12">
              <h2 className="text-responsive-2xl font-bold text-foreground mb-4">
                Ready to Book?
              </h2>
              <p className="text-responsive text-muted-foreground max-w-2xl mx-auto">
                Fill out the form below and we'll confirm your booking within 24 hours
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card className="card-responsive">
                <CardContent className="p-0">
                  <BookingForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="spacing-responsive bg-muted/30">
          <div className="container-responsive text-center">
            <div className="max-w-2xl mx-auto">
              <HeadphonesIcon className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-responsive-2xl font-bold text-foreground mb-4">
                Need Help?
              </h2>
              <p className="text-responsive text-muted-foreground mb-8">
                Our support team is available 24/7 to help you with your booking and answer any questions
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg" className="btn-responsive">
                  <HeadphonesIcon className="h-5 w-5 mr-2" />
                  Contact Support
                </Button>
                <Button variant="ghost" size="lg" className="btn-responsive">
                  View FAQ
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border spacing-responsive">
        <div className="container-responsive">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="font-bold text-responsive-lg">Vorwerk Studio Sync</span>
            </div>
            <p className="text-responsive text-muted-foreground mb-4">
              Professional studio booking system for modern businesses
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-muted-foreground">
              <span> 2024 Vorwerk Studio Sync</span>
              <span className="hidden sm:inline">•</span>
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <span className="hidden sm:inline">•</span>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
