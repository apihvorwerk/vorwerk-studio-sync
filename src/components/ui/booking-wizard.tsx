import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Clock, 
  MapPin, 
  User, 
  Mail, 
  Phone,
  FileText,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface BookingData {
  // Step 1: Personal Information
  teamLeaderName: string;
  teamLeaderId: string;
  email: string;
  phone: string;
  
  // Step 2: Studio Selection
  studio: string;
  session: string;
  date: Date | null;
  
  // Step 3: Additional Details
  notes: string;
  requirements: string[];
  teamSize: number;
  
  // Step 4: Confirmation
  agreedToTerms: boolean;
}

interface BookingWizardProps {
  onComplete: (data: BookingData) => void;
  onCancel: () => void;
  initialData?: Partial<BookingData>;
}

const studios = [
  { 
    id: "experience-store", 
    name: "Experience Store", 
    sessions: ["11:00 AM - 7:00 PM"],
    capacity: 20,
    features: ["Interactive Displays", "Product Demos", "Customer Experience"]
  },
  { 
    id: "studio-1", 
    name: "Studio 1", 
    sessions: ["10:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"],
    capacity: 12,
    features: ["Professional Lighting", "Video Equipment", "Sound System"]
  },
  { 
    id: "studio-2", 
    name: "Studio 2", 
    sessions: ["10:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"],
    capacity: 8,
    features: ["Intimate Setting", "Whiteboard", "Presentation Screen"]
  },
  { 
    id: "studio-3", 
    name: "Studio 3", 
    sessions: ["10:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"],
    capacity: 15,
    features: ["Flexible Layout", "Moveable Furniture", "Natural Light"]
  },
];

const requirements = [
  "Video Recording Equipment",
  "Audio Recording Setup",
  "Presentation Screen",
  "Whiteboard/Flipchart",
  "Catering Setup",
  "Photography Equipment",
  "Live Streaming Setup",
  "Additional Seating"
];

