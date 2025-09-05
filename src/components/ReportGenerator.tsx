import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X, Download, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

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
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface ReportFilters {
  startDate: Date | null;
  endDate: Date | null;
  studio: string;
  status: string;
  teamLeaderName: string;
}

interface ReportGeneratorProps {
  bookings: Booking[];
  onClose: () => void;
}

const studios = [
  { id: "experience-store", name: "Experience Store" },
  { id: "studio-1", name: "Studio 1" },
  { id: "studio-2", name: "Studio 2" },
  { id: "studio-3", name: "Studio 3" },
];

const ReportGenerator = ({ bookings, onClose }: ReportGeneratorProps) => {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: null,
    endDate: null,
    studio: "",
    status: "",
    teamLeaderName: "",
  });

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      
      // Date range filter
      if (filters.startDate && bookingDate < filters.startDate) return false;
      if (filters.endDate && bookingDate > filters.endDate) return false;
      
      // Studio filter
      if (filters.studio && booking.studio !== filters.studio) return false;
      
      // Status filter
      if (filters.status && booking.status !== filters.status) return false;
      
      // Team leader name filter
      if (filters.teamLeaderName && 
          !booking.team_leader_name.toLowerCase().includes(filters.teamLeaderName.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [bookings, filters]);

  const reportStats = useMemo(() => {
    const total = filteredBookings.length;
    const approved = filteredBookings.filter(b => b.status === "approved").length;
    const pending = filteredBookings.filter(b => b.status === "pending").length;
    const rejected = filteredBookings.filter(b => b.status === "rejected").length;
    
    const studioStats = studios.map(studio => ({
      name: studio.name,
      count: filteredBookings.filter(b => b.studio === studio.id).length
    }));

    return { total, approved, pending, rejected, studioStats };
  }, [filteredBookings]);

  const exportToExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = filteredBookings.map(booking => ({
        'Booking ID': booking.id,
        'Team Leader Name': booking.team_leader_name,
        'Team Leader ID': booking.team_leader_id,
        'Email': booking.email,
        'Phone': booking.phone,
        'Studio': booking.studio,
        'Session': booking.session,
        'Date': format(new Date(booking.date), 'yyyy-MM-dd'),
        'Status': booking.status,
        'Notes': booking.notes,
        'Created At': format(new Date(booking.created_at), 'yyyy-MM-dd HH:mm:ss')
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const colWidths = Object.keys(excelData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Bookings Report');

      // Create summary sheet
      const summaryData = [
        { Metric: 'Total Bookings', Value: reportStats.total },
        { Metric: 'Approved', Value: reportStats.approved },
        { Metric: 'Pending', Value: reportStats.pending },
        { Metric: 'Rejected', Value: reportStats.rejected },
        { Metric: '', Value: '' }, // Empty row
        ...reportStats.studioStats.map(studio => ({
          Metric: `${studio.name} Bookings`,
          Value: studio.count
        }))
      ];

      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      summaryWs['!cols'] = [{ wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

      // Generate filename with current date
      const filename = `booking-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      toast({
        title: "Report Exported",
        description: `Excel report has been downloaded as ${filename}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      studio: "",
      status: "",
      teamLeaderName: "",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
        <CardHeader className="text-center bg-gradient-subtle rounded-t-lg relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl text-foreground">Generate Booking Report</CardTitle>
          <p className="text-muted-foreground">Filter and export booking data to Excel</p>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filters Section */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.startDate ? format(filters.startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.startDate || undefined}
                      onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date || null }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.endDate ? format(filters.endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.endDate || undefined}
                      onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date || null }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Studio Filter */}
              <div className="space-y-2">
                <Label>Studio</Label>
                <Select 
                  value={filters.studio} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, studio: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All studios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All studios</SelectItem>
                    {studios.map((studio) => (
                      <SelectItem key={studio.id} value={studio.id}>
                        {studio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Team Leader Name Filter */}
              <div className="space-y-2">
                <Label>Team Leader Name</Label>
                <Input
                  value={filters.teamLeaderName}
                  onChange={(e) => setFilters(prev => ({ ...prev, teamLeaderName: e.target.value }))}
                  placeholder="Search by name..."
                />
              </div>

              {/* Clear Filters Button */}
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Report Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{reportStats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{reportStats.approved}</div>
                    <div className="text-sm text-muted-foreground">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{reportStats.pending}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{reportStats.rejected}</div>
                    <div className="text-sm text-muted-foreground">Rejected</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {reportStats.studioStats.map(studio => (
                    <div key={studio.name} className="text-center">
                      <div className="text-lg font-semibold">{studio.count}</div>
                      <div className="text-xs text-muted-foreground">{studio.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
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
                onClick={exportToExcel}
                className="flex-1" 
                variant="default"
                disabled={filteredBookings.length === 0}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export to Excel ({filteredBookings.length} records)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGenerator;
