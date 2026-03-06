import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowRight, Zap, Leaf, TrendingUp, Users, Sun, MapPin, DollarSign, Shield, Brain, Phone, Mail } from "lucide-react";

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
  {
    title: "18-24% Efficiency",
    description: "Modern residential solar panels convert 18-24% of sunlight into usable electricity, with premium panels reaching even higher efficiency.",
  },
  {
    title: "8-12 Year Payback",
    description: "Average residential solar system breaks even in 8-12 years, then generates 15-25 years of free electricity.",
  },
  {
    title: "4-7% Home Value Increase",
    description: "Homes with solar panels sell for 4-7% more than comparable homes without solar installations.",
  },
  {
    title: "208-236x Carbon Reduction",
    description: "One acre of solar panels reduces CO\u2082 emissions 208-236 times more per year than an acre of trees.",
  },
];

const cities = [
  { name: "Tampa", description: "Growing solar market with high demand for energy-conscious homeowners", icon: "🌴" },
  { name: "Miami", description: "Premium market with excellent earning potential and year-round sunshine", icon: "🌊" },
  { name: "Fort Lauderdale", description: "Established territory with strong community support and solar adoption", icon: "☀️" },
];

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary flex items-center gap-2">
            <Sun className="h-7 w-7" />
            Florida Solar Sales Academy
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-sm text-muted-foreground hover:text-primary transition">About</a>
            <a href="#careers" className="text-sm text-muted-foreground hover:text-primary transition">Careers</a>
            <a href="#locations" className="text-sm text-muted-foreground hover:text-primary transition">Locations</a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-primary transition">Contact</a>
          </div>
          <Button
            onClick={() => navigate("/apply")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Apply Now
          </Button>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <section className="relative min-h-[600px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMAGES.hero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="relative z-10 container mx-auto px-4 py-24">
          <div className="max-w-2xl space-y-6">
            <div className="inline-block bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold">
              Now Hiring Across Florida
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              Build Your Future in <span className="text-primary">Solar Energy</span>
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed">
              Earn $100k-$300k+ your first year. Lead your own team. Help families achieve energy independence while building real wealth in the fastest-growing industry in America.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => navigate("/apply")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6"
              >
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                onClick={() => {
                  document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Learn About Solar
              </Button>
            </div>
            <div className="flex gap-8 pt-4 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Tampa, Miami, Fort Lauderdale
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Uncapped Commission
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solar Facts & Education with Image */}
      <section id="about" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                The Solar Revolution is <span className="text-primary">Here</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Florida receives over 230 days of sunshine per year, making it one of the most lucrative solar markets in the nation. The solar industry is projected to grow 400% by 2030, creating hundreds of thousands of new jobs. This is your chance to get in early and ride the wave.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Solar energy is no longer a niche product. It is a mainstream solution that saves homeowners thousands of dollars while protecting the environment. Every home you help go solar reduces carbon emissions by 3-4 tons per year, the equivalent of planting 100 trees.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={IMAGES.solarRevolution}
                alt="Solar panels on Florida rooftop with sunshine"
                className="w-full h-[350px] object-cover"
              />
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

      {/* Value Propositions */}
      <section id="careers" className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Join Florida Solar Sales Academy?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need to succeed: world-class training, proven systems, and a team that has your back.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-8 text-center border-border hover:border-primary/50 hover:shadow-lg transition-all group">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-3">Uncapped Earnings</h3>
              <p className="text-sm text-muted-foreground">
                Commission-based structure with no ceiling. Your effort equals your reward. Top performers earn $300k+ annually.
              </p>
            </Card>
            <Card className="p-8 text-center border-border hover:border-primary/50 hover:shadow-lg transition-all group">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-3">Build Your Team</h3>
              <p className="text-sm text-muted-foreground">
                Grow into leadership. Recruit, mentor, and manage your own sales organization. Earn overrides on your team's production.
              </p>
            </Card>
            <Card className="p-8 text-center border-border hover:border-primary/50 hover:shadow-lg transition-all group">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-3">Complete Autonomy</h3>
              <p className="text-sm text-muted-foreground">
                Be your own boss. Manage your schedule, territory, and growth path. No micromanagement, just results.
              </p>
            </Card>
            <Card className="p-8 text-center border-border hover:border-primary/50 hover:shadow-lg transition-all group">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-3">Real Impact</h3>
              <p className="text-sm text-muted-foreground">
                Help families save money while contributing to a sustainable energy future. Every sale makes a difference.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Leadership Team Image Section */}
      <section className="py-20 px-4 bg-primary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden shadow-2xl order-2 lg:order-1">
              <img
                src={IMAGES.leadershipTeam}
                alt="Florida Solar Sales Academy leadership team"
                className="w-full h-[400px] object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold mb-6">
                Join a Winning <span className="text-primary">Team</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Our team is a diverse group of high-performers who share one thing in common: the drive to succeed. From former teachers and military veterans to experienced sales professionals, we welcome anyone with the hunger to learn and grow.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">Comprehensive Training Program</h4>
                    <p className="text-sm text-muted-foreground">2-week paid training covering solar technology, sales techniques, and field operations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">Leadership Development</h4>
                    <p className="text-sm text-muted-foreground">Clear path from sales rep to team leader to regional manager. We promote from within.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">Mentorship & Support</h4>
                    <p className="text-sm text-muted-foreground">Every new hire is paired with a senior mentor. You are never alone in the field.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Impact */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-4">
            Making a Real <span className="text-primary">Difference</span>
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Every solar installation you help complete contributes to a cleaner, more sustainable Florida.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-border hover:shadow-lg transition">
              <h3 className="text-2xl font-bold mb-4 text-primary">Environmental Impact</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5">&#10003;</span>
                  <span>Solar energy produces zero emissions during operation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5">&#10003;</span>
                  <span>One residential system offsets 3-4 tons of CO&#8322; annually</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5">&#10003;</span>
                  <span>Reduces dependence on fossil fuels and grid demand</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5">&#10003;</span>
                  <span>Contributes to Florida's clean energy transition</span>
                </li>
              </ul>
            </Card>
            <Card className="p-8 border-border hover:shadow-lg transition">
              <h3 className="text-2xl font-bold mb-4 text-primary">Customer Benefits</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5">&#10003;</span>
                  <span>Average savings of $10,000-$30,000 over 25 years</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5">&#10003;</span>
                  <span>Energy independence and protection from rising utility rates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5">&#10003;</span>
                  <span>Increased home value by 4-7%</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5">&#10003;</span>
                  <span>30% federal tax credit (ITC) available through 2032</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials with Background */}
      <section className="relative py-20 px-4">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMAGES.testimonialBg})` }}
        />
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative z-10 container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">
            Success Stories from Our Team
          </h2>
          <p className="text-lg text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Real people. Real earnings. Real impact. Hear from team members who transformed their careers.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="p-6 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition"
              >
                <div className="space-y-4">
                  <p className="text-white italic leading-relaxed">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="border-t border-white/20 pt-4">
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-300">
                      {testimonial.title}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {testimonial.city}
                      </span>
                      <span className="text-primary font-bold text-lg">
                        {testimonial.earnings}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Localized Cities */}
      <section id="locations" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-4">
            We&apos;re Hiring Across <span className="text-primary">Florida</span>
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Choose your territory. Each market offers unique opportunities and strong earning potential.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {cities.map((city) => (
              <Card key={city.name} className="p-8 text-center border-primary/20 hover:border-primary hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{city.icon}</div>
                <h3 className="text-2xl font-bold text-primary mb-2">
                  {city.name}
                </h3>
                <p className="text-muted-foreground mb-6">{city.description}</p>
                <Button
                  onClick={() => navigate("/apply")}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
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
          <h2 className="text-4xl font-bold text-center mb-4">
            Income <span className="text-primary">Potential</span>
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Your earnings are directly tied to your effort and results. No caps. No limits.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="p-8 border-border hover:border-primary/50 hover:shadow-lg transition-all">
              <p className="text-6xl font-bold text-primary mb-2">$100k+</p>
              <p className="text-lg font-semibold mb-2">Year 1 Potential</p>
              <p className="text-sm text-muted-foreground">
                Entry-level reps with strong work ethic and coachability
              </p>
            </Card>
            <Card className="p-8 border-primary/30 border-2 hover:shadow-xl transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold">
                Most Common
              </div>
              <p className="text-6xl font-bold text-primary mb-2">$200k+</p>
              <p className="text-lg font-semibold mb-2">Year 2-3 Potential</p>
              <p className="text-sm text-muted-foreground">
                Experienced reps building their own teams and territories
              </p>
            </Card>
            <Card className="p-8 border-border hover:border-primary/50 hover:shadow-lg transition-all">
              <p className="text-6xl font-bold text-primary mb-2">$300k+</p>
              <p className="text-lg font-semibold mb-2">Leadership Potential</p>
              <p className="text-sm text-muted-foreground">
                Team leaders and regional managers with override commissions
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Hire Through Us */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Hire Through Florida Solar Sales Academy?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-border hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-4 text-primary">Access to Hidden Talent</h3>
              <p className="text-muted-foreground leading-relaxed">
                The best sales professionals are not on job boards. They are heads-down hitting quota. We have built relationships with thousands of high-performing reps across Florida. We find you talent you would never discover through traditional channels.
              </p>
            </Card>
            <Card className="p-8 border-border hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-4 text-primary">Time & Cost Efficiency</h3>
              <p className="text-muted-foreground leading-relaxed">
                A bad sales hire costs $240,000+ when you account for salary, ramp time, and lost pipeline. We save you weeks of resume screening and no-shows. Our vetting process means only top candidates reach you.
              </p>
            </Card>
            <Card className="p-8 border-border hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-4 text-primary">Market Intelligence</h3>
              <p className="text-muted-foreground leading-relaxed">
                We know what salaries are clearing, which skills are in demand, and how competitors are structuring offers. Real-time market insights ensure you are competitive and informed.
              </p>
            </Card>
            <Card className="p-8 border-border hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-4 text-primary">Reduced Risk</h3>
              <p className="text-muted-foreground leading-relaxed">
                We stand behind our hires. If a candidate does not work out in the first 60-90 days, we find you a replacement. Your success is our success.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Your Path to Success Timeline */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-4">
            Your Path to <span className="text-primary">Success</span>
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            From application to earning in as little as 3 weeks. Here is how it works.
          </p>
          <div className="space-y-8">
            {[
              { step: 1, title: "Apply (5 minutes)", desc: "Complete our quick application. Tell us about your experience, motivation, and goals. No solar experience required." },
              { step: 2, title: "Interview (24-48 hours)", desc: "We will reach out to schedule a phone screen. Learn about the role, earning potential, and team culture." },
              { step: 3, title: "Offer & Training (1-2 weeks)", desc: "Receive your offer. Start comprehensive paid training on solar technology, sales techniques, and industry best practices." },
              { step: 4, title: "Launch & Earn (Week 3+)", desc: "Hit the field with your mentor. Start closing deals and building your team. Your earnings grow with your performance." },
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

      {/* CTA Section with Background Image */}
      <section className="relative py-24 px-4">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMAGES.applyHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        <div className="relative z-10 container mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Build Your Future?
          </h2>
          <p className="text-lg text-white/90 leading-relaxed">
            Join hundreds of successful solar professionals who are earning six figures, building their teams, and making a real impact on Florida&apos;s clean energy future. No experience required. Just bring the drive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/apply")}
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 font-bold"
            >
              Apply Now - It Takes 5 Minutes
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              onClick={() => navigate("/apply")}
            >
              <Phone className="mr-2 h-5 w-5" /> Call Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-muted/50 border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-xl font-bold text-primary flex items-center gap-2 mb-4">
                <Sun className="h-6 w-6" />
                Florida Solar Sales Academy
              </div>
              <p className="text-sm text-muted-foreground">
                Building the next generation of solar energy professionals across Florida.
              </p>
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
            <p>
              &copy; 2026 Florida Solar Sales Academy. All rights reserved. | Serving Tampa, Miami, and Fort Lauderdale
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
