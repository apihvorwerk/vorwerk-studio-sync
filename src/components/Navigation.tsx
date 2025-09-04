import { Calendar, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="bg-card border-b border-border shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 p-2">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/a/a7/Vorwerk.svg" 
                alt="Vorwerk Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-foreground tracking-tight">Vorwerk Studios</h1>
              <p className="text-sm text-muted-foreground font-medium">Booking System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Book Studio</span>
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span>Admin Login</span>
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="p-2">
              <div className="h-8 w-8 flex items-center justify-center bg-white rounded border border-gray-100 p-1">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a7/Vorwerk.svg" 
                  alt="Vorwerk Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;