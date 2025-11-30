import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, DollarSign, Leaf, TrendingUp, BookOpen, Laptop, ShoppingBag } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 text-primary-foreground">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground">
              Trusted by 10,000+ Students
            </Badge>
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
              Your Campus Marketplace
            </h1>
            <p className="mb-8 text-xl text-primary-foreground/90">
              Buy and sell with verified students. Safe, simple, and sustainable.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link to="/browse">
                <Button size="lg" variant="outline" className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto">
                  Browse Listings
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Why Choose UniSell?</h2>
            <p className="text-lg text-muted-foreground">
              The safest way to trade on campus
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-border bg-gradient-card p-6 shadow-md transition-all hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <ShieldCheck className="h-6 w-6 text-success" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">Verified Students Only</h3>
              <p className="text-muted-foreground">
                Every user is verified with their university email. Trade with confidence knowing you're dealing with fellow students.
              </p>
            </Card>

            <Card className="border-border bg-gradient-card p-6 shadow-md transition-all hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">Save Money</h3>
              <p className="text-muted-foreground">
                Get great deals on textbooks, electronics, and more. Students help students save on essentials.
              </p>
            </Card>

            <Card className="border-border bg-gradient-card p-6 shadow-md transition-all hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">Sustainable</h3>
              <p className="text-muted-foreground">
                Reduce waste by giving items a second life. Better for your wallet and the planet.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Popular Categories</h2>
            <p className="text-lg text-muted-foreground">
              What are students buying and selling?
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/browse?category=textbooks" className="group">
              <Card className="border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <BookOpen className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <h3 className="mb-1 text-lg font-semibold text-card-foreground">Textbooks</h3>
                <p className="text-sm text-muted-foreground">Save up to 70% on course materials</p>
              </Card>
            </Link>

            <Link to="/browse?category=electronics" className="group">
              <Card className="border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <Laptop className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <h3 className="mb-1 text-lg font-semibold text-card-foreground">Electronics</h3>
                <p className="text-sm text-muted-foreground">Laptops, tablets, and accessories</p>
              </Card>
            </Link>

            <Link to="/browse?category=furniture" className="group">
              <Card className="border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <TrendingUp className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <h3 className="mb-1 text-lg font-semibold text-card-foreground">Furniture</h3>
                <p className="text-sm text-muted-foreground">Dorm essentials and more</p>
              </Card>
            </Link>

            <Link to="/browse?category=other" className="group">
              <Card className="border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <ShoppingBag className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <h3 className="mb-1 text-lg font-semibold text-card-foreground">More</h3>
                <p className="text-sm text-muted-foreground">Clothing, sports gear, and misc</p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="border-primary/20 bg-gradient-hero p-12 text-center text-primary-foreground shadow-xl">
            <h2 className="mb-4 text-3xl font-bold">Ready to Start Trading?</h2>
            <p className="mb-8 text-lg text-primary-foreground/90">
              Join thousands of students buying and selling on campus
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary">
                Sign Up with Your University Email
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 font-semibold text-foreground">UniSell</h3>
              <p className="text-sm text-muted-foreground">
                The trusted marketplace for university students
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">For Buyers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/browse" className="hover:text-foreground">Browse Listings</Link></li>
                <li><Link to="/safety" className="hover:text-foreground">Safety Tips</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">For Sellers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/create" className="hover:text-foreground">Create Listing</Link></li>
                <li><Link to="/seller-guide" className="hover:text-foreground">Seller Guide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground">About Us</Link></li>
                {/* <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li> */}
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 UniSell. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
