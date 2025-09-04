// src/pages/AdminDashboard.tsx
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { sendBookingStatusNotification, validateEmailConfig } from "@/lib/emailService";
import { format } from "date-fns";
import { CalendarDays, Clock, User, Phone, Mail, Building, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

type BookingStatus = "pending" | "approved" | "rejected";

interface Booking {
  id: string;
  team_leader_name: string;
  team_leader_id: string;
  email: string;
  phone: string;
  studio: string;
  session: string;
  date: string; // ISO
  notes: string;
  status: BookingStatus;
  created_at: string;
}

const ALL_STUDIOS = [
  { id: "experience-store", name: "Experience Store", sessions: ["11:00 AM - 7:00 PM"] },
  { id: "studio-1", name: "Studio 1", sessions: ["11:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"] },
  { id: "studio-2", name: "Studio 2", sessions: ["11:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"] },
  { id: "studio-3", name: "Studio 3", sessions: ["11:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"] },
];

const DAILY_TOTAL_SLOTS = ALL_STUDIOS.reduce((sum, s) => sum + s.sessions.length, 0); // 7

const getBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
  
  return data || [];
};

const updateBookingStatus = async (id: string, status: BookingStatus): Promise<boolean> => {
  console.log('🔄 Attempting to update booking status:', { id, status });
  
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select();
    
    console.log('📊 Supabase response:', { data, error });
    
    if (error) {
      console.error('❌ Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Successfully updated booking:', data[0]);
      return true;
    } else {
      console.warn('⚠️ No rows were updated. Booking ID might not exist:', id);
      return false;
    }
  } catch (error) {
    console.error('💥 Unexpected error in updateBookingStatus:', error);
    return false;
  }
};

