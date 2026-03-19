import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { ArrowRight, Zap, Leaf, TrendingUp, Users, Sun, MapPin, DollarSign, Shield, Brain, Phone, Mail, CheckCircle, XCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useState } from "react";

const IMAGES = {
  hero: "https://d2xsxph8kpxj0f.cloudfront.net/310519663280407830/TovehVTntbKREJsUiV75rg/hero-bg_a27e8353.jpg",
  solarRevolution: "https://d2xsxph8kpxj0f.cloudfront.net/310519663280407830/TovehVTntbKREJsUiV75rg/solar-revolution_d5cbd145.jpg",
  leadershipTeam: "https://d2xsxph8kpxj0f.cloudfront.net/310519663280407830/TovehVTntbKREJsUiV75rg/leadership-team_8f83d931.jpg",
  testimonialBg: "https://d2xsxph8kpxj0f.cloudfront.net/310519663280407830/TovehVTntbKREJsUiV75rg/testimonial-bg_c4c8091e.jpg",
  applyHero: "https://d2xsxph8kpxj0f.cloudfront.net/310519663280407830/TovehVTntbKREJsUiV75rg/apply-hero_a6314d82.jpg",
};

const testimonials = [
  {
    name: "Marcus Johnson",
    title: "Senior Solar Sales Rep",
    city: "Tampa",
    earnings: "$180k+",
    quote: "Started with no solar experience, now I'm leading a team of 5. The training and support here is unmatched.",
  },
  {
    name: "Sarah Chen",
    title: "Sales Manager",
    city: "Miami",
    earnings: "$220k+",
    quote: "The commission structure is transparent and generous. I've built real wealth doing work I believe in.",
  },
  {
    name: "David Rodriguez",
    title: "Installation Lead",
    city: "Fort Lauderdale",
    earnings: "$150k+",
    quote: "Transitioned from roofing to solar. Best decision I ever made. The team feels like family.",
  },
];

const solarFacts = [
  { title: "18-24% Efficiency", description: "Modern residential solar panels convert 18-24% of sunlight into usable electricity, with premium panels reaching even higher efficiency." },
  { title: "8-12 Year Payback", description: "Average residential solar system breaks even in 8-12 years, then generates 15-25 years of free electricity." },
  { title: "4-7% Home Value Increase", description: "Homes with solar panels sell for 4-7% more than comparable homes without solar installations." },
  { title: "208-236x Carbon Reduction", description: "One acre of solar panels reduces CO\u2082 emissions 208-236 times more per year than an acre of trees." },
];

const cities = [
  { name: "Tampa", description: "Growing solar market with high demand for energy-conscious homeowners", icon: "🌴" },
  { name: "Miami", description: "Premium market with excellent earning potential and year-round sunshine", icon: "🌊" },
  { name: "Fort Lauderdale", description: "Established territory with strong community support and solar adoption", icon: "☀️" },
];

function TalentWaitlistSection() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState<"Tampa" | "Miami" | "Fort Lauderdale" | "Other">("Tampa");
  const [done, setDone] = useState(false);
  const joinMutation = trpc.talent.joinWaitlist.useMutation({
    onSuccess: () => {
      setDone(true);
      toast.success("You're on the list!");
    },
    onError: (err) => toast.error(err.message || "Something went wrong"),
  });

  if (done) {
    return (
      <p className="text-center text-lg font-medium text-primary">
        You&apos;re on the list. We&apos;ll be in touch when something opens up near you. 🌞
      </p>
    );
  }

  return (
    <form
      className="max-w-md mx-auto space-y-4 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        joinMutation.mutate({ firstName: firstName.trim(), email: email.trim(), city });
      }}
    >
      <div>
        <Label htmlFor="talent-first">First Name</Label>
        <Input
          id="talent-first"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="mt-1.5"
          autoComplete="given-name"
        />
      </div>
      <div>
        <Label htmlFor="talent-email">Email Address</Label>
        <Input
          id="talent-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1.5"
          autoComplete="email"
        />
      </div>
      <div>
        <Label>City</Label>
        <Select value={city} onValueChange={(v) => setCity(v as typeof city)}>
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tampa">Tampa</SelectItem>
            <SelectItem value="Miami">Miami</SelectItem>
            <SelectItem value="Fort Lauderdale">Fort Lauderdale</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={joinMutation.isPending}>
        {joinMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Sending…
          </>
        ) : (
          <>
            Keep Me Posted <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      <p className="text-sm text-muted-foreground text-center">No spam. Just real opportunities when they open up near you.</p>
    </form>
  );
}

