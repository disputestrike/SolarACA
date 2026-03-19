import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, Mail, Phone, FileText, MapPin, LogOut } from "lucide-react";
import { useLocation } from "wouter";

type ApplicantStatus = "new" | "screened" | "interviewed" | "offered" | "hired" | "rejected";

const statusColors: Record<ApplicantStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  screened: "bg-purple-100 text-purple-800",
  interviewed: "bg-yellow-100 text-yellow-800",
  offered: "bg-green-100 text-green-800",
  hired: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const applicantsQuery = trpc.applicants.list.useQuery({
    city: filterCity === "all" ? undefined : filterCity || undefined,
    status: filterStatus === "all" ? undefined : filterStatus || undefined,
  });

  const statsQuery = trpc.applicants.stats.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Dashboard Access</h1>
          <p className="text-muted-foreground mb-6">Sign in with your Google account to access the recruiter dashboard.</p>
          <Button onClick={() => { window.location.href = "/api/oauth/login"; }} className="w-full gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Sign in with Google
          </Button>
        </Card>
      </div>
    );
  }

  const filteredApplicants = (applicantsQuery.data || []).filter((app: any) =>
    `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.phone.includes(searchTerm)
  );

  const groupedApplicants = {
    new: filteredApplicants.filter((a: any) => a.status === "new"),
    screened: filteredApplicants.filter((a: any) => a.status === "screened"),
    interviewed: filteredApplicants.filter((a: any) => a.status === "interviewed"),
    offered: filteredApplicants.filter((a: any) => a.status === "offered"),
    hired: filteredApplicants.filter((a: any) => a.status === "hired"),
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Applicant Pipeline</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.name || "Owner"}</p>
            </div>
            <Button onClick={() => logout()} variant="outline" className="border-border">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                <SelectItem value="Tampa">Tampa</SelectItem>
                <SelectItem value="Miami">Miami</SelectItem>
                <SelectItem value="Fort Lauderdale">Fort Lauderdale</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="screened">Screened</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {statsQuery.data && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{statsQuery.data.total}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-blue-600">New</p>
                <p className="text-2xl font-bold text-blue-700">{statsQuery.data.new}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-xs text-purple-600">Screened</p>
                <p className="text-2xl font-bold text-purple-700">{statsQuery.data.screened}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-xs text-yellow-600">Interviewed</p>
                <p className="text-2xl font-bold text-yellow-700">{statsQuery.data.interviewed}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-green-600">Offered</p>
                <p className="text-2xl font-bold text-green-700">{statsQuery.data.offered}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="text-xs text-emerald-600">Hired</p>
                <p className="text-2xl font-bold text-emerald-700">{statsQuery.data.hired}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {applicantsQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <KanbanColumn title="New" count={groupedApplicants.new.length} color="blue" applicants={groupedApplicants.new} onSelect={(app: any) => { setSelectedApplicant(app); setIsDetailOpen(true); }} />
            <KanbanColumn title="Screened" count={groupedApplicants.screened.length} color="purple" applicants={groupedApplicants.screened} onSelect={(app: any) => { setSelectedApplicant(app); setIsDetailOpen(true); }} />
            <KanbanColumn title="Interviewed" count={groupedApplicants.interviewed.length} color="yellow" applicants={groupedApplicants.interviewed} onSelect={(app: any) => { setSelectedApplicant(app); setIsDetailOpen(true); }} />
            <KanbanColumn title="Offered" count={groupedApplicants.offered.length} color="green" applicants={groupedApplicants.offered} onSelect={(app: any) => { setSelectedApplicant(app); setIsDetailOpen(true); }} />
            <KanbanColumn title="Hired" count={groupedApplicants.hired.length} color="emerald" applicants={groupedApplicants.hired} onSelect={(app: any) => { setSelectedApplicant(app); setIsDetailOpen(true); }} />
          </div>
        )}
      </div>

      {selectedApplicant && (
        <ApplicantDetailModal
          applicant={selectedApplicant}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onStatusChange={() => {
            applicantsQuery.refetch();
            setIsDetailOpen(false);
          }}
        />
      )}
    </div>
  );
}

function KanbanColumn({ title, count, color, applicants, onSelect }: any) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
    emerald: "bg-emerald-500",
  };

  return (
    <div className="bg-muted/50 rounded-lg p-4 min-h-96">
      <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${colorMap[color]}`}></span>
        {title} ({count})
      </h2>
      <div className="space-y-3">
        {applicants.map((app: any) => (
          <Card key={app.id} className="p-3 cursor-pointer hover:shadow-md transition bg-background" onClick={() => onSelect(app)}>
            <p className="font-semibold text-sm">{app.firstName} {app.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{app.email}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {app.city}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ApplicantDetailModal({ applicant, open, onOpenChange, onStatusChange }: any) {
  const [newStatus, setNewStatus] = useState<ApplicantStatus>(applicant.status as ApplicantStatus);
  const updateStatusMutation = trpc.applicants.updateStatus.useMutation();

  const handleStatusUpdate = async () => {
    await updateStatusMutation.mutateAsync({ id: applicant.id, status: newStatus });
    onStatusChange();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{applicant.firstName} {applicant.lastName}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${applicant.email}`} className="text-primary hover:underline">{applicant.email}</a>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${applicant.phone}`} className="text-primary hover:underline">{applicant.phone}</a>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">City</p>
              <p className="font-semibold mt-1">{applicant.city}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Experience Level</p>
              <p className="font-semibold mt-1 capitalize">{applicant.experienceLevel.replace(/_/g, " ")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Current Status</p>
              <Badge className={`mt-1 ${statusColors[applicant.status as ApplicantStatus]}`}>
                {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Applied On</p>
              <p className="font-semibold mt-1">{new Date(applicant.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Update Status</p>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ApplicantStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="screened">Screened</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newStatus !== applicant.status && (
              <Button onClick={handleStatusUpdate} disabled={updateStatusMutation.isPending} className="w-full">
                {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            )}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-2">Motivation</p>
          <p className="text-sm text-foreground">{applicant.motivation}</p>
        </div>

        {applicant.resumeUrl && (
          <div className="border-t border-border pt-4">
            <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              <FileText className="h-4 w-4" />
              View Resume
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
