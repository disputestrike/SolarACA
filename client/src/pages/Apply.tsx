import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, Upload, CheckCircle } from "lucide-react";

type Step = "info" | "experience" | "motivation" | "resume" | "success";

export default function Apply() {
  const [step, setStep] = useState<Step>("info");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    experienceLevel: "",
    motivation: "",
    resume: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, experienceLevel: value }));
  };

  const handleCityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, city: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  const validateStep = (): boolean => {
    if (step === "info") {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.city) {
        toast.error("Please fill in all fields");
        return false;
      }
    }
    if (step === "experience") {
      if (!formData.experienceLevel) {
        toast.error("Please select your experience level");
        return false;
      }
    }
    if (step === "motivation") {
      if (!formData.motivation || formData.motivation.length < 20) {
        toast.error("Please tell us more about your motivation (at least 20 characters)");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    const steps: Step[] = ["info", "experience", "motivation", "resume", "success"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    const steps: Step[] = ["info", "experience", "motivation", "resume", "success"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (step === "resume") {
      // TODO: Submit form data to backend
      toast.success("Application submitted successfully!");
      setStep("success");
    }
  };

  const progressPercentage = ((["info", "experience", "motivation", "resume"].indexOf(step) + 1) / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Join Florida Solar Academy</h1>
          <p className="text-muted-foreground">
            {step === "success"
              ? "Thank you for applying!"
              : `Step ${["info", "experience", "motivation", "resume"].indexOf(step) + 1} of 4`}
          </p>
        </div>

        {/* Progress Bar */}
        {step !== "success" && (
          <div className="mb-8">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Card */}
        <Card className="p-8 border-border">
          {step === "info" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Let&apos;s start with your basics</h2>
                <p className="text-muted-foreground mb-6">We&apos;ll use this to contact you about your application.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Which Florida city are you in?</Label>
                <Select value={formData.city} onValueChange={handleCityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tampa">Tampa</SelectItem>
                    <SelectItem value="Miami">Miami</SelectItem>
                    <SelectItem value="Fort Lauderdale">Fort Lauderdale</SelectItem>
                    <SelectItem value="Other">Other Florida City</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === "experience" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Tell us about your experience</h2>
                <p className="text-muted-foreground mb-6">
                  We welcome everyone from solar pros to complete beginners.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">What&apos;s your background?</Label>
                  <Select value={formData.experienceLevel} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solar_sales">Solar Sales Experience</SelectItem>
                      <SelectItem value="outside_sales">Outside Sales (Other Industry)</SelectItem>
                      <SelectItem value="entry_level">New to Sales</SelectItem>
                      <SelectItem value="aspiring_leader">Aspiring Leader/Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>No experience needed!</strong> We provide comprehensive training for all levels, from solar product knowledge to leadership development.
                </p>
              </div>
            </div>
          )}

          {step === "motivation" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">What drives you?</h2>
                <p className="text-muted-foreground mb-6">
                  Help us understand your goals and what motivates you to pursue a career in solar sales.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivation">Tell us about your motivation</Label>
                <Textarea
                  id="motivation"
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  placeholder="I'm interested in solar sales because... I want to earn $100k+ and build my own team... I'm passionate about renewable energy..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.motivation.length} characters (minimum 20)
                </p>
              </div>

              <div className="bg-secondary/10 p-4 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>Tip:</strong> Share your genuine goals. We&apos;re looking for motivated individuals who want financial freedom, leadership opportunities, and to make an impact.
                </p>
              </div>
            </div>
          )}

          {step === "resume" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Upload your resume</h2>
                <p className="text-muted-foreground mb-6">
                  (Optional - but it helps us learn more about you)
                </p>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium">
                    {formData.resume ? formData.resume.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX (max 10MB)</p>
                </label>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>Don&apos;t have a resume?</strong> That&apos;s okay! We can work with you. Your motivation and drive matter more than a perfect resume.
                </p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-6">
              <CheckCircle className="h-16 w-16 text-primary mx-auto" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
                <p className="text-muted-foreground mb-4">
                  Thank you for applying to Florida Solar Academy. We&apos;re excited to learn more about you and your potential.
                </p>
              </div>

              <div className="bg-primary/10 p-6 rounded-lg space-y-2">
                <p className="font-medium">What&apos;s next?</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll review your application and contact you within 24 hours to schedule an interview. Keep an eye on your email and phone.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Questions? Contact us at <strong>info@floridasolaracademy.com</strong> or <strong>(555) 123-4567</strong>
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {step !== "success" && (
            <div className="flex gap-4 mt-8 justify-between">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={step === "info"}
                className="border-border"
              >
                Back
              </Button>
              <Button
                onClick={step === "resume" ? handleSubmit : handleNext}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {step === "resume" ? "Submit Application" : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
