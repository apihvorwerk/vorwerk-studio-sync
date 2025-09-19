import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { CalendarDays, Users, Clock } from 'lucide-react';

interface Booking {
  id: string;
  team_leader_name: string;
  team_leader_id: string;
  email: string;
  phone: string;
  studio: string;
  session: string;
  date: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const STUDIOS = [
  { id: "experience-store", name: "Thermomix Experience Store - Level G" },
  { id: "studio-1", name: "Studio 1 - Level 1" },
  { id: "studio-2", name: "Studio 2 - Level 1" },
  { id: "studio-3", name: "Studio 3 - Level 1" },
];

const BookingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('status', 'approved')
          .order('date', { ascending: true });
        
        if (error) {
          console.error('Error fetching bookings:', error);
        } else {
          setBookings(data || []);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Get bookings for selected date
  const dayBookings = useMemo(
    () => bookings.filter(booking => isSameDay(new Date(booking.date), selectedDate)),
    [bookings, selectedDate]
  );

  // Create calendar modifiers for dates with bookings
  const modifiers = useMemo(() => {
    const bookedDates: Date[] = [];
    const monthBookings = bookings.filter(booking => 
      isSameMonth(new Date(booking.date), currentMonth)
    );
    
    monthBookings.forEach(booking => {
      const bookingDate = new Date(booking.date);
      if (!bookedDates.some(date => isSameDay(date, bookingDate))) {
        bookedDates.push(bookingDate);
      }
    });

    return { booked: bookedDates };
  }, [bookings, currentMonth]);

  const getStudioName = (studioId: string) => {
    const studio = STUDIOS.find(s => s.id === studioId);
    return studio ? studio.name : studioId;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5" />
            <span>Approved Bookings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarDays className="h-5 w-5" />
          <span>Approved Bookings</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          View confirmed studio bookings and see who has reserved each space
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            onMonthChange={(date) => date && setCurrentMonth(date)}
            className="rounded-md border"
            modifiers={modifiers}
            modifiersClassNames={{
              booked: "bg-primary/10 text-primary font-medium relative after:content-[''] after:w-2 after:h-2 after:bg-primary after:rounded-full after:absolute after:bottom-1 after:right-1"
            }}
          />
        </div>

        {/* Selected Date Info */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-lg mb-3">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          
          {dayBookings.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No approved bookings for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">
                        {booking.team_leader_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        ID: {booking.team_leader_id}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      Approved
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Studio:</span>
                      <span>{getStudioName(booking.studio)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Session:</span>
                      <span>{booking.session}</span>
                    </div>
                    
                    {booking.notes && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <span className="font-medium">Notes:</span> {booking.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-primary/10 border border-primary/20 rounded"></div>
              <span>Has Bookings</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-muted border rounded"></div>
              <span>Available</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;
