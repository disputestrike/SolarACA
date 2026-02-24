import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Play, BookOpen, Users } from "lucide-react";

interface TrainingModule {
  id: number;
  title: string;
  description: string;
  category: "sales_fundamentals" | "solar_product" | "leadership" | "management";
  duration: number;
  completed: boolean;
}

const trainingModules: TrainingModule[] = [
  {
    id: 1,
    title: "Welcome to Dave's Solar Academy",
    description: "Get started with an overview of our company, culture, and values.",
    category: "sales_fundamentals",
    duration: 15,
    completed: true,
  },
  {
    id: 2,
    title: "Sales Fundamentals 101",
    description: "Learn the core principles of effective outside sales.",
    category: "sales_fundamentals",
    duration: 45,
    completed: true,
  },
  {
    id: 3,
    title: "Solar Product Knowledge",
    description: "Deep dive into solar panels, installation, and benefits.",
    category: "solar_product",
    duration: 60,
    completed: false,
  },
  {
    id: 4,
    title: "Closing Techniques",
    description: "Master the art of closing deals and handling objections.",
    category: "sales_fundamentals",
    duration: 50,
    completed: false,
  },
  {
    id: 5,
    title: "Building Your Territory",
    description: "Strategies for managing your sales territory and leads.",
    category: "sales_fundamentals",
    duration: 40,
    completed: false,
  },
  {
    id: 6,
    title: "Leadership Essentials",
    description: "Prepare for leadership by learning team management basics.",
    category: "leadership",
    duration: 55,
    completed: false,
  },
  {
    id: 7,
    title: "Building High-Performing Teams",
    description: "How to recruit, train, and motivate your sales team.",
    category: "leadership",
    duration: 60,
    completed: false,
  },
  {
    id: 8,
    title: "Commission Structure & Earnings",
    description: "Understand how to maximize your earnings and commission.",
    category: "management",
    duration: 30,
    completed: false,
  },
];

const categoryIcons = {
  sales_fundamentals: <BookOpen className="h-5 w-5" />,
  solar_product: <Tabs className="h-5 w-5" />,
  leadership: <Users className="h-5 w-5" />,
  management: <Users className="h-5 w-5" />,
};

const categoryLabels = {
  sales_fundamentals: "Sales Fundamentals",
  solar_product: "Solar Product",
  leadership: "Leadership",
  management: "Management",
};

export default function Onboarding() {
  const completedCount = trainingModules.filter((m) => m.completed).length;
  const totalCount = trainingModules.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const modulesByCategory = {
    sales_fundamentals: trainingModules.filter((m) => m.category === "sales_fundamentals"),
    solar_product: trainingModules.filter((m) => m.category === "solar_product"),
    leadership: trainingModules.filter((m) => m.category === "leadership"),
    management: trainingModules.filter((m) => m.category === "management"),
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Your Onboarding Journey</h1>
          <p className="text-muted-foreground">
            Complete training modules to become a solar sales expert
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Progress Card */}
        <Card className="p-6 border-border mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Progress</h2>
              <span className="text-2xl font-bold text-primary">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} modules completed ({Math.round(progressPercentage)}%)
            </p>
          </div>
        </Card>

        {/* Training Modules by Category */}
        <Tabs defaultValue="sales_fundamentals" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="sales_fundamentals">Sales</TabsTrigger>
            <TabsTrigger value="solar_product">Solar</TabsTrigger>
            <TabsTrigger value="leadership">Leadership</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          {Object.entries(modulesByCategory).map(([category, modules]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid gap-4">
                {modules.map((module) => (
                  <Card
                    key={module.id}
                    className={`p-6 border-border hover:shadow-md transition ${
                      module.completed ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {module.completed && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                          <h3 className="font-bold text-lg">{module.title}</h3>
                        </div>
                        <p className="text-muted-foreground mb-4">{module.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Duration: {module.duration} minutes</span>
                          <span>
                            Category:{" "}
                            <span className="text-foreground font-medium">
                              {categoryLabels[module.category]}
                            </span>
                          </span>
                        </div>
                      </div>
                      <Button
                        className={
                          module.completed
                            ? "bg-primary/20 text-primary hover:bg-primary/30"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {module.completed ? "Review" : "Start"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Next Steps */}
        <Card className="p-8 border-border mt-12 bg-primary/5">
          <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              ✓ <strong>Complete all training modules</strong> - This typically takes 2-3 weeks
            </p>
            <p>
              ✓ <strong>Schedule your first territory meeting</strong> - Meet with your manager to discuss your sales area
            </p>
            <p>
              ✓ <strong>Start your first sales calls</strong> - Begin building your pipeline
            </p>
            <p>
              ✓ <strong>Track your progress</strong> - Monitor your earnings and performance
            </p>
          </div>
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Questions? Contact your manager or email support@davessolar.com
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Schedule Manager Meeting
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
