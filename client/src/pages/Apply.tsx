import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, Upload, CheckCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { BRAND_NAME, MARKET_TERRITORIES, marketsGroupedByState, type MarketTerritory } from "@shared/markets";

type Step = "info" | "experience" | "motivation" | "resume" | "success";

/** PDF, Word, common résumé images (Google Docs: use File → Download → PDF). */
const RESUME_FILE_RE = /\.(pdf|doc|docx|png|jpe?g|webp|gif|heic|bmp|tiff?)$/i;
const MAX_RESUME_BYTES = 8 * 1024 * 1024;

export default function Apply() {
  const [step, setStep] = useState<Step>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: MARKET_TERRITORIES[0],
    experienceLevel: "",
    motivation: "",
    resume: null as File | null,
  });

  useEffect(() => {
    const track = new URLSearchParams(window.location.search).get("track");
    if (track === "rep") {
      setFormData((prev) => ({ ...prev, experienceLevel: "entry_level" }));
    } else if (track === "leader") {
      setFormData((prev) => ({ ...prev, experienceLevel: "aspiring_leader" }));
    }
  }, []);

  const submitMutation = trpc.applicants.submit.useMutation();

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
      const file = e.target.files[0];
      if (file.size > MAX_RESUME_BYTES) {
        toast.error("File must be 8MB or smaller");
        return;
      }
      if (!RESUME_FILE_RE.test(file.name)) {
        toast.error(
          "Use PDF, Word (.doc/.docx), or an image (JPG, PNG, WEBP…). From Google Docs: File → Download → PDF."
        );
        return;
      }
      setFormData((prev) => ({ ...prev, resume: file }));
      toast.success(`File selected: ${file.name}`);
    }
  };

  const validateStep = (): boolean => {
    if (step === "info") {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.city) {
        toast.error("Please fill in all fields");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email");
        return false;
      }
      if (formData.phone.replace(/\D/g, "").length < 10) {
        toast.error("Please enter a valid phone number");
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
      setIsSubmitting(true);
      try {
        let resumeBase64: string | undefined;
        let resumeFileName: string | undefined;

        if (formData.resume) {
          const reader = new FileReader();
          resumeBase64 = await new Promise((resolve) => {
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(",")[1]);
            };
            reader.readAsDataURL(formData.resume!);
          });
          resumeFileName = formData.resume.name;
        }

        await submitMutation.mutateAsync({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          city: formData.city as MarketTerritory,
          experienceLevel: formData.experienceLevel as "solar_sales" | "outside_sales" | "entry_level" | "aspiring_leader",
          motivation: formData.motivation,
          resumeBase64,
          resumeFileName,
        });

        toast.success("Application submitted successfully!");
        setStep("success");
      } catch (error) {
        console.error("Submission error:", error);
        toast.error("Failed to submit application. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const progressPercentage = ((["info", "experience", "motivation", "resume"].indexOf(step) + 1) / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Join {BRAND_NAME}</h1>
          <p className="text-muted-foreground">Start your journey to financial freedom and leadership</p>
          <p className="text-sm text-primary font-medium mt-2">Commission paid weekly — every Friday.</p>
        </div>

        {/* Progress Bar */}
        {step !== "success" && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
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
          {/* Step 1: Basic Info */}
          {step === "info" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Let's Start with Your Information</h2>
                <p className="text-muted-foreground mb-6">We'll use this to contact you about your application</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                  />
                </div>
                <div>
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

              <div>
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

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="city">Which market are you applying for?</Label>
                <Select value={formData.city} onValueChange={handleCityChange}>
                  <SelectTrigger id="city" className="max-w-full">
                    <SelectValue placeholder="Select state — city" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[min(24rem,70vh)]">
                    {marketsGroupedByState().map((group) => (
                      <SelectGroup key={group.stateCode}>
                        <SelectLabel>{group.stateName}</SelectLabel>
                        {group.items.map(({ territory }) => (
                          <SelectItem key={territory} value={territory}>
                            {territory}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Experience Level */}
          {step === "experience" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Your Experience</h2>
                <p className="text-muted-foreground mb-6">We train everyone, but we want to understand where you're starting from</p>
              </div>

              <Select value={formData.experienceLevel} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solar_sales">Solar Sales Professional</SelectItem>
                  <SelectItem value="outside_sales">Outside Sales (Other Industry)</SelectItem>
                  <SelectItem value="entry_level">Entry Level / New to Sales</SelectItem>
                  <SelectItem value="aspiring_leader">Aspiring Leader / Manager</SelectItem>
                </SelectContent>
              </Select>

              <div className="bg-primary/5 p-4 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>Pro Tip:</strong> We provide comprehensive training in solar technology, sales techniques, and leadership development. Your starting point doesn't limit your earning potential.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Motivation */}
          {step === "motivation" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Why Solar?</h2>
                <p className="text-muted-foreground mb-6">Tell us what excites you about this opportunity</p>
              </div>

              <div>
                <Label htmlFor="motivation">Your Motivation</Label>
                <Textarea
                  id="motivation"
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  placeholder="I'm excited about earning six figures, building my own team, and making an impact on America's clean energy future..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.motivation.length} / 20 characters minimum
                </p>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold">What we're looking for:</p>
                <ul className="text-sm text-foreground space-y-1">
                  <li>✓ Drive to earn significant income</li>
                  <li>✓ Weekly commission pay (Friday schedule)</li>
                  <li>✓ Interest in building a team</li>
                  <li>✓ Commitment to learning</li>
                  <li>✓ Passion for clean energy</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 4: Resume */}
          {step === "resume" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Your Resume (Optional)</h2>
                <p className="text-muted-foreground mb-6">Upload your resume so we can learn more about your background</p>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition"
                onClick={() => document.getElementById("resume-input")?.click()}>
                <Upload className="mx-auto mb-2 text-muted-foreground" size={32} />
                <p className="font-semibold mb-1">
                  {formData.resume ? formData.resume.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, Word (.doc / .docx), or image (JPG, PNG, WEBP, GIF…) — max 8MB
                </p>
              </div>

              <input
                id="resume-input"
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.gif,.heic,.bmp,.tif,.tiff,image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                <p className="text-sm text-foreground">
                  <strong>Google Docs:</strong> open your doc → <strong>File → Download → PDF</strong>, then upload the PDF here (we can&apos;t read a live Docs link).
                </p>
                <p className="text-sm text-foreground">
                  <strong>Not required:</strong> If you don&apos;t have a file ready, you can still submit without one.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === "success" && (
            <div className="text-center space-y-6">
              <CheckCircle className="mx-auto text-primary" size={64} />
              <div>
                <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
                <p className="text-muted-foreground mb-4">
                  Thank you, {formData.firstName}! We've received your application.
                </p>
              </div>

              <div className="bg-primary/5 p-6 rounded-lg space-y-3 text-left">
                <p className="font-semibold">What happens next:</p>
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <span className="font-bold text-primary">1.</span>
                    <div>
                      <p className="font-semibold">24-48 Hour Review</p>
                      <p className="text-sm text-muted-foreground">We'll review your application</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-bold text-primary">2.</span>
                    <div>
                      <p className="font-semibold">Phone Screen</p>
                      <p className="text-sm text-muted-foreground">We'll call you to discuss the role and your goals</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-bold text-primary">3.</span>
                    <div>
                      <p className="font-semibold">Offer & Training</p>
                      <p className="text-sm text-muted-foreground">If it's a fit, we'll send an offer and start your training</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground">
                We'll contact you at <strong>{formData.email}</strong> and <strong>{formData.phone}</strong>
              </p>

              <Button
                size="lg"
                onClick={() => window.location.href = "/"}
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          )}

          {/* Navigation Buttons */}
          {step !== "success" && (
            <div className="flex gap-4 mt-8">
              {step !== "info" && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
              {step !== "resume" && (
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="ml-auto"
                >
                  Next <ArrowRight className="ml-2" size={16} />
                </Button>
              )}
              {step === "resume" && (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application <ArrowRight className="ml-2" size={16} />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
