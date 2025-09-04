import Navigation from "@/components/Navigation";
import BookingForm from "@/components/BookingForm";
import { Building2, Clock, Users, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Vorwerk Studio <span className="text-primary">Booking System</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Book your studio sessions across our four premium locations. 
            Simple, professional, and efficient studio management.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center p-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <CardContent className="pt-6">
              <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">4 Studio Locations</h3>
              <p className="text-sm text-muted-foreground">Experience Store & Studios 1-3</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <CardContent className="pt-6">
              <Clock className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Flexible Sessions</h3>
              <p className="text-sm text-muted-foreground">Morning & afternoon time slots</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Team Management</h3>
              <p className="text-sm text-muted-foreground">Easy booking for team leaders</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Admin Approval</h3>
              <p className="text-sm text-muted-foreground">Secure approval workflow</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Book Your Studio Session
            </h2>
            <p className="text-muted-foreground">
              Fill out the form below to request a studio booking. All requests require admin approval.
            </p>
          </div>
          
          <BookingForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 Vorwerk Studio Booking System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