const AdminDashboard = () => {
  const [selected, setSelected] = useState<Date>(new Date());
  const [bookings, setBookingsState] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const data = await getBookings();
      setBookingsState(data);
      setLoading(false);
    };
    
    fetchBookings();
  }, []);

  const dayBookings = bookings
    .filter(b => new Date(b.date).toDateString() === selected.toDateString())
    .sort((a, b) => a.session.localeCompare(b.session));

  // Treat pending + approved as occupying a slot
  const occupiedCount = dayBookings.filter(b => b.status !== "rejected").length;
  const remainingSlots = Math.max(DAILY_TOTAL_SLOTS - occupiedCount, 0);

  // Precompute month-day status to highlight the calendar
  const monthDays = new Map<string, { occupied: number }>();
  for (const b of bookings) {
    const d = new Date(b.date);
    if (!monthDays.has(d.toDateString())) monthDays.set(d.toDateString(), { occupied: 0 });
    if (b.status !== "rejected") {
      monthDays.get(d.toDateString())!.occupied += 1;
    }
  }

  const modifiers = {
    booked: Array.from(monthDays.entries()).filter(([_, v]) => v.occupied >= DAILY_TOTAL_SLOTS).map(([k]) => new Date(k)),
    pending: Array.from(monthDays.entries()).filter(([_, v]) => v.occupied > 0 && v.occupied < DAILY_TOTAL_SLOTS).map(([k]) => new Date(k)),
    approved: Array.from(monthDays.entries()).filter(([_, v]) => v.occupied > 0 && v.occupied < DAILY_TOTAL_SLOTS).map(([k]) => new Date(k)),
  };

  const updateStatus = async (id: string, status: BookingStatus) => {
    console.log('🎯 updateStatus called with:', { id, status });
    
    const success = await updateBookingStatus(id, status);
    console.log('📝 updateBookingStatus returned:', success);
    
    if (success) {
      // Refresh bookings from database to ensure we have latest data
      console.log('🔄 Refreshing bookings from database...');
      const refreshedBookings = await getBookings();
      setBookingsState(refreshedBookings);
      
      // Find the updated booking for email notification
      const updatedBooking = refreshedBookings.find(b => b.id === id);
      console.log('📧 Found updated booking for email:', updatedBooking);
      
      // Send email notification to user
      const emailConfigValid = validateEmailConfig();
      console.log('📧 Email config valid:', emailConfigValid);
      
      if (emailConfigValid && updatedBooking) {
        console.log('📧 Attempting to send status notification email...');
        try {
          const emailSent = await sendBookingStatusNotification(
            updatedBooking, 
            status as 'approved' | 'rejected'
          );
          console.log('📧 Email sent result:', emailSent);
          if (emailSent) {
            console.log('✅ User notification email sent successfully');
          } else {
            console.warn('⚠️ Failed to send user notification email');
          }
        } catch (emailError) {
          console.error('❌ Email notification error:', emailError);
          // Don't fail the status update if email fails
        }
      } else {
        if (!emailConfigValid) {
          console.warn('⚠️ Email configuration not set up. Skipping email notification.');
        }
        if (!updatedBooking) {
          console.error('❌ Updated booking not found for email notification. ID:', id);
        }
      }
      
      toast({ 
        title: "Status updated", 
        description: `Booking ${status} successfully.${emailConfigValid ? ' User notification email attempted.' : ' Email not configured.'}`,
        variant: "default"
      });
    } else {
      toast({ 
        title: "Update failed", 
        description: "Failed to update booking status. Please check console for details.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <section className="py-6 md:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Mobile-first header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage studio bookings and approvals</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Calendar - Full width on mobile, 2/3 on desktop */}
            <Card className="lg:col-span-2 order-2 lg:order-1">
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-lg md:text-xl">Calendar</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6">
                <Calendar
                  mode="single"
                  numberOfMonths={1}
                  selected={selected}
                  onSelect={(d) => d && setSelected(d)}
                  className="w-full"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center text-sm md:text-base",
                    caption_label: "text-sm md:text-base font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-8 w-8 md:h-10 md:w-10 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-8 md:w-12 font-normal text-xs md:text-sm",
                    row: "flex w-full mt-2",
                    cell: "h-8 w-8 md:h-12 md:w-12 text-center text-xs md:text-sm p-0 relative focus-within:relative focus-within:z-20",
                    day: "h-8 w-8 md:h-12 md:w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-accent rounded-md transition-colors",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                  }}
                  modifiers={modifiers}
                  modifiersStyles={{
                    booked: { backgroundColor: '#ef4444', color: 'white', borderRadius: '6px' },
                    pending: { backgroundColor: '#f59e0b', color: 'white', borderRadius: '6px' },
                    approved: { backgroundColor: '#10b981', color: 'white', borderRadius: '6px' }
                  }}
                />
              </CardContent>
            </Card>

            {/* Booking Stats - Stacked on mobile */}
            <Card className="order-1 lg:order-2">
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-lg md:text-xl">Booking Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-yellow-800 dark:text-yellow-200">Pending</p>
                    <p className="text-lg md:text-2xl font-bold text-yellow-900 dark:text-yellow-100">{bookings.filter(b => b.status === 'pending').length}</p>
                  </div>
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-green-800 dark:text-green-200">Approved</p>
                    <p className="text-lg md:text-2xl font-bold text-green-900 dark:text-green-100">{bookings.filter(b => b.status === 'approved').length}</p>
                  </div>
                  <CalendarDays className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-red-800 dark:text-red-200">Rejected</p>
                    <p className="text-lg md:text-2xl font-bold text-red-900 dark:text-red-100">{bookings.filter(b => b.status === 'rejected').length}</p>
                  </div>
                  <Building className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings List - Mobile optimized */}
          <Card className="mt-4 md:mt-6">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-lg md:text-xl">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              {bookings.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <CalendarDays className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm md:text-base">No bookings found</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {bookings.map((booking) => (
                    <MobileBookingCard 
                      key={booking.id} 
                      booking={booking} 
                      onUpdateStatus={updateStatus}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

// Mobile-optimized booking card component
const MobileBookingCard = ({ booking, onUpdateStatus }: { 
  booking: any; 
  onUpdateStatus: (id: string, status: any) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="border border-border rounded-lg p-3 md:p-4 bg-card">
      {/* Header - Always visible */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
            {booking.team_leader_name}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            {booking.studio} • {format(new Date(booking.date), 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs px-2 py-1 ${getStatusColor(booking.status)}`}>
            {booking.status}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">ID:</span>
              <span className="font-medium">{booking.team_leader_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium truncate">{booking.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{booking.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Session:</span>
              <span className="font-medium">{booking.session}</span>
            </div>
          </div>
          
          {booking.notes && (
            <div className="flex gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-muted-foreground text-xs md:text-sm">Notes:</span>
                <p className="text-xs md:text-sm font-medium mt-1">{booking.notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {booking.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => onUpdateStatus(booking.id, 'approved')}
                className="flex-1 h-9 text-sm bg-green-600 hover:bg-green-700"
              >
                ✅ Approve
              </Button>
              <Button
                onClick={() => onUpdateStatus(booking.id, 'rejected')}
                variant="destructive"
                className="flex-1 h-9 text-sm"
              >
                ❌ Reject
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;