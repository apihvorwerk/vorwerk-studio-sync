import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface AdminBookingFormData {
  fullName: string;
  studio: string;
  session: string;
  date: Date | null;
  status: "pending" | "approved" | "rejected";
}

type BookingStatus = "pending" | "approved" | "rejected";

const studios = [
  { id: "experience-store", name: "Experience Store", sessions: ["11:00 AM - 7:00 PM"] },
  { id: "studio-1", name: "Studio 1 (Main Studio)", sessions: ["10:00 AM - 1:00 PM", "2:00 PM - 5:00 PM", "10:00 AM - 5:00 PM (Full Day)"] },
  { id: "studio-2", name: "Studio 2", sessions: ["10:00 AM - 1:00 PM", "2:00 PM - 5:00 PM", "10:00 AM - 5:00 PM (Full Day)"] },
  { id: "studio-3", name: "Studio 3 (Non Halal)", sessions: ["10:00 AM - 1:00 PM", "2:00 PM - 5:00 PM", "10:00 AM - 5:00 PM (Full Day)"] },
];

const checkBookingConflicts = async (studio: string, session: string, date: string) => {
  const { data: existingBookings, error } = await supabase
    .from('bookings')
    .select('session, status')
    .eq('studio', studio)
    .eq('date', date)
    .neq('status', 'rejected');

  if (error) {
    console.error('Error checking booking conflicts:', error);
    throw error;
  }

  const isFullDay = session.includes('Full Day');
  const hasFullDayBooking = existingBookings?.some(booking => 
    booking.session.includes('Full Day')
  );

  // If trying to book full day and there are existing bookings
  if (isFullDay && existingBookings && existingBookings.length > 0) {
    return { hasConflict: true, message: 'Cannot book full day - there are existing bookings for this date' };
  }

  // If trying to book regular session but there's already a full day booking
  if (!isFullDay && hasFullDayBooking) {
    return { hasConflict: true, message: 'Cannot book this session - full day is already booked for this date' };
  }

  // Check for exact session conflict
  const sessionConflict = existingBookings?.some(booking => 
    booking.session === session
  );

  if (sessionConflict) {
    return { hasConflict: true, message: 'This session is already booked for the selected date' };
  }

  return { hasConflict: false };
};

interface AdminBookingFormProps {
  onBookingCreated: () => void;
  onClose: () => void;
  selectedDate?: Date;
}

const AdminBookingForm = ({ onBookingCreated, onClose, selectedDate }: AdminBookingFormProps) => {
  const [formData, setFormData] = useState<AdminBookingFormData>({
    fullName: "",
    studio: "",
    session: "",
    date: selectedDate || null,
    status: "approved", // Default to approved for admin bookings
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedStudio = studios.find(s => s.id === formData.studio);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.studio || !formData.session || !formData.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for booking conflicts
      const dateString = formData.date ? new Date(formData.date).toISOString().split('T')[0] : '';
      const conflictCheck = await checkBookingConflicts(formData.studio, formData.session, dateString);
      
      if (conflictCheck.hasConflict) {
        toast({
          title: "Booking Conflict",
          description: conflictCheck.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const booking = {
        team_leader_name: formData.fullName,
        team_leader_id: "ADMIN-BOOKING", // Default ID for admin bookings
        email: "admin@vorwerk.com", // Default email for admin bookings
        phone: "N/A", // Default phone for admin bookings
        studio: formData.studio,
        session: formData.session,
        date: formData.date ? new Date(formData.date).toISOString() : null,
        notes: "Admin manual booking",
        status: formData.status,
        created_at: new Date().toISOString(),
      };

      // Save to database
      const { data, error } = await supabase
        .from('bookings')
        .insert([booking])
        .select();
      
      if (error) {
        console.error('Error saving booking:', error);
        throw error;
      }
      
      toast({
        title: "Booking Created",
        description: `Manual booking has been created with status: ${formData.status}.`,
        variant: "default",
      });

      // Notify parent component to refresh data
      onBookingCreated();
      onClose();
    } catch (error) {
      console.error('Booking creation error:', error);
      toast({
        title: "Creation Failed",
        description: "There was an error creating the booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
        <CardHeader className="text-center bg-gradient-subtle rounded-t-lg relative px-4 py-6 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl sm:text-2xl text-foreground">Create Manual Booking</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">Add a booking directly as an admin</p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter full name"
                className="transition-colors focus:ring-primary h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studio" className="text-sm font-medium">Studio *</Label>
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
              <Label htmlFor="session" className="text-sm font-medium">Time *</Label>
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
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1 h-11 text-base"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-11 text-base font-medium" 
                variant="gradient"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Booking"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookingForm;
