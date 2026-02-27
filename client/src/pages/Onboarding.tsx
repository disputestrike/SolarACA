import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { CheckCircle2, Play, BookOpen, Users, TrendingUp } from "lucide-react";

const trainingModules = [
  {
    category: "Sales Fundamentals",
    modules: [
      { id: 1, title: "The Solar Sales Pitch", duration: "45 min", completed: false },
      { id: 2, title: "Objection Handling Masterclass", duration: "60 min", completed: true },
    ]
  },
  {
    category: "Solar Technology",
    modules: [
      { id: 5, title: "Solar Panel Basics", duration: "30 min", completed: true },
      { id: 6, title: "System Design & Sizing", duration: "55 min", completed: false },
    ]
  },
];

const onboardingChecklist = [
  { id: 1, title: "Complete Sales School (2 days)", completed: true },
  { id: 2, title: "Watch Solar Fundamentals Videos", completed: true },
  { id: 3, title: "Shadow 3 experienced reps", completed: false },
  { id: 4, title: "Close first deal", completed: false },
];

export default function Onboarding() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Onboarding Portal</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to access training materials.</p>
          <Button onClick={() => navigate("/")}>Return Home</Button>
        </Card>
      </div>
    );
  }

  const completedModules = trainingModules.flatMap(cat => cat.modules).filter(m => m.completed).length;
  const totalModules = trainingModules.flatMap(cat => cat.modules).length;
  const completedChecklist = onboardingChecklist.filter(item => item.completed).length;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to Florida Solar Academy</h1>
          <p className="text-muted-foreground mb-6">Your personalized onboarding and training portal</p>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 border-border">
              <div className="flex items-center gap-4">
                <BookOpen className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Training Progress</p>
                  <p className="text-2xl font-bold">{completedModules}/{totalModules}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Onboarding Steps</p>
                  <p className="text-2xl font-bold">{completedChecklist}/{onboardingChecklist.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Your Status</p>
                  <p className="text-2xl font-bold">In Training</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Training Modules</h2>
            <Tabs defaultValue="Sales Fundamentals" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                {trainingModules.map(cat => (
                  <TabsTrigger key={cat.category} value={cat.category}>
                    {cat.category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {trainingModules.map(category => (
                <TabsContent key={category.category} value={category.category} className="space-y-4">
                  <h3 className="text-lg font-bold">{category.category}</h3>
                  <div className="space-y-3">
                    {category.modules.map(module => (
                      <Card key={module.id} className="p-4 hover:shadow-md transition border-border">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            {module.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            ) : (
                              <Play className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-semibold">{module.title}</p>
                              <p className="text-sm text-muted-foreground">{module.duration}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="border-border">
                            {module.completed ? "Review" : "Start"}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Onboarding Checklist</h2>
            <Card className="p-6 border-border space-y-4">
              {onboardingChecklist.map(item => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${item.completed ? "bg-primary border-primary" : "border-border"}`}>
                    {item.completed && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                  </div>
                  <p className={`text-sm ${item.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {item.title}
                  </p>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
