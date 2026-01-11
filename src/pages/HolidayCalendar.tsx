import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar } from "lucide-react";
import { useHolidayCalendar } from "@/hooks/useHolidayCalendar";

const HolidayCalendar = () => {
  const { data, isLoading, error } = useHolidayCalendar();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-destructive">Error loading holiday calendar data</div>
        </div>
      </div>
    );
  }

  const holidays = data?.holidays || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
      timeZone: 'Asia/Kolkata'
    });
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'National Holiday': return 'destructive';
      case 'Festival': return 'default';
      case 'State Holiday': return 'secondary';
      default: return 'outline';
    }
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  const upcomingHolidays = holidays.filter(h => isUpcoming(h.date));
  const pastHolidays = holidays.filter(h => !isUpcoming(h.date));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1">Market Holiday Calendar</h1>
          <p className="text-muted-foreground text-xs">
            Stock market holidays for NSE and BSE
          </p>
        </div>

        <div className="space-y-6">
          {upcomingHolidays.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold">Upcoming Holidays</h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Holiday</TableHead>
                      <TableHead className="text-xs">Market</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingHolidays.map((holiday) => (
                      <TableRow key={holiday.id}>
                        <TableCell className="font-medium whitespace-nowrap text-xs">
                          {formatDate(holiday.date)}
                        </TableCell>
                        <TableCell className="font-semibold text-xs">{holiday.name}</TableCell>
                        <TableCell className="text-xs">{holiday.market}</TableCell>
                        <TableCell>
                          <Badge variant={getTypeVariant(holiday.type)} className="text-[10px] px-1.5 py-0.5">
                            {holiday.type}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {pastHolidays.length > 0 && (
            <Card className="p-4">
              <h2 className="text-sm font-bold mb-3">Past Holidays</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Holiday</TableHead>
                      <TableHead className="text-xs">Market</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastHolidays.map((holiday) => (
                      <TableRow key={holiday.id} className="opacity-60">
                        <TableCell className="font-medium whitespace-nowrap text-xs">
                          {formatDate(holiday.date)}
                        </TableCell>
                        <TableCell className="text-xs">{holiday.name}</TableCell>
                        <TableCell className="text-xs">{holiday.market}</TableCell>
                        <TableCell>
                          <Badge variant={getTypeVariant(holiday.type)} className="text-[10px] px-1.5 py-0.5">
                            {holiday.type}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default HolidayCalendar;
