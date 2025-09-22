import React, { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import BookingForm from '@/components/BookingForm';
import BookingCalendar from '@/components/BookingCalendar';
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
      name: 'Thermomix Experience Store - Level G',
      description: 'Interactive Thermomix TM7 demonstrations and hands-on cooking experiences',
      capacity: '20 people',
      duration: '11:00 AM - 7:00 PM',
      features: ['Demo Kitchen', '5 Thermomix 7', 'Customer Lounge'],
      image: '/image.jpg',
      popular: true
    },
    {
      id: 'studio-1',
      name: 'STUDIO 1 (MAIN STUDIO) Level 1',
      description: 'Versatile Cooking & Demonstration Experience',
      capacity: 'Maximum 60 participants per session',
      duration: 'MORNING 10:00 AM – 1:00 PM | AFTERNOON 2:00 PM – 5:00 PM | FULL DAY 10:00 AM - 5:00PM',
      features: ['2 x Thermomix® TM7 available', 'Screen Display', 'PA System', 'Live Camera'],
      image: '/Studio 1.jpg',
      popular: true,
      minBooking: 'Minimum booking requirement: 25 participants'
    },
    {
      id: 'studio-2',
      name: 'STUDIO 2 Level 1',
      description: 'Versatile Cooking & Demonstration Experience',
      capacity: 'Maximum 8 participants per session',
      duration: 'MORNING 10:00 AM – 1:00 PM | AFTERNOON 2:00 PM – 5:00 PM | FULL DAY 10:00 AM - 5:00PM',
      features: ['1 x Thermomix® TM7 available'],
      image: '/Studio 2 and 3.jpg'
    },
    {
      id: 'studio-3',
      name: 'STUDIO 3 Level 1 (NON HALAL)',
      description: 'Versatile Cooking & Demonstration Experience',
      capacity: 'Maximum 8 participants per session',
      duration: 'MORNING 10:00 AM – 1:00 PM | AFTERNOON 2:00 PM – 5:00 PM | FULL DAY 10:00 AM - 5:00PM',
      features: ['1 x Thermomix® TM7 available'],
      image: '/Studio 2 and 3.jpg'
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />
      
      {/* Main Content */}
      <main id="main-content" className="relative">
        {/* Vorwerk Logo Section */}
        <section className="py-6 sm:py-8 bg-gradient-to-b from-background to-muted/20">
          <div className="container-responsive">
            <div className="flex justify-center">
              <img 
                src="/Vorwerk_TM_M_green_RGB.svg" 
                alt="Vorwerk Logo" 
                className="w-48 sm:w-64 md:w-80 h-auto" 
              />
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 lg:py-24">
          <div className="container-responsive">
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
              Thermomix® TM7
                <span className="text-primary block sm:inline sm:ml-3">
                  @ Bangsar Store
                </span>
              </h1>

              {/* Hero Description */}
              <p className="text-responsive-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the world-class Thermomix® TM7 with cutting-edge technology. Perfect for cooking, meal preparation, demonstrations and creative culinary explorations.
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
                    {studio.image && studio.image !== '/api/placeholder/400/250' ? (
                      <img 
                        src={studio.image} 
                        alt={studio.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Monitor className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">{studio.name}</p>
                        </div>
                      </div>
                    )}
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
                          {studio.id === 'experience-store' ? studio.duration : 'Session Times'}
                        </Badge>
                      </div>

                      {studio.id === 'experience-store' ? (
                        // Simple layout for Experience Store
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
                      ) : (
                        // Detailed layout for Studios 1, 2, 3
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2">Session Times:</p>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>MORNING 10:00 AM – 1:00 PM</div>
                              <div>AFTERNOON 2:00 PM – 5:00 PM</div>
                              <div>FULL DAY 10:00 AM - 5:00PM</div>
                            </div>
                          </div>

                          {studio.minBooking && (
                            <div>
                              <p className="text-sm font-medium text-foreground mb-1">Capacity:</p>
                              <p className="text-xs text-muted-foreground">{studio.minBooking}</p>
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-medium text-foreground mb-2">Equipment:</p>
                            <div className="flex flex-wrap gap-1">
                              {studio.features.map((feature, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <Button 
                        className="w-full btn-responsive"
                        onClick={() => {
                          if (studio.id === 'experience-store') {
                            window.open('https://vorwerk-studio-sync.vercel.app/', '_blank');
                          } else {
                            const bookingSection = document.getElementById('booking-form');
                            bookingSection?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        {studio.id === 'experience-store' ? 'Call Admin and View Schedule' : `Book ${studio.name}`}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Booking Calendar Section */}
        <section className="spacing-responsive-lg bg-muted/30">
          <div className="container-responsive">
            <div className="text-center mb-12">
              <h2 className="text-responsive-2xl font-bold text-foreground mb-4">
                View Approved Bookings
              </h2>
              <p className="text-responsive text-muted-foreground max-w-2xl mx-auto">
                See who has booked each studio and when they're scheduled
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <BookingCalendar />
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
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg blur-sm"></div>
                <div className="relative bg-gradient-to-br from-primary to-primary/80 p-2 rounded-lg shadow-md">
                  <img 
                    src="/Vorwerk_TM_M_green_RGB.svg" 
                    alt="Vorwerk Logo" 
                    className="w-5 h-5 object-contain filter brightness-0 invert" 
                  />
                </div>
              </div>
              <div className="flex flex-col items-start">
                <span className="font-bold text-responsive-lg">Vorwerk Malaysia</span>
                <span className="text-sm text-muted-foreground -mt-1">Studios</span>
              </div>
            </div>
            <p className="text-responsive text-muted-foreground mb-4">
              Professional studio booking system
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-muted-foreground">
              <span> 2024 Vorwerk Malaysia</span>
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