const BookingWizard = ({ onComplete, onCancel, initialData = {} }: BookingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingData>({
    teamLeaderName: "",
    teamLeaderId: "",
    email: "",
    phone: "",
    studio: "",
    session: "",
    date: null,
    notes: "",
    requirements: [],
    teamSize: 1,
    agreedToTerms: false,
    ...initialData
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const selectedStudio = studios.find(s => s.id === formData.studio);
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 14);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.teamLeaderName.trim()) newErrors.teamLeaderName = "Name is required";
        if (!formData.teamLeaderId.trim()) newErrors.teamLeaderId = "Team Leader ID is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
        if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
        break;
      
      case 2:
        if (!formData.studio) newErrors.studio = "Please select a studio";
        if (!formData.session) newErrors.session = "Please select a session time";
        if (!formData.date) newErrors.date = "Please select a date";
        break;
      
      case 3:
        if (formData.teamSize < 1 || formData.teamSize > 50) newErrors.teamSize = "Team size must be between 1 and 50";
        break;
      
      case 4:
        if (!formData.agreedToTerms) newErrors.agreedToTerms = "Please agree to the terms and conditions";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onComplete(formData);
      toast({
        title: "Booking Submitted",
        description: "Your booking request has been submitted for approval.",
        variant: "default",
      });
    }
  };

  const updateFormData = (updates: Partial<BookingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const toggleRequirement = (requirement: string) => {
    const current = formData.requirements;
    const updated = current.includes(requirement)
      ? current.filter(r => r !== requirement)
      : [...current, requirement];
    updateFormData({ requirements: updated });
  };

  const renderStepIndicator = () => (
    <div className="w-full mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Step {currentStep} of {totalSteps}
        </h2>
        <Badge variant="outline" className="text-xs sm:text-sm">
          {Math.round(progress)}% Complete
        </Badge>
      </div>
      <Progress value={progress} className="h-2 sm:h-3" />
      
      {/* Step indicators */}
      <div className="flex justify-between mt-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors",
              step < currentStep ? "bg-success text-success-foreground" :
              step === currentStep ? "bg-primary text-primary-foreground" :
              "bg-muted text-muted-foreground"
            )}>
              {step < currentStep ? <Check className="h-4 w-4" /> : step}
            </div>
            <span className="text-xs mt-1 text-center hidden sm:block">
              {step === 1 && "Personal"}
              {step === 2 && "Studio"}
              {step === 3 && "Details"}
              {step === 4 && "Confirm"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6">
        <User className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-primary" />
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Personal Information</h3>
        <p className="text-sm text-muted-foreground">Tell us about yourself and your team</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="teamLeaderName" className="text-sm font-medium">Team Leader Name *</Label>
          <Input
            id="teamLeaderName"
            value={formData.teamLeaderName}
            onChange={(e) => updateFormData({ teamLeaderName: e.target.value })}
            placeholder="Enter your full name"
            className={cn("h-11 text-base", errors.teamLeaderName && "border-destructive")}
          />
          {errors.teamLeaderName && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.teamLeaderName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamLeaderId" className="text-sm font-medium">Team Leader ID *</Label>
          <Input
            id="teamLeaderId"
            value={formData.teamLeaderId}
            onChange={(e) => updateFormData({ teamLeaderId: e.target.value })}
            placeholder="e.g., TL123456"
            className={cn("h-11 text-base", errors.teamLeaderId && "border-destructive")}
          />
          {errors.teamLeaderId && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.teamLeaderId}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="name@vorwerk.com"
            className={cn("h-11 text-base", errors.email && "border-destructive")}
          />
          {errors.email && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            placeholder="+49 123 456 7890"
            className={cn("h-11 text-base", errors.phone && "border-destructive")}
          />
          {errors.phone && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.phone}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6">
        <MapPin className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-primary" />
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Studio Selection</h3>
        <p className="text-sm text-muted-foreground">Choose your preferred studio and time</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Studio Location *</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {studios.map((studio) => (
              <Card 
                key={studio.id} 
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  formData.studio === studio.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                )}
                onClick={() => updateFormData({ studio: studio.id, session: "" })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{studio.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {studio.capacity} seats
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {studio.features.map((feature, index) => (
                      <p key={index} className="text-xs text-muted-foreground">• {feature}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {errors.studio && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.studio}
            </p>
          )}
        </div>

        {selectedStudio && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Session Time *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedStudio.sessions.map((session) => (
                <Card
                  key={session}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    formData.session === session ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                  )}
                  onClick={() => updateFormData({ session })}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{session}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
            {errors.session && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.session}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium">Booking Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-11 text-base",
                  !formData.date && "text-muted-foreground",
                  errors.date && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {formData.date ? format(formData.date, "PPP") : "Select booking date"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.date || undefined}
                onSelect={(date) => updateFormData({ date: date || null })}
                disabled={(date) => date < minDate}
                initialFocus
                className="p-3"
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.date}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Bookings must be made at least 14 days in advance
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6">
        <FileText className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-primary" />
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Additional Details</h3>
        <p className="text-sm text-muted-foreground">Help us prepare for your session</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="teamSize" className="text-sm font-medium">Expected Team Size *</Label>
          <Input
            id="teamSize"
            type="number"
            min="1"
            max="50"
            value={formData.teamSize}
            onChange={(e) => updateFormData({ teamSize: parseInt(e.target.value) || 1 })}
            className={cn("h-11 text-base", errors.teamSize && "border-destructive")}
          />
          {errors.teamSize && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.teamSize}
            </p>
          )}
          {selectedStudio && formData.teamSize > selectedStudio.capacity && (
            <p className="text-xs text-warning flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Team size exceeds studio capacity ({selectedStudio.capacity})
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Special Requirements (Optional)</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {requirements.map((requirement) => (
              <Card
                key={requirement}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-sm",
                  formData.requirements.includes(requirement) ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                )}
                onClick={() => toggleRequirement(requirement)}
              >
                <CardContent className="p-3 flex items-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center",
                    formData.requirements.includes(requirement) ? "bg-primary border-primary" : "border-muted-foreground"
                  )}>
                    {formData.requirements.includes(requirement) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm">{requirement}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => updateFormData({ notes: e.target.value })}
            placeholder="Any special requirements, agenda details, or additional information..."
            rows={4}
            className="text-base resize-none"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-success" />
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Confirm Your Booking</h3>
        <p className="text-sm text-muted-foreground">Please review your booking details</p>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Personal Information</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{formData.teamLeaderName}</p>
                <p>{formData.teamLeaderId}</p>
                <p>{formData.email}</p>
                <p>{formData.phone}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-2">Booking Details</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{selectedStudio?.name}</p>
                <p>{formData.session}</p>
                <p>{formData.date ? format(formData.date, "PPP") : ""}</p>
                <p>Team Size: {formData.teamSize}</p>
              </div>
            </div>
          </div>

          {formData.requirements.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Special Requirements</h4>
              <div className="flex flex-wrap gap-1">
                {formData.requirements.map((req) => (
                  <Badge key={req} variant="secondary" className="text-xs">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {formData.notes && (
            <div>
              <h4 className="font-medium text-sm mb-2">Additional Notes</h4>
              <p className="text-sm text-muted-foreground">{formData.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={formData.agreedToTerms}
            onChange={(e) => updateFormData({ agreedToTerms: e.target.checked })}
            className="mt-1"
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed">
            I agree to the terms and conditions and understand that this booking requires admin approval. 
            I will receive email notifications regarding the status of my booking.
          </Label>
        </div>
        {errors.agreedToTerms && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.agreedToTerms}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-subtle rounded-t-lg">
          <CardTitle className="text-center text-xl sm:text-2xl">Studio Booking Request</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {renderStepIndicator()}
          
          <div className="min-h-[400px] sm:min-h-[500px]">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onCancel : prevStep}
              className="flex-1 h-11 text-base"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? "Cancel" : "Previous"}
            </Button>
            
            <Button
              onClick={currentStep === totalSteps ? handleSubmit : nextStep}
              className="flex-1 h-11 text-base font-medium"
              variant="gradient"
            >
              {currentStep === totalSteps ? "Submit Booking" : "Next"}
              {currentStep < totalSteps && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingWizard;
