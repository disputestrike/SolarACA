import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowRight, Zap, Leaf, TrendingUp, Users, Sun } from "lucide-react";

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
    description: "One acre of solar panels reduces CO₂ emissions 208-236 times more per year than an acre of trees.",
  },
];

const cities = [
  { name: "Tampa", description: "Growing solar market with high demand" },
  { name: "Miami", description: "Premium market with excellent earning potential" },
  { name: "Fort Lauderdale", description: "Established territory with strong support" },
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
            Florida Solar Academy
          </div>
          <Button
            onClick={() => navigate("/apply")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Apply Now
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/15 to-secondary/15">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Build Your Future in Solar Energy
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Earn $100k-$300k+ your first year. Lead your own team. Help families achieve energy independence while building real wealth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => navigate("/apply")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5"
              >
                Learn About Solar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Solar Facts & Education */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            The Solar Revolution is Here
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solarFacts.map((fact, idx) => (
              <Card key={idx} className="p-6 border-border hover:border-primary/50 transition">
                <h3 className="font-bold text-lg mb-2 text-primary">{fact.title}</h3>
                <p className="text-sm text-muted-foreground">{fact.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Join Florida Solar Academy?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center border-border hover:border-primary/50 transition">
              <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Uncapped Earnings</h3>
              <p className="text-sm text-muted-foreground">
                Commission-based structure with no ceiling. Your effort = your reward.
              </p>
            </Card>
            <Card className="p-6 text-center border-border hover:border-primary/50 transition">
              <Users className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Build Your Team</h3>
              <p className="text-sm text-muted-foreground">
                Grow into leadership. Recruit, mentor, and manage your own sales organization.
              </p>
            </Card>
            <Card className="p-6 text-center border-border hover:border-primary/50 transition">
              <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Complete Autonomy</h3>
              <p className="text-sm text-muted-foreground">
                Be your own boss. Manage your schedule, territory, and growth path.
              </p>
            </Card>
            <Card className="p-6 text-center border-border hover:border-primary/50 transition">
              <Leaf className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Real Impact</h3>
              <p className="text-sm text-muted-foreground">
                Help families save money while contributing to a sustainable energy future.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Sustainability Impact */}
      <section className="py-16 px-4 bg-primary/10">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Making a Real Difference
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-border">
              <h3 className="text-2xl font-bold mb-4 text-primary">Environmental Impact</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Solar energy produces zero emissions during operation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>One residential system offsets 3-4 tons of CO₂ annually</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Reduces dependence on fossil fuels and grid demand</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Contributes to Florida's clean energy transition</span>
                </li>
              </ul>
            </Card>
            <Card className="p-8 border-border">
              <h3 className="text-2xl font-bold mb-4 text-primary">Customer Benefits</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Average savings of $10,000-$30,000 over 25 years</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Energy independence and protection from rising utility rates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Increased home value by 4-7%</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>30% federal tax credit (ITC) available through 2032</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Success Stories from Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="p-6 border-border hover:shadow-lg transition"
              >
                <div className="space-y-4">
                  <p className="text-foreground italic">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="border-t border-border pt-4">
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.title}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {testimonial.city}
                      </span>
                      <span className="text-primary font-bold">
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
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            We&apos;re Hiring Across Florida
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {cities.map((city) => (
              <Card key={city.name} className="p-8 text-center border-primary/20 hover:border-primary transition">
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
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Income Potential
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-5xl font-bold text-primary mb-2">$100k+</p>
              <p className="text-muted-foreground">Year 1 Potential</p>
              <p className="text-sm text-muted-foreground mt-2">
                Entry-level reps with strong work ethic
              </p>
            </div>
            <div>
              <p className="text-5xl font-bold text-primary mb-2">$200k+</p>
              <p className="text-muted-foreground">Year 2-3 Potential</p>
              <p className="text-sm text-muted-foreground mt-2">
                Experienced reps building teams
              </p>
            </div>
            <div>
              <p className="text-5xl font-bold text-primary mb-2">$300k+</p>
              <p className="text-muted-foreground">Leadership Potential</p>
              <p className="text-sm text-muted-foreground mt-2">
                Team leaders and managers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary/80 text-primary-foreground">
        <div className="container mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-4xl font-bold">
            Ready to Build Your Future?
          </h2>
          <p className="text-lg opacity-90">
            Join hundreds of successful solar professionals who are earning six figures, building their teams, and making a real impact on Florida&apos;s clean energy future.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/apply")}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            Apply Now - It Takes 5 Minutes
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>
            Florida Solar Academy | Serving Tampa, Miami, and Fort Lauderdale
          </p>
          <p className="mt-2">
            © 2026. All rights reserved. | Contact: info@floridasolaracademy.com
          </p>
        </div>
      </footer>
    </div>
  );
}
