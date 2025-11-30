import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  DollarSign,
  MessageSquare,
  Package,
  Shield,
  Star,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default function SellerGuide() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground">
              Complete Seller Guide
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
              How to Sell Successfully on UniSell
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/90">
              Everything you need to know to become a successful seller and
              maximize your earnings
            </p>
            <Link to="/create">
              <Button size="lg" variant="secondary">
                Create Your First Listing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 text-center">
              <div className="mb-3 flex justify-center">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">92%</h3>
              <p className="text-sm text-muted-foreground">
                Items sell within 7 days
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="mb-3 flex justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                10,000+
              </h3>
              <p className="text-sm text-muted-foreground">
                Active student buyers
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="mb-3 flex justify-center">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">$250</h3>
              <p className="text-sm text-muted-foreground">
                Average monthly earnings
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Getting Started
            </h2>
            <p className="text-lg text-muted-foreground">
              Follow these simple steps to create your first listing
            </p>
          </div>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    1
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Take Great Photos
                  </h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    Use natural lighting whenever possible
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    Show multiple angles and close-ups of details
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    Include any flaws or damage honestly
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    Clean your item before photographing
                  </li>
                </ul>
              </div>
              <Card className="p-6 bg-gradient-card">
                <div className="mb-4 flex justify-center">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Listings with 3+ high-quality photos get 60% more views
                </p>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <Card className="p-6 bg-gradient-card md:order-2">
                <div className="mb-4 flex justify-center">
                  <DollarSign className="h-12 w-12 text-primary" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Research similar items to price competitively
                </p>
              </Card>
              <div className="md:order-1">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    2
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Price It Right
                  </h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    Check similar listings for market prices
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    Consider condition and age of your item
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    Leave room for negotiation (price 10-15% higher)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    Be competitive but fair
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    3
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Write a Great Description
                  </h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    Be detailed and honest about condition
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    Include brand, model, and specifications
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    Mention why you're selling
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    Add relevant keywords for searchability
                  </li>
                </ul>
              </div>
              <Card className="p-6 bg-gradient-card">
                <div className="mb-4 flex justify-center">
                  <Package className="h-12 w-12 text-primary" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Detailed descriptions reduce questions and build trust
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Best Practices
            </h2>
            <p className="text-lg text-muted-foreground">
              Tips from our most successful sellers
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                Respond Quickly
              </h3>
              <p className="text-sm text-muted-foreground">
                Reply to messages within 2 hours. Quick responses lead to faster
                sales and better ratings.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                Meet Safely
              </h3>
              <p className="text-sm text-muted-foreground">
                Always meet in public places on campus. Library, student center,
                or campus coffee shops work best.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                Build Your Reputation
              </h3>
              <p className="text-sm text-muted-foreground">
                Maintain a 4.5+ star rating. Good sellers get more views and can
                charge premium prices.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                Time Your Listings
              </h3>
              <p className="text-sm text-muted-foreground">
                Post during peak hours (6-9 PM) and at the start of semesters
                for textbooks.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                Bundle Related Items
              </h3>
              <p className="text-sm text-muted-foreground">
                Sell course books together or electronics with accessories for
                higher total value.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                Update Listings
              </h3>
              <p className="text-sm text-muted-foreground">
                Refresh your listings weekly to keep them visible. Update prices
                based on interest.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Common Mistakes to Avoid
            </h2>
            <p className="text-lg text-muted-foreground">
              Learn from others' mistakes
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 border-destructive/20">
              <div className="mb-4 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <h3 className="text-lg font-semibold text-card-foreground">
                  Poor Quality Photos
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Blurry, dark, or single-angle photos reduce interest by 70%.
                Always take multiple clear photos.
              </p>
            </Card>

            <Card className="p-6 border-destructive/20">
              <div className="mb-4 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <h3 className="text-lg font-semibold text-card-foreground">
                  Unrealistic Pricing
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Overpricing leads to no buyers, underpricing loses you money.
                Research market rates first.
              </p>
            </Card>

            <Card className="p-6 border-destructive/20">
              <div className="mb-4 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <h3 className="text-lg font-semibold text-card-foreground">
                  Slow Communication
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Taking days to respond loses interested buyers. Set up
                notifications and check messages regularly.
              </p>
            </Card>

            <Card className="p-6 border-destructive/20">
              <div className="mb-4 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <h3 className="text-lg font-semibold text-card-foreground">
                  Incomplete Descriptions
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Vague descriptions create doubt. Include all relevant details
                about condition and specifications.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Start Selling?</h2>
          <p className="mb-8 text-lg text-primary-foreground/90">
            Put these tips into practice and create your first listing
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/create">
              <Button size="lg" variant="secondary">
                Create a Listing
              </Button>
            </Link>
            <Link to="/browse">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Browse Examples
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
