// src/pages/AdminDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, isSameMonth } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { sendBookingStatusNotification, validateEmailConfig } from "@/lib/emailService";

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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const data = await getBookings();
      setBookingsState(data);
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
  const remainingSlots = Math.max(DAILY_TOTAL_SLOTS - occupiedCount, 0);

  // Precompute month-day status to highlight the calendar
  const monthDays = useMemo(() => {
    const map = new Map<string, { occupied: number }>();
    for (const b of bookings) {
      const d = new Date(b.date);
      if (!isSameMonth(d, selected)) continue;
      const key = d.toDateString();
      if (!map.has(key)) map.set(key, { occupied: 0 });
      if (b.status !== "rejected") {
        map.get(key)!.occupied += 1;
      }
    }
    return map;
  }, [bookings, selected]);

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
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                numberOfMonths={2}
                paginatedNavigation
                selected={selected}
                onSelect={(d) => d && setSelected(d)}
                className="p-3"
                // Make the calendar visually larger
                classNames={{
                  day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100",
                  cell: "h-12 w-12 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                }}
                modifiers={modifiers}
                modifiersClassNames={{
                  // subtle indicator colors
                  avail: "after:content-[''] after:w-1.5 after:h-1.5 after:bg-success after:rounded-full after:absolute after:bottom-1 after:right-1",
                  full: "after:content-[''] after:w-1.5 after:h-1.5 after:bg-destructive after:rounded-full after:absolute after:bottom-1 after:right-1",
                }}
              />
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <div className="text-sm text-muted-foreground">{format(selected, "PPP")}</div>
                <Badge variant={remainingSlots > 0 ? "default" : "destructive"}>
                  {remainingSlots > 0 ? `${remainingSlots} slots available` : "Full"}
                </Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
                  <span className="inline-block w-2 h-2 bg-success rounded-full" /> Has availability
                  <span className="inline-block w-2 h-2 bg-destructive rounded-full ml-3" /> Full
                </div>
                <Button variant="outline" size="sm" onClick={logout} className="ml-auto">
                  Log out
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Day Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm mb-3">
                Total slots: {DAILY_TOTAL_SLOTS} • Occupied: {occupiedCount} • Remaining: {remainingSlots}
              </div>
              <div className="space-y-4">
                {perStudioAvailability.map(({ studio, available, booked }) => (
                  <div key={studio.id} className="border rounded-lg p-3">
                    <div className="font-medium">{studio.name}</div>
                    <div className="mt-2 text-xs">
                      <div className="text-muted-foreground">Available</div>
                      {available.length === 0 ? (
                        <div className="text-muted-foreground">None</div>
                      ) : (
                        <ul className="list-disc ml-5">
                          {available.map(s => <li key={s}>{s}</li>)}
                        </ul>
                      )}
                      <div className="mt-2 text-muted-foreground">Booked</div>
                      {booked.length === 0 ? (
                        <div className="text-muted-foreground">None</div>
                      ) : (
                        <ul className="list-disc ml-5">
                          {booked.map(s => <li key={s}>{s}</li>)}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Bookings for {format(selected, "PPP")}</CardTitle>
            </CardHeader>
            <CardContent>
              {dayBookings.length === 0 ? (
                <p className="text-muted-foreground">No bookings for this day.</p>
              ) : (
                <div className="space-y-3">
                  {dayBookings.map(b => (
                    <div key={b.id} className="flex flex-col md:flex-row md:items-center md:justify-between border rounded-lg p-4 bg-card">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{b.team_leader_name} ({b.team_leader_id})</div>
                        <div className="text-sm text-muted-foreground">{b.email} • {b.phone}</div>
                        <div className="text-sm">Studio: <span className="font-medium">{b.studio}</span> • Session: <span className="font-medium">{b.session}</span></div>
                        {b.notes && <div className="text-sm text-muted-foreground">Notes: {b.notes}</div>}
                      </div>
                      <div className="flex items-center gap-2 mt-3 md:mt-0">
                        <Badge variant={b.status === "approved" ? "default" : b.status === "rejected" ? "destructive" : "secondary"}>
                          {b.status}
                        </Badge>
                        <Button size="sm" variant="success" onClick={() => updateStatus(b.id, "approved")}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(b.id, "rejected")}>Reject</Button>
                      </div>
                    </div>
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

export default AdminDashboard;