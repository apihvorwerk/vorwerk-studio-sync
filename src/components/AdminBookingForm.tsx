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
  teamLeaderName: string;
  teamLeaderId: string;
  email: string;
  phone: string;
  studio: string;
  session: string;
  date: Date | null;
  notes: string;
  status: "pending" | "approved" | "rejected";
}

type BookingStatus = "pending" | "approved" | "rejected";

const studios = [
  { id: "experience-store", name: "Experience Store", sessions: ["11:00 AM - 7:00 PM"] },
  { id: "studio-1", name: "Studio 1", sessions: ["11:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"] },
  { id: "studio-2", name: "Studio 2", sessions: ["11:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"] },
  { id: "studio-3", name: "Studio 3", sessions: ["11:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"] },
];

interface AdminBookingFormProps {
  onBookingCreated: () => void;
  onClose: () => void;
  selectedDate?: Date;
}

const AdminBookingForm = ({ onBookingCreated, onClose, selectedDate }: AdminBookingFormProps) => {
  const [formData, setFormData] = useState<AdminBookingFormData>({
    teamLeaderName: "",
    teamLeaderId: "",
    email: "",
    phone: "",
    studio: "",
    session: "",
    date: selectedDate || null,
    notes: "",
    status: "approved", // Default to approved for admin bookings
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedStudio = studios.find(s => s.id === formData.studio);

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
        <CardHeader className="text-center bg-gradient-subtle rounded-t-lg relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl text-foreground">Create Manual Booking</CardTitle>
          <p className="text-muted-foreground">Add a booking directly as an admin</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamLeaderName">Team Leader Name *</Label>
                <Input
                  id="teamLeaderName"
                  value={formData.teamLeaderName}
                  onChange={(e) => setFormData(prev => ({ ...prev, teamLeaderName: e.target.value }))}
                  placeholder="Enter full name"
                  className="transition-colors focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamLeaderId">Team Leader ID *</Label>
                <Input
                  id="teamLeaderId"
                  value={formData.teamLeaderId}
                  onChange={(e) => setFormData(prev => ({ ...prev, teamLeaderId: e.target.value }))}
                  placeholder="e.g., TL123456"
                  className="transition-colors focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="name@vorwerk.com"
                  className="transition-colors focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+49 123 456 7890"
                  className="transition-colors focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studio">Studio Location *</Label>
                <Select 
                  value={formData.studio} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, studio: value, session: "" }))}
                >
                  <SelectTrigger className="transition-colors focus:ring-primary">
                    <SelectValue placeholder="Select a studio" />
                  </SelectTrigger>
                  <SelectContent>
                    {studios.map((studio) => (
                      <SelectItem key={studio.id} value={studio.id}>
                        {studio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session">Session Time *</Label>
                <Select 
                  value={formData.session} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, session: value }))}
                  disabled={!formData.studio}
                >
                  <SelectTrigger className="transition-colors focus:ring-primary">
                    <SelectValue placeholder="Select session time" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedStudio?.sessions.map((session) => (
                      <SelectItem key={session} value={session}>
                        {session}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Booking Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Select booking date"}
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
              <div className="space-y-2">
                <Label htmlFor="status">Booking Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: BookingStatus) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="transition-colors focus:ring-primary">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special requirements or additional information..."
                rows={3}
                className="transition-colors focus:ring-primary"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
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