const faqs = [
  {
    q: "Do I need solar or sales experience?",
    a: "No experience necessary. We have placed former teachers, veterans, roofers, and bartenders into six-figure solar careers. If you have drive and coachability, we provide everything else — product knowledge, sales scripts, field mentorship, and ongoing coaching.",
  },
  {
    q: "Is this a job or am I starting my own business?",
    a: "This is a career position with Florida Solar Sales Academy. You are part of our team — not a contractor starting from scratch. You get full training, a mentor, a defined territory, and a compensation structure from day one. You earn uncapped commission, meaning your results directly determine your income.",
  },
  {
    q: "How fast can I start earning?",
    a: "Most reps close their first deal within the first 3 weeks of hitting the field. Our 2-week paid training gets you ready fast. Year 1 realistic target is $80k-$120k. By year 2-3, top performers hit $200k+.",
  },
  {
    q: "What cities do you operate in?",
    a: "We are currently hiring in Tampa, Miami, and Fort Lauderdale. Each market has its own team structure, territory map, and leadership pipeline. Choose the city closest to you and we will match you to the right team.",
  },
  {
    q: "What does the training look like?",
    a: "Two weeks of structured paid training covering solar technology, our proven sales system, objection handling, and field ride-alongs with senior reps. After training, you are paired with a personal mentor for your first 90 days.",
  },
  {
    q: "What is the commission structure?",
    a: "Commission-based with no ceiling. Reps earn a percentage of each deal closed, plus override commissions as they build and lead their own team. The more you sell and the more you grow your team, the higher your earnings.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-6 text-left hover:bg-muted/30 transition"
      >
        <span className="font-semibold text-base pr-4">{q}</span>
        {open ? <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-primary flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2 hover:opacity-90 transition">
            <Sun className="h-7 w-7" />
            Florida Solar Sales Academy
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#problem" className="text-sm text-muted-foreground hover:text-primary transition">Why Solar</a>
            <a href="#what-you-get" className="text-sm text-muted-foreground hover:text-primary transition">What You Get</a>
            <a href="#locations" className="text-sm text-muted-foreground hover:text-primary transition">Locations</a>
            <a href="#talent-community" className="text-sm text-muted-foreground hover:text-primary transition">Stay in the Loop</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-primary transition">FAQ</a>
          </div>
          <Button onClick={() => navigate("/apply")} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Apply Now
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[620px] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${IMAGES.hero})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />
        <div className="relative z-10 container mx-auto px-4 py-24">
          <div className="max-w-2xl space-y-6">
            {/* NEW: No experience badge */}
            <div className="flex flex-wrap gap-3">
              <div className="inline-block bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold">
                Now Hiring Across Florida
              </div>
              <div className="inline-block bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-semibold border border-white/30">
                ✓ No Solar Experience Required
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              Build Your Future in <span className="text-primary">Solar Energy</span>
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed">
              Earn $100k-$300k+ your first year. Lead your own team. Help Florida families achieve energy independence while building real wealth in the fastest-growing industry in America.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" onClick={() => navigate("/apply")} className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                onClick={() => document.getElementById("problem")?.scrollIntoView({ behavior: "smooth" })}>
                See How It Works
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-white/80 text-sm">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Tampa · Miami · Fort Lauderdale</div>
              <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Uncapped Commission</div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Social Proof Numbers Bar */}
      <section className="bg-primary py-6 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-primary-foreground">
            <div>
              <p className="text-3xl font-bold">750+</p>
              <p className="text-sm opacity-80">Candidates Placed</p>
            </div>
            <div>
              <p className="text-3xl font-bold">3</p>
              <p className="text-sm opacity-80">Florida Markets</p>
            </div>
            <div>
              <p className="text-3xl font-bold">$180k+</p>
              <p className="text-sm opacity-80">Avg Year 2 Earnings</p>
            </div>
            <div>
              <p className="text-3xl font-bold">3 Weeks</p>
              <p className="text-sm opacity-80">Avg Time to First Deal</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role tracks + selective hiring */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Two Paths. One Academy. <span className="text-primary">Both Win.</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you want to own a territory in the field or grow into leadership, we train you for a solar career with real upside.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="p-8 border-border hover:border-primary/50 transition-all flex flex-col h-full">
              <h3 className="text-2xl font-bold text-primary mb-2">Sales Rep</h3>
              <p className="text-muted-foreground mb-6 flex-1 leading-relaxed">
                Master our system, work your market, and earn uncapped commission with a mentor in your corner from day one.
              </p>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate("/apply?track=rep")}>
                Apply as Sales Rep <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
            <Card className="p-8 border-border hover:border-primary/50 transition-all flex flex-col h-full">
              <h3 className="text-2xl font-bold text-primary mb-2">Sales Leader</h3>
              <p className="text-muted-foreground mb-6 flex-1 leading-relaxed">
                Build, coach, and scale a team — with leadership paths and overrides that reward how you grow others.
              </p>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate("/apply?track=leader")}>
                Apply as Sales Leader <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </div>
          <div className="max-w-3xl mx-auto text-center bg-muted/50 border border-border rounded-2xl p-10">
            <h3 className="text-2xl font-bold mb-4">We&apos;re Selective</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              We don&apos;t hire everyone. We look for drive, coachability, and integrity — people who want to build a career, not just punch a clock.
            </p>
            <Button size="lg" onClick={() => navigate("/apply")} className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6">
              Think You Have What It Takes? Apply Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* NEW: The Problem / The Solution */}
      <section id="problem" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Most Jobs Cap Your <span className="text-destructive">Potential</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You work harder, the company profits more — but your paycheck stays the same. Solar changes that equation completely.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem column */}
            <Card className="p-8 border-destructive/30 bg-destructive/5">
              <h3 className="text-xl font-bold mb-6 text-destructive flex items-center gap-2">
                <XCircle className="h-6 w-6" /> Where You Are Now
              </h3>
              <ul className="space-y-4">
                {[
                  "Stuck in a job with a salary ceiling — no matter how hard you work",
                  "No clear path to $100k+ income without years of waiting",
                  "Trading your time for an hourly rate that never changes",
                  "Watching others build wealth while you stay in place",
                  "No mentorship, no coaching, no real growth plan",
                  "A career that doesn't excite you — just pays the bills",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
            {/* Solution column */}
            <Card className="p-8 border-primary/30 bg-primary/5">
              <h3 className="text-xl font-bold mb-6 text-primary flex items-center gap-2">
                <CheckCircle className="h-6 w-6" /> Where Solar Takes You
              </h3>
              <ul className="space-y-4">
                {[
                  "Uncapped commission — your effort directly equals your income",
                  "Clear path to $100k year 1, $200k+ by year 2-3",
                  "Build your own team and earn overrides on their production",
                  "Be your own boss — manage your schedule and territory",
                  "Personal mentor for your first 90 days plus ongoing coaching",
                  "Work you believe in — helping families save money and go green",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* NEW: Is This In Your Head? */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="bg-muted/50 border border-border rounded-2xl p-10">
            <div className="text-2xl md:text-3xl font-bold italic leading-relaxed text-foreground mb-6 space-y-3">
              <p className="m-0">&ldquo;I want to make real money — but I don&apos;t know where to start.</p>
              <p className="m-0">I&apos;m tired of jobs with a ceiling on my income and no real future.</p>
              <p className="m-0">I want something where my effort actually determines what I earn…</p>
              <p className="m-0">and where I can build something real.&rdquo;</p>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              If that&apos;s been on your mind — you&apos;re exactly where you need to be.
            </p>
            <Button size="lg" onClick={() => navigate("/apply")} className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6">
              Apply Now — Takes 5 Minutes <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* NEW: What You Get */}
      <section id="what-you-get" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">What You Get When You <span className="text-primary">Join</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We don't just hire you and wish you luck. We give you everything you need to hit the ground running.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Brain className="h-8 w-8 text-primary" />, title: "2-Week Paid Training", desc: "Solar technology, our proven sales system, objection handling, and field ride-alongs. You'll be ready to close before you finish." },
              { icon: <Users className="h-8 w-8 text-primary" />, title: "Personal Mentor (90 Days)", desc: "Every new hire is paired with a senior rep. You're never alone in the field. Ask anything, anytime." },
              { icon: <TrendingUp className="h-8 w-8 text-primary" />, title: "Clear Leadership Path", desc: "Rep → Senior Rep → Team Lead → Regional Manager. We promote from within. Your ceiling is how high you want to go." },
              { icon: <Shield className="h-8 w-8 text-primary" />, title: "Proven Sales System", desc: "A tested, repeatable process for finding prospects, presenting solar, handling objections, and closing deals — no guessing." },
              { icon: <Zap className="h-8 w-8 text-primary" />, title: "Live Weekly Coaching", desc: "Group coaching sessions every week covering objection handling, deal reviews, and market updates to keep you sharp." },
              { icon: <Leaf className="h-8 w-8 text-primary" />, title: "Work You Believe In", desc: "Help Florida homeowners slash their energy bills and go green. Every sale makes a real difference — and you'll know it." },
            ].map((item, i) => (
              <Card key={i} className="p-8 border-border hover:border-primary/50 hover:shadow-lg transition-all group">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition">
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solar Facts */}
      <section id="about" className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-4xl font-bold mb-6">The Solar Revolution is <span className="text-primary">Here</span></h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Florida receives over 230 days of sunshine per year, making it one of the most lucrative solar markets in the nation. The solar industry is projected to grow 400% by 2030, creating hundreds of thousands of new jobs.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every home you help go solar reduces carbon emissions by 3-4 tons per year — the equivalent of planting 100 trees. Real income. Real impact.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img src={IMAGES.solarRevolution} alt="Solar panels on Florida rooftop" className="w-full h-[350px] object-cover" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solarFacts.map((fact, idx) => (
              <Card key={idx} className="p-6 border-border hover:border-primary/50 hover:shadow-lg transition-all">
                <h3 className="font-bold text-lg mb-2 text-primary">{fact.title}</h3>
                <p className="text-sm text-muted-foreground">{fact.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Dual Column Contrast — As a candidate */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Which Path Are <span className="text-primary">You On?</span></h2>
            <p className="text-lg text-muted-foreground">The only difference between these two futures is a 5-minute application.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-xl border border-border">
            {/* Left: Stay stuck */}
            <div className="bg-muted/50 p-10">
              <h3 className="text-xl font-bold mb-6 text-muted-foreground">Keep Doing What You're Doing</h3>
              <ul className="space-y-4">
                {[
                  "Keep explaining missed income goals",
                  "Keep watching your salary stay flat",
                  "Keep doubting there's a better path",
                  "Keep seeing others build wealth around you",
                  "Keep trading time for capped wages",
                  "Keep waiting for the right opportunity",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Right: Join */}
            <div className="bg-primary p-10">
              <h3 className="text-xl font-bold mb-6 text-primary-foreground">Join Florida Solar Sales Academy</h3>
              <ul className="space-y-4">
                {[
                  "More focus on growing your income, less stress",
                  "A clear system to hit $100k year 1",
                  "Confidence you chose the right career move",
                  "Freedom to scale your earnings with your effort",
                  "Pride in your results and your team's growth",
                  "Start closing deals in your first 3 weeks",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-primary-foreground">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 opacity-90" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="text-center mt-10">
            <Button size="lg" onClick={() => navigate("/apply")} className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-10 py-6">
              I'm Ready — Apply Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${IMAGES.testimonialBg})` }} />
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative z-10 container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Success Stories from Our Team</h2>
          <p className="text-lg text-gray-300 text-center mb-12 max-w-2xl mx-auto">Real people. Real earnings. Real impact.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-6 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition">
                <div className="space-y-4">
                  <p className="text-white italic leading-relaxed">&quot;{t.quote}&quot;</p>
                  <div className="border-t border-white/20 pt-4">
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-sm text-gray-300">{t.title}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" />{t.city}</span>
                      <span className="text-primary font-bold text-lg">{t.earnings}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section id="locations" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-4">We&apos;re Hiring Across <span className="text-primary">Florida</span></h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">Choose your territory. Each market has its own team, leadership structure, and earning potential.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {cities.map((city) => (
              <Card key={city.name} className="p-8 text-center border-primary/20 hover:border-primary hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{city.icon}</div>
                <h3 className="text-2xl font-bold text-primary mb-2">{city.name}</h3>
                <p className="text-muted-foreground mb-6">{city.description}</p>
                <Button onClick={() => navigate("/apply")} variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  Apply in {city.name}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Income Potential */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-4">Income <span className="text-primary">Potential</span></h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">No caps. No limits. Your earnings grow as you do.</p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="p-8 border-border hover:border-primary/50 hover:shadow-lg transition-all">
              <p className="text-6xl font-bold text-primary mb-2">$100k+</p>
              <p className="text-lg font-semibold mb-2">Year 1 Potential</p>
              <p className="text-sm text-muted-foreground">Entry-level reps with strong work ethic and coachability</p>
            </Card>
            <Card className="p-8 border-primary/30 border-2 hover:shadow-xl transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold">Most Common</div>
              <p className="text-6xl font-bold text-primary mb-2">$200k+</p>
              <p className="text-lg font-semibold mb-2">Year 2-3 Potential</p>
              <p className="text-sm text-muted-foreground">Experienced reps building their own teams and territories</p>
            </Card>
            <Card className="p-8 border-border hover:border-primary/50 hover:shadow-lg transition-all">
              <p className="text-6xl font-bold text-primary mb-2">$300k+</p>
              <p className="text-lg font-semibold mb-2">Leadership Potential</p>
              <p className="text-sm text-muted-foreground">Team leaders and regional managers with override commissions</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Path to Success */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-4">3 Steps to <span className="text-primary">Get Started</span></h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">From application to earning in as little as 3 weeks.</p>
          <div className="space-y-8">
            {[
              { step: 1, title: "Apply (5 minutes)", desc: "Complete our quick application. No solar experience required. Just tell us about yourself and your goals." },
              { step: 2, title: "Interview & Offer (24-48 hours)", desc: "We move fast. You will hear from us within 24-48 hours to schedule a call, meet the team, and review your offer." },
              { step: 3, title: "Train, Launch & Earn (Week 1-3)", desc: "Two weeks of paid training with your mentor, then hit the field. Most reps close their first deal within week 3." },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground font-bold text-xl shadow-lg">
                    {item.step}
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist / talent capture */}
      <section id="talent-community" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-4">Not Ready Yet? <span className="text-primary">Stay in the Loop</span></h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Share your name and email — we&apos;ll notify you when hiring opens or events pop up near you.
          </p>
          <TalentWaitlistSection />
        </div>
      </section>

      {/* NEW: FAQ */}
      <section id="faq" className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked <span className="text-primary">Questions</span></h2>
            <p className="text-lg text-muted-foreground">Everything you need to know before you apply.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </div>
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Still have questions? We are happy to talk.</p>
            <Button size="lg" onClick={() => navigate("/apply")} className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6">
              Apply Now & We'll Answer Everything <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* NEW: Founder Note */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img src={IMAGES.leadershipTeam} alt="Florida Solar Sales Academy team" className="w-full h-[380px] object-cover" />
            </div>
            <div>
              <p className="text-primary font-semibold mb-3 uppercase tracking-wide text-sm">About Us</p>
              <h2 className="text-3xl font-bold mb-6">We Built This Because Hiring Was <span className="text-primary">Broken</span></h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We spent years watching talented people get placed in the wrong roles with no training, no mentorship, and no real path forward. They'd burn out in 90 days and the company would start over.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Florida Solar Sales Academy was built to fix that. We use structured interviews, qualification scoring, and a real onboarding system to make sure every person we bring on has what it takes — and every person we bring on gets what they need to succeed.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We don't just fill seats. We build careers.
              </p>
              <Button onClick={() => navigate("/apply")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Join Our Team <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-4">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${IMAGES.applyHero})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        <div className="relative z-10 container mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Build Your Future?</h2>
          <p className="text-lg text-white/90 leading-relaxed">
            Join hundreds of solar professionals earning six figures, building their teams, and making a real impact on Florida's clean energy future. No experience required. Just bring the drive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/apply")} className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 font-bold">
              Apply Now — It Takes 5 Minutes
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-muted/50 border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2 mb-4 hover:opacity-90 transition">
                <Sun className="h-6 w-6" /> Florida Solar Sales Academy
              </Link>
              <p className="text-sm text-muted-foreground">Building the next generation of solar energy professionals across Florida.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Locations</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Tampa, FL</li>
                <li className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Miami, FL</li>
                <li className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Fort Lauderdale, FL</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Mail className="h-3 w-3" /> info@floridasolarsalesacademy.com</li>
                <li className="flex items-center gap-2"><Phone className="h-3 w-3" /> (888) 555-SOLAR</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2026 Florida Solar Sales Academy. All rights reserved. | Serving Tampa, Miami, and Fort Lauderdale</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
