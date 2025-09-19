// src/pages/AdminDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import AdminBookingForm from "@/components/AdminBookingForm";
import ReportGenerator from "@/components/ReportGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, isSameMonth } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { sendBookingStatusNotification, validateEmailConfig } from "@/lib/emailService";
import { Trash2, Plus, LogOut, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react";

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
  { id: "studio-1", name: "Studio 1", sessions: ["10:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"] },
  { id: "studio-2", name: "Studio 2", sessions: ["10:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"] },
  { id: "studio-3", name: "Studio 3", sessions: ["10:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"] },
];

const DAILY_TOTAL_SLOTS = ALL_STUDIOS.reduce((sum, s) => sum + s.sessions.length, 0); // 7

const AdminDashboard = () => {
  const [selected, setSelected] = useState<Date>(new Date());
  const [bookings, setBookingsState] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManualBookingForm, setShowManualBookingForm] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase.from('bookings').select('*');
      if (error) console.error('Error fetching bookings:', error);
      else setBookingsState(data || []);
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const dayBookings = useMemo(
    () =>
      bookings
        .filter(b => isSameDay(new Date(b.date), selected))
        .sort((a, b) => a.session.localeCompare(b.session)),
    [bookings, selected]
  );

  // Treat pending + approved as occupying a slot
  const occupiedCount = dayBookings.filter(b => b.status !== "rejected").length;
  const remainingSlots = DAILY_TOTAL_SLOTS - occupiedCount;

  // Precompute month-day status to highlight the calendar
  const monthDays = useMemo(() => {
    const map = new Map<string, { occupied: number }>();
    for (const b of bookings) {
      const d = new Date(b.date);
      if (!isSameMonth(d, currentMonth)) continue;
      const key = d.toDateString();
      if (!map.has(key)) map.set(key, { occupied: 0 });
      if (b.status !== "rejected") {
        map.get(key)!.occupied += 1;
      }
    }
    return map;
  }, [bookings, currentMonth]);

  const modifiers: Record<string, Date[]> = useMemo(() => {
    const avail: Date[] = [];
    const full: Date[] = [];
    monthDays.forEach((v, k) => {
      const d = new Date(k);
      if (v.occupied >= DAILY_TOTAL_SLOTS) full.push(d);
      else if (v.occupied > 0) avail.push(d);
    });
    return { full, avail };
  }, [monthDays]);

  const updateStatus = async (id: string, status: BookingStatus) => {
    console.log('🎯 updateStatus called with:', { id, status });
    
    try {
      // Update in database
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Database update error:', error);
        toast({
          title: "Update Failed",
          description: "Failed to update booking status in database.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setBookingsState(prev => 
        prev.map(booking => 
          booking.id === id ? { ...booking, status } : booking
        )
      );

      // Find the booking for email notification
      const booking = bookings.find(b => b.id === id);
      if (!booking) {
        console.error('Booking not found for email notification');
        toast({
          title: "Status Updated",
          description: `Booking ${status} successfully, but email notification failed.`,
          variant: "default",
        });
        return;
      }

      // Send email notification to user
      const emailConfigValid = validateEmailConfig();
      if (emailConfigValid) {
        try {
          const emailSent = await sendBookingStatusNotification(booking, status);
          if (emailSent) {
            console.log('Status notification email sent successfully');
            toast({
              title: "Status Updated",
              description: `Booking ${status} and user notified via email.`,
              variant: "default",
            });
          } else {
            console.warn('Failed to send status notification email');
            toast({
              title: "Status Updated",
              description: `Booking ${status} successfully, but email notification failed.`,
              variant: "default",
            });
          }
        } catch (emailError) {
          console.error('Email notification error:', emailError);
          toast({
            title: "Status Updated",
            description: `Booking ${status} successfully, but email notification failed.`,
            variant: "default",
          });
        }
      } else {
        console.warn('Email configuration not set up. Skipping email notification.');
        toast({
          title: "Status Updated",
          description: `Booking ${status} successfully. Email notifications not configured.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred while updating the booking status.",
        variant: "destructive",
      });
    }
  };

  const deleteBooking = async (id: string) => {
    console.log('🗑️ deleteBooking called with:', { id });
    
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this booking? This action cannot be undone.');
    if (!confirmed) {
      return;
    }
    
    try {
      // Delete from database
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Database delete error:', error);
        toast({
          title: "Delete Failed",
          description: "Failed to delete booking from database.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setBookingsState(prev => prev.filter(booking => booking.id !== id));

      toast({
        title: "Booking Deleted",
        description: "Booking has been successfully deleted.",
        variant: "default",
      });

    } catch (error) {
      console.error('Delete booking error:', error);
      toast({
        title: "Delete Failed",
        description: "An unexpected error occurred while deleting the booking.",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("adminAuthed");
    navigate("/admin/login", { replace: true });
  };

  // Build per-studio, per-session availability list for the selected date
  const perStudioAvailability = useMemo(() => {
    const dayMap = new Map<string, Set<string>>(); // studioId -> set of booked sessions
    for (const b of dayBookings) {
      if (b.status === "rejected") continue;
      const set = dayMap.get(b.studio) ?? new Set<string>();
      set.add(b.session);
      dayMap.set(b.studio, set);
    }
    return ALL_STUDIOS.map(s => {
      const booked = dayMap.get(s.id) ?? new Set<string>();
      const available = s.sessions.filter(sess => !booked.has(sess));
      return { studio: s, available, booked: Array.from(booked) };
    });
  }, [dayBookings]);

  const handleBookingCreated = () => {
    // Refresh bookings after a new booking is created
    const fetchBookings = async () => {
      const { data, error } = await supabase.from('bookings').select('*');
      if (error) console.error('Error fetching bookings:', error);
      else setBookingsState(data || []);
    };
    fetchBookings();
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
      
      {/* Admin Header with Logout */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Manage studio bookings and approvals</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowReportGenerator(true)}
                className="flex items-center justify-center space-x-2 h-10 text-sm"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden xs:inline">Generate Report</span>
                <span className="xs:hidden">Report</span>
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setShowManualBookingForm(true)}
                className="flex items-center justify-center space-x-2 h-10 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden xs:inline">Add Booking</span>
                <span className="xs:hidden">Add</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="flex items-center justify-center space-x-2 h-10 text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden xs:inline">Logout</span>
                <span className="xs:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <Calendar
                mode="single"
                numberOfMonths={1}
                paginatedNavigation
                selected={selected}
                onSelect={(d) => d && setSelected(d)}
                onMonthChange={(d) => d && setCurrentMonth(d)}
                className="p-2 sm:p-3 w-full"
                // Mobile-optimized calendar styling
                classNames={{
                  day: "h-10 w-10 sm:h-12 sm:w-12 p-0 font-normal aria-selected:opacity-100 text-sm",
                  cell: "h-10 w-10 sm:h-12 sm:w-12 text-center text-xs sm:text-sm p-0 relative focus-within:relative focus-within:z-20",
                  nav_button: "h-8 w-8 sm:h-10 sm:w-10",
                  caption: "text-sm sm:text-base",
                }}
                modifiers={modifiers}
                modifiersClassNames={{
                  // Mobile-friendly indicator dots
                  avail: "after:content-[''] after:w-1 after:h-1 sm:after:w-1.5 sm:after:h-1.5 after:bg-success after:rounded-full after:absolute after:bottom-0.5 sm:after:bottom-1 after:right-0.5 sm:after:right-1",
                  full: "after:content-[''] after:w-1 after:h-1 sm:after:w-1.5 sm:after:h-1.5 after:bg-destructive after:rounded-full after:absolute after:bottom-0.5 sm:after:bottom-1 after:right-0.5 sm:after:right-1",
                }}
                navButtonProps={{
                  prev: {
                    children: <ChevronLeft className="h-4 w-4" />,
                  },
                  next: {
                    children: <ChevronRight className="h-4 w-4" />,
                  },
                }}
              />
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3 mt-4">
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">{format(selected, "PPP")}</div>
                <Badge variant={remainingSlots > 0 ? "default" : "destructive"} className="w-fit">
                  {remainingSlots > 0 ? `${remainingSlots} slots available` : "Full"}
                </Badge>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-success rounded-full" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-destructive rounded-full" />
                    <span>Full</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Day Availability</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-xs sm:text-sm mb-3 p-2 bg-muted rounded-lg">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="font-medium text-foreground">{DAILY_TOTAL_SLOTS}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{occupiedCount}</div>
                    <div className="text-xs text-muted-foreground">Occupied</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{remainingSlots}</div>
                    <div className="text-xs text-muted-foreground">Remaining</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {perStudioAvailability.map(({ studio, available, booked }) => (
                  <div key={studio.id} className="border rounded-lg p-3">
                    <div className="font-medium text-sm sm:text-base">{studio.name}</div>
                    <div className="mt-2 text-xs">
                      <div className="text-muted-foreground font-medium">Available</div>
                      {available.length === 0 ? (
                        <div className="text-muted-foreground italic">None</div>
                      ) : (
                        <ul className="list-disc ml-4 space-y-0.5">
                          {available.map(s => <li key={s} className="text-xs">{s}</li>)}
                        </ul>
                      )}
                      <div className="mt-2 text-muted-foreground font-medium">Booked</div>
                      {booked.length === 0 ? (
                        <div className="text-muted-foreground italic">None</div>
                      ) : (
                        <ul className="list-disc ml-4 space-y-0.5">
                          {booked.map(s => <li key={s} className="text-xs">{s}</li>)}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <CardTitle className="text-lg sm:text-xl">Bookings for {format(selected, "PPP")}</CardTitle>
                <Button  
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowReportGenerator(true)}
                  className="flex items-center space-x-2 w-full sm:w-auto h-10"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Generate Report</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {dayBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">No bookings for this day.</p>
                  <Button 
                    variant="default" 
                    onClick={() => setShowManualBookingForm(true)}
                    className="flex items-center space-x-2 w-full sm:w-auto h-11"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create First Booking</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {dayBookings.map(b => (
                    <div key={b.id} className="border rounded-lg p-4 bg-card">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground text-sm sm:text-base">{b.team_leader_name} ({b.team_leader_id})</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">{b.email}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">{b.phone}</div>
                          <div className="text-xs sm:text-sm">
                            <span className="font-medium">Studio:</span> {b.studio} • <span className="font-medium">Session:</span> {b.session}
                          </div>
                          {b.notes && <div className="text-xs sm:text-sm text-muted-foreground"><span className="font-medium">Notes:</span> {b.notes}</div>}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <Badge 
                            variant={b.status === "approved" ? "default" : b.status === "rejected" ? "destructive" : "secondary"}
                            className="w-fit"
                          >
                            {b.status}
                          </Badge>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              size="sm" 
                              variant="success" 
                              onClick={() => updateStatus(b.id, "approved")}
                              className="flex-1 sm:flex-none h-9 text-xs sm:text-sm"
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => updateStatus(b.id, "rejected")}
                              className="flex-1 sm:flex-none h-9 text-xs sm:text-sm"
                            >
                              Reject
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => deleteBooking(b.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9 p-0 sm:w-auto sm:px-3"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline ml-2">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Manual Booking Form Modal */}
      {showManualBookingForm && (
        <AdminBookingForm
          selectedDate={selected}
          onBookingCreated={handleBookingCreated}
          onClose={() => setShowManualBookingForm(false)}
        />
      )}

      {/* Report Generator Modal */}
      {showReportGenerator && (
        <>
          {console.log('Rendering ReportGenerator modal, showReportGenerator:', showReportGenerator)}
          {console.log('Bookings data:', bookings.length, 'bookings')}
          <ReportGenerator
            bookings={bookings}
            onClose={() => {
              console.log('ReportGenerator onClose called');
              setShowReportGenerator(false);
            }}
          />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;