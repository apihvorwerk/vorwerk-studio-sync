import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, X } from 'lucide-react';

interface BookingSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingSuccessPopup: React.FC<BookingSuccessPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup Content */}
      <Card className="relative w-full max-w-md mx-4 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-xl text-foreground">
            Booking Successfully Submitted!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your booking request has been submitted successfully. An admin will review and approve or reject your request.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="font-medium text-foreground mb-1">What happens next?</p>
            <ul className="text-left text-muted-foreground space-y-1">
              <li>• Admin will review your booking request</li>
              <li>• You'll receive an email notification with the decision</li>
              <li>• Check your email for updates</li>
            </ul>
          </div>
          
          <Button 
            onClick={onClose}
            className="w-full h-11 text-base font-medium"
            size="lg"
          >
            Okay
          </Button>
        </CardContent>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Close popup"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </Card>
    </div>
  );
};

export default BookingSuccessPopup;
