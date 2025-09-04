import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                width="32"
                height="32"
                viewBox="0 0 100 100"
                className="w-8 h-8 md:w-10 md:h-10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="45" fill="#0066cc" stroke="#004499" strokeWidth="2"/>
                <text x="50" y="58" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold" fontFamily="Arial, sans-serif">
                  V
                </text>
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-bold text-foreground leading-tight">
                Vorwerk Studios
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground leading-tight">
                Booking System
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#booking" className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium">
              Book Studio
            </a>
            <a href="/admin" className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium">
              Admin
            </a>
            <Button variant="outline" size="sm" className="ml-4">
              Contact
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#booking"
                className="block px-3 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                📱 Book Studio
              </a>
              <a
                href="/admin"
                className="block px-3 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                🔐 Admin Dashboard
              </a>
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-center text-base py-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📞 Contact Support
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;