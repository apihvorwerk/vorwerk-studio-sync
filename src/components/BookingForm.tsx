import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { sendNewBookingNotification, validateEmailConfig } from "@/lib/emailService";

interface BookingFormData {
  teamLeaderName: string;
  teamLeaderId: string;
  email: string;
  phone: string;
  studio: string;
  session: string;
  date: Date | null;
  notes: string;
}

type BookingStatus = "pending" | "approved" | "rejected";

const studios = [
  { id: "experience-store", name: "Thermomix Experience Store - Level G", sessions: ["11:00 AM - 7:00 PM"] },
  { id: "studio-1", name: "Studio 1 - Level 1", sessions: ["10:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"] },
  { id: "studio-2", name: "Studio 2 - Level 1", sessions: ["10:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"] },
  { id: "studio-3", name: "Studio 3 - Level 1", sessions: ["10:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"] },
];

const saveBooking = async (booking: any) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select();
  
  if (error) {
    console.error('Error saving booking:', error);
    throw error;
  }
  
  return data;
};

const BookingForm = () => {
  const [formData, setFormData] = useState<BookingFormData>({
    teamLeaderName: "",
    teamLeaderId: "",
    email: "",
    phone: "",
    studio: "",
    session: "",
    date: null,
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedStudio = studios.find(s => s.id === formData.studio);
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7); // 7 days in advance

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.teamLeaderName || !formData.teamLeaderId || !formData.email || 
        !formData.phone || !formData.studio || !formData.session || !formData.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const booking = {
        team_leader_name: formData.teamLeaderName,
        team_leader_id: formData.teamLeaderId,
        email: formData.email,
        phone: formData.phone,
        studio: formData.studio,
        session: formData.session,
        date: formData.date ? new Date(formData.date).toISOString() : null,
        notes: formData.notes,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      // Save to database
      await saveBooking(booking);
      
      // Send email notification to admin
      const emailConfigValid = validateEmailConfig();
      if (emailConfigValid) {
        try {
          const emailSent = await sendNewBookingNotification(booking);
          if (emailSent) {
            console.log('Admin notification email sent successfully');
          } else {
            console.warn('Failed to send admin notification email');
          }
        } catch (emailError) {
          console.error('Email notification error:', emailError);
          // Don't fail the booking if email fails
        }
      } else {
        console.warn('Email configuration not set up. Skipping email notification.');
      }
      
      toast({
        title: "Booking Submitted",
        description: "Your booking request has been submitted for approval. Admin will be notified via email.",
        variant: "default",
      });

      // Reset form
      setFormData({
        teamLeaderName: "",
        teamLeaderId: "",
        email: "",
        phone: "",
        studio: "",
        session: "",
        date: null,
        notes: "",
      });
    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-medium">
      <CardHeader className="text-center bg-gradient-subtle rounded-t-lg px-4 py-6 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl text-foreground">Studio Booking Request</CardTitle>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">Book your studio session at least 7 days in advance</p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teamLeaderName" className="text-sm font-medium">Team Leader Name *</Label>
              <Input
                id="teamLeaderName"
                value={formData.teamLeaderName}
                onChange={(e) => setFormData(prev => ({ ...prev, teamLeaderName: e.target.value }))}
                placeholder="Enter full name"
                className="transition-colors focus:ring-primary h-11 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamLeaderId" className="text-sm font-medium">Team Leader ID *</Label>
              <Input
                id="teamLeaderId"
                value={formData.teamLeaderId}
                onChange={(e) => setFormData(prev => ({ ...prev, teamLeaderId: e.target.value }))}
                placeholder="e.g., 123456"
                className="transition-colors focus:ring-primary h-11 text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="name@gmail.com"
                className="transition-colors focus:ring-primary h-11 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+60 123 456 7890"
                className="transition-colors focus:ring-primary h-11 text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studio" className="text-sm font-medium">Studio Location *</Label>
              <Select 
                value={formData.studio} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, studio: value, session: "" }))}
              >
                <SelectTrigger className="transition-colors focus:ring-primary h-11 text-base">
                  <SelectValue placeholder="Select a studio" />
                </SelectTrigger>
                <SelectContent>
                  {studios.map((studio) => (
                    <SelectItem key={studio.id} value={studio.id} className="text-base py-3">
                      {studio.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session" className="text-sm font-medium">Session Time *</Label>
              <Select 
                value={formData.session} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, session: value }))}
                disabled={!formData.studio}
              >
                <SelectTrigger className="transition-colors focus:ring-primary h-11 text-base">
                  <SelectValue placeholder="Select session time" />
                </SelectTrigger>
                <SelectContent>
                  {selectedStudio?.sessions.map((session) => (
                    <SelectItem key={session} value={session} className="text-base py-3">
                      {session}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">Booking Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11 text-base",
                    !formData.date && "text-muted-foreground"
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
                  onSelect={(date) => setFormData(prev => ({ ...prev, date: date || null }))}
                  disabled={(date) => date < minDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Bookings must be made at least 7 days in advance
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special requirements or additional information..."
              rows={3}
              className="transition-colors focus:ring-primary text-base resize-none"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-medium" 
            variant="gradient"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Booking Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;