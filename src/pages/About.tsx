import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Target,
  Heart,
  Award,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  Globe,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground">
              Our Story
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
              About UniSell
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/90">
              Building the most trusted marketplace for university students
              worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-foreground">
                Our Mission
              </h2>
              <p className="mb-6 text-lg text-muted-foreground">
                We believe every student deserves access to affordable
                essentials and the opportunity to earn from items they no longer
                need. UniSell was created to solve the real problems students
                face every day.
              </p>
              <p className="mb-6 text-muted-foreground">
                From overpriced textbooks to the struggle of finding buyers for
                items you've outgrown, we've built a platform that puts students
                first. Every feature is designed with safety, affordability, and
                community in mind.
              </p>
              <div className="flex gap-4">
                <Link to="/auth">
                  <Button>Join Our Community</Button>
                </Link>
              </div>
            </div>
            <Card className="p-8 bg-gradient-card">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="text-center">
                  <div className="mb-3 flex justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-foreground">
                    10,000+
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Active Students
                  </p>
                </div>
                <div className="text-center">
                  <div className="mb-3 flex justify-center">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-foreground">
                    50,000+
                  </h3>
                  <p className="text-sm text-muted-foreground">Items Sold</p>
                </div>
                <div className="text-center">
                  <div className="mb-3 flex justify-center">
                    <Globe className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-foreground">
                    100+
                  </h3>
                  <p className="text-sm text-muted-foreground">Universities</p>
                </div>
                <div className="text-center">
                  <div className="mb-3 flex justify-center">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-foreground">
                    4.8★
                  </h3>
                  <p className="text-sm text-muted-foreground">User Rating</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                Safety First
              </h3>
              <p className="text-muted-foreground">
                Every user is verified with their university email. We provide
                safety guidelines and secure payment systems to protect our
                community.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                Student-Centered
              </h3>
              <p className="text-muted-foreground">
                Built by students, for students. We understand your challenges
                and design solutions that make student life easier and more
                affordable.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                Transparency
              </h3>
              <p className="text-muted-foreground">
                No hidden fees, clear policies, and honest communication. What
                you see is what you get, always.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                Community
              </h3>
              <p className="text-muted-foreground">
                We're more than a marketplace – we're a community of students
                helping students succeed academically and financially.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                Innovation
              </h3>
              <p className="text-muted-foreground">
                We continuously improve our platform based on user feedback,
                always looking for better ways to serve our community.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                Sustainability
              </h3>
              <p className="text-muted-foreground">
                By facilitating the reuse of items, we help reduce waste and
                promote sustainable consumption among students.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">
                How It Started
              </h2>
              <p className="text-lg text-muted-foreground">
                From dorm room idea to campus-wide movement
              </p>
            </div>

            <div className="space-y-12">
              <Card className="p-8">
                <div className="grid gap-8 md:grid-cols-3">
                  <div className="text-center">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                      2023
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                      The Problem
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      A group of computer science students at AUBH noticed
                      fellow students struggling with expensive textbooks and
                      difficulty selling used items.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                      2024
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                      The Solution
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We built the first version of UniSell, focusing on safety
                      through university email verification and local campus
                      trading.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                      2025
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                      The Growth
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Now serving 10,000+ students across 100+ universities,
                      with millions in transactions and countless success
                      stories.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Our Team
            </h2>
            <p className="text-lg text-muted-foreground">
              Students building for students
            </p>
          </div>

          <Card className="p-8">
            <div className="text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-4 text-xl font-semibold text-card-foreground">
                Built by Students, For Students
              </h3>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Our team consists of current students and recent graduates who
                understand the challenges of student life. We're not just
                building a product – we're solving problems we face ourselves
                every day.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold">Join Our Mission</h2>
          <p className="mb-8 text-lg text-primary-foreground/90">
            Be part of the community that's making student life more affordable
            and sustainable
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/auth">
              <Button size="lg" variant="secondary">
                Get Started Today
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
