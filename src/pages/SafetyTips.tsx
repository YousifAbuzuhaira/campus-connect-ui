import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  MapPin,
  Users,
  Eye,
  Phone,
  MessageCircle,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Lock,
  UserCheck,
  Camera,
  Clock,
  Flag,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/components/layout/Navbar";

export default function SafetyTips() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground">
              Your Safety First
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
              Safety Tips for UniSell
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/90">
              Essential guidelines to help you buy and sell safely on campus
            </p>
            <Link to="/browse">
              <Button size="lg" variant="secondary">
                Start Shopping Safely
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Safety Stats */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="p-6 text-center">
              <div className="mb-3 flex justify-center">
                <UserCheck className="h-8 w-8 text-success" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">100%</h3>
              <p className="text-sm text-muted-foreground">Verified Students</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="mb-3 flex justify-center">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">99.8%</h3>
              <p className="text-sm text-muted-foreground">Safe Transactions</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="mb-3 flex justify-center">
                <MapPin className="h-8 w-8 text-success" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                Campus
              </h3>
              <p className="text-sm text-muted-foreground">
                Safe Meeting Zones
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="mb-3 flex justify-center">
                <Flag className="h-8 w-8 text-success" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">24/7</h3>
              <p className="text-sm text-muted-foreground">Report System</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Critical Safety Alert */}
      <section className="py-12">
        <div className="container">
          <Alert className="border-destructive bg-destructive/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-base">
              <strong>Important:</strong> Never meet strangers off-campus or
              share personal financial information. Always use UniSell's
              built-in messaging system for communication.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Meeting Safety */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Safe Meeting Guidelines
            </h2>
            <p className="text-lg text-muted-foreground">
              Where and how to meet safely for transactions
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Safe Locations */}
            <Card className="p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  Safe Meeting Places
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      Campus Library
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Well-lit, monitored, lots of people around
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      Student Center
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Busy public area with security presence
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      Campus Coffee Shops
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Popular hangout spots with good visibility
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      Academic Buildings
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      During class hours with high foot traffic
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Unsafe Locations */}
            <Card className="p-8 border-destructive/20">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  Avoid These Places
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      Private Dorm Rooms
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Never meet strangers in private spaces
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      Off-Campus Locations
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Stay within campus boundaries
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      Isolated Areas
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Parking lots, empty buildings, basements
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      Late Night Meetings
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Meet during daylight or busy evening hours
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Communication Safety */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Communication Safety
            </h2>
            <p className="text-lg text-muted-foreground">
              How to communicate safely with other users
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                Use In-App Messaging
              </h3>
              <p className="text-sm text-muted-foreground">
                Always communicate through UniSell's messaging system. Never
                share personal phone numbers or social media accounts.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                Protect Personal Info
              </h3>
              <p className="text-sm text-muted-foreground">
                Don't share your exact address, room number, class schedule, or
                other personal details with buyers or sellers.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Flag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                Report Suspicious Behavior
              </h3>
              <p className="text-sm text-muted-foreground">
                If someone asks to meet off-campus, wants your personal info, or
                makes you uncomfortable, report them immediately.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Payment Safety */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Payment Safety
            </h2>
            <p className="text-lg text-muted-foreground">
              How to handle payments securely
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  Safe Payment Methods
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      UniSell Wallet System
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Secure, built-in payment system (recommended)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      Cash (In-Person Only)
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      When meeting face-to-face in safe locations
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      University Payment Systems
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      If your campus offers secure payment options
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-destructive/20">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  Payment Red Flags
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      Wire Transfers
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Never send wire transfers to strangers
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      Gift Cards
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Legitimate buyers don't pay with gift cards
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      Overpayment Scams
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Be suspicious of overpayments and refund requests
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      Advance Payments
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Never pay in advance without meeting the seller
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Tips */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Additional Safety Tips
            </h2>
            <p className="text-lg text-muted-foreground">
              Extra precautions for a safe experience
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                Bring a Friend
              </h3>
              <p className="text-sm text-muted-foreground">
                When meeting for high-value items, consider bringing a trusted
                friend along for safety.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                Inspect Before Buying
              </h3>
              <p className="text-sm text-muted-foreground">
                Always inspect items thoroughly before completing the purchase.
                Check for damage or defects.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                Trust Your Instincts
              </h3>
              <p className="text-sm text-muted-foreground">
                If something feels wrong or too good to be true, trust your gut
                and walk away from the transaction.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                Check User Profiles
              </h3>
              <p className="text-sm text-muted-foreground">
                Review seller ratings, read reviews, and check how long they've
                been on the platform.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                Emergency Contacts
              </h3>
              <p className="text-sm text-muted-foreground">
                Always let someone know where you're going and when you expect
                to return from meetings.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                Verify Student Status
              </h3>
              <p className="text-sm text-muted-foreground">
                All users are verified students, but you can also ask to see
                their student ID if you feel uncertain.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16">
        <div className="container">
          <Card className="p-8 bg-destructive/5 border-destructive/20">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <Phone className="h-12 w-12 text-destructive" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-card-foreground">
                Emergency Situations
              </h3>
              <p className="mb-6 text-muted-foreground">
                If you feel unsafe or encounter suspicious behavior, contact
                campus security immediately.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button variant="destructive">
                  <Phone className="mr-2 h-4 w-4" />
                  Campus Security: 911
                </Button>
                <Button variant="outline">
                  <Flag className="mr-2 h-4 w-4" />
                  Report to UniSell
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold">Stay Safe, Trade Smart</h2>
          <p className="mb-8 text-lg text-primary-foreground/90">
            Follow these guidelines to have a safe and successful experience on
            UniSell
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/browse">
              <Button size="lg" variant="secondary">
                Start Shopping
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Report an Issue
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
