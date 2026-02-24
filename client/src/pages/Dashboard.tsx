import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { LogOut, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Applicant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  experienceLevel: string;
  status: "new" | "screened" | "interviewed" | "offered" | "hired" | "rejected";
  createdAt: string;
}

const mockApplicants: Applicant[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
    phone: "(555) 123-4567",
    city: "Tampa",
    experienceLevel: "outside_sales",
    status: "new",
    createdAt: "2026-02-23",
  },
  {
    id: 2,
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah@example.com",
    phone: "(555) 234-5678",
    city: "Miami",
    experienceLevel: "solar_sales",
    status: "screened",
    createdAt: "2026-02-22",
  },
  {
    id: 3,
    firstName: "Mike",
    lastName: "Davis",
    email: "mike@example.com",
    phone: "(555) 345-6789",
    city: "Fort Lauderdale",
    experienceLevel: "entry_level",
    status: "interviewed",
    createdAt: "2026-02-21",
  },
];

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  screened: "bg-purple-100 text-purple-800",
  interviewed: "bg-yellow-100 text-yellow-800",
  offered: "bg-green-100 text-green-800",
  hired: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  new: "New",
  screened: "Screened",
  interviewed: "Interviewed",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
};

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to access the dashboard.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  const filteredApplicants = mockApplicants.filter((app) => {
    const matchesSearch =
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || app.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusGroups = {
    new: filteredApplicants.filter((a) => a.status === "new"),
    screened: filteredApplicants.filter((a) => a.status === "screened"),
    interviewed: filteredApplicants.filter((a) => a.status === "interviewed"),
    offered: filteredApplicants.filter((a) => a.status === "offered"),
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Recruitment Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {user?.name || "Owner"}
            </p>
          </div>
          <Button
            onClick={() => logout()}
            variant="outline"
            className="border-border"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Applications</p>
            <p className="text-3xl font-bold text-primary">{mockApplicants.length}</p>
          </Card>
          <Card className="p-6 border-border">
            <p className="text-sm text-muted-foreground mb-1">New Applicants</p>
            <p className="text-3xl font-bold text-blue-600">{statusGroups.new.length}</p>
          </Card>
          <Card className="p-6 border-border">
            <p className="text-sm text-muted-foreground mb-1">Interviewed</p>
            <p className="text-3xl font-bold text-yellow-600">{statusGroups.interviewed.length}</p>
          </Card>
          <Card className="p-6 border-border">
            <p className="text-sm text-muted-foreground mb-1">Offers Sent</p>
            <p className="text-3xl font-bold text-green-600">{statusGroups.offered.length}</p>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="p-6 border-border mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === null ? "default" : "outline"}
                onClick={() => setSelectedStatus(null)}
                className={selectedStatus === null ? "bg-primary text-primary-foreground" : "border-border"}
              >
                <Filter className="h-4 w-4 mr-2" />
                All
              </Button>
              {Object.entries(statusLabels).map(([value, label]) => (
                <Button
                  key={value}
                  variant={selectedStatus === value ? "default" : "outline"}
                  onClick={() => setSelectedStatus(value)}
                  className={selectedStatus === value ? "bg-primary text-primary-foreground" : "border-border"}
                  size="sm"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Kanban Board */}
        <div className="grid md:grid-cols-4 gap-6">
          {Object.entries(statusGroups).map(([status, applicants]) => (
            <div key={status}>
              <div className="mb-4">
                <h2 className="font-bold text-lg capitalize">
                  {statusLabels[status]} ({applicants.length})
                </h2>
              </div>
              <div className="space-y-4">
                {applicants.length === 0 ? (
                  <Card className="p-4 border-border text-center text-muted-foreground">
                    No applicants
                  </Card>
                ) : (
                  applicants.map((applicant) => (
                    <Card
                      key={applicant.id}
                      className="p-4 border-border hover:shadow-md transition cursor-pointer"
                    >
                      <div className="space-y-2">
                        <div>
                          <p className="font-bold">
                            {applicant.firstName} {applicant.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{applicant.email}</p>
                        </div>
                        <div className="flex justify-between items-start">
                          <div className="text-xs">
                            <p className="text-muted-foreground">{applicant.city}</p>
                            <p className="text-muted-foreground capitalize">
                              {applicant.experienceLevel.replace(/_/g, " ")}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${statusColors[status]}`}>
                            {statusLabels[status]}
                          </span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1 border-border text-xs">
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 border-border text-xs">
                            Message
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredApplicants.length === 0 && (
          <Card className="p-12 text-center border-border">
            <p className="text-muted-foreground mb-4">No applicants found</p>
            <Button
              onClick={() => navigate("/")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Share Application Link
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
