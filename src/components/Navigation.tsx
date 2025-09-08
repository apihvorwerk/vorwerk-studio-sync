import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, User, Menu, X, Home, Settings, LogIn, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle mobile menu close on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        overlayRef.current &&
        overlayRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleBookStudio = () => {
    navigate('/');
    setIsMobileMenuOpen(false);
    // Scroll to booking form if on homepage
    setTimeout(() => {
      const bookingSection = document.getElementById('booking-form');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const navigationLinks = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
      description: 'Back to homepage'
    },
    {
      label: 'Book Studio',
      action: handleBookStudio,
      icon: Calendar,
      description: 'Schedule a studio session',
      primary: true
    },
    {
      label: 'Contact',
      path: '/contact',
      icon: Phone,
      description: 'Get in touch with us'
    }
  ];

  return (
    <>
      {/* Main Navigation */}
      <nav 
        className={cn(
          "nav-responsive backdrop-blur-sm transition-all duration-300",
          isScrolled && "bg-background/95 shadow-sm"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container-responsive">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="logo flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
              aria-label="Vorwerk Studio Sync - Home"
            >
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="font-bold text-responsive-lg">
                <span className="hidden sm:inline">Vorwerk Studio</span>
                <span className="sm:hidden">Studio</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="desktop-nav hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={cn(
                  "nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive('/') 
                    ? "bg-primary text-primary-foreground" 
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                Home
              </Link>
              
              <Button
                onClick={handleBookStudio}
                variant="default"
                size="sm"
                className="ml-2"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Studio
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-nav-toggle md:hidden touch-target"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <div className={cn("hamburger-menu", isMobileMenuOpen && "open")}>
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div
        ref={overlayRef}
        className={cn("mobile-nav-overlay", isMobileMenuOpen && "open")}
        aria-hidden={!isMobileMenuOpen}
      />

      {/* Mobile Navigation Menu */}
      <div
        ref={mobileMenuRef}
        id="mobile-navigation"
        className={cn("mobile-nav", isMobileMenuOpen && "open")}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-nav-title"
      >
        {/* Mobile Nav Header */}
        <div className="mobile-nav-header">
          <h2 id="mobile-nav-title" className="text-lg font-semibold">
            Navigation
          </h2>
          <button
            className="mobile-nav-close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Nav Links */}
        <nav role="navigation" aria-label="Mobile navigation">
          <ul className="mobile-nav-links">
            {navigationLinks.map((link, index) => {
              const IconComponent = link.icon;
              const isLinkActive = link.path ? isActive(link.path) : false;
              
              return (
                <li key={index}>
                  {link.path ? (
                    <Link
                      to={link.path}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                        isLinkActive && "active",
                        link.primary && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                      aria-describedby={`nav-desc-${index}`}
                    >
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{link.label}</div>
                        <div 
                          id={`nav-desc-${index}`}
                          className="text-xs opacity-70 mt-0.5"
                        >
                          {link.description}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <button
                      onClick={link.action}
                      className={cn(
                        "w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left",
                        link.primary && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                      aria-describedby={`nav-desc-${index}`}
                    >
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{link.label}</div>
                        <div 
                          id={`nav-desc-${index}`}
                          className="text-xs opacity-70 mt-0.5"
                        >
                          {link.description}
                        </div>
                      </div>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Nav Footer */}
        <div className="mt-auto pt-6 border-t border-border">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">Vorwerk Studio Sync</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Professional studio booking system
            </p>
          </div>
          
          {/* Quick Contact */}
          <div className="mt-4 space-y-2">
            <a
              href="mailto:support@vorwerk-studio.com"
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>support@vorwerk-studio.com</span>
            </a>
            <a
              href="tel:+49-123-456-7890"
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>+49 123 456 7890</span>
            </a>
          </div>
        </div>
      </div>

      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-br-md"
      >
        Skip to main content
      </a>
    </>
  );
};

export default Navigation;