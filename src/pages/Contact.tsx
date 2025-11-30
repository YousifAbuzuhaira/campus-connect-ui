import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  Phone,
  Send,
  HelpCircle,
  Users,
  Bug,
  Lightbulb,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/Navbar";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground">
              Get in Touch
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
              Contact Us
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/90">
              We're here to help! Reach out with questions, feedback, or just to
              say hello
            </p>
          </div>
        </div>
      </section>

      {/* Quick Contact Options */}
      <section className="py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              How Can We Help?
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the best way to reach us
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="mb-4 flex justify-center">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                General Support
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Questions about using UniSell
              </p>
              <Button variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                support@unisell.com
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="mb-4 flex justify-center">
                <Bug className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                Bug Reports
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Found something broken?
              </p>
              <Button variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                bugs@unisell.com
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="mb-4 flex justify-center">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                Feature Ideas
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Suggest new features
              </p>
              <Button variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                ideas@unisell.com
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="mb-4 flex justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                Partnership
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                University partnerships
              </p>
              <Button variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                partners@unisell.com
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <Card className="p-8">
              <h3 className="mb-6 text-2xl font-bold text-card-foreground">
                Send us a Message
              </h3>
              <form className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">University Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@university.edu"
                  />
                </div>

                <div>
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    placeholder="American University of Beirut Hermel"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help you?" />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your question or feedback..."
                    rows={6}
                  />
                </div>

                <Button className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <Card className="p-6">
                <h3 className="mb-4 text-xl font-semibold text-card-foreground">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-card-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">
                        hello@unisell.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-card-foreground">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        +961-1-234-5678
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-card-foreground">
                        Address
                      </p>
                      <p className="text-sm text-muted-foreground">
                        American University of Beirut Hermel
                        <br />
                        Hermel, Lebanon
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-card-foreground">
                        Support Hours
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Mon-Fri: 9:00 AM - 6:00 PM (GMT+2)
                        <br />
                        Weekend: Emergency support only
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 text-xl font-semibold text-card-foreground">
                  Quick Response Times
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      General inquiries
                    </span>
                    <Badge variant="secondary">24-48 hours</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Technical support
                    </span>
                    <Badge variant="secondary">2-4 hours</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Emergency issues
                    </span>
                    <Badge variant="destructive">30 minutes</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Partnership inquiries
                    </span>
                    <Badge variant="secondary">1 week</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-card">
                <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                  Prefer Live Chat?
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Get instant help with our in-app chat feature when you're
                  logged in.
                </p>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Login for Live Chat
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                How do I verify my university email?
              </h3>
              <p className="text-sm text-muted-foreground">
                During signup, enter your .edu email address. We'll send a
                verification link that you must click to activate your account.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                Is UniSell safe to use?
              </h3>
              <p className="text-sm text-muted-foreground">
                Yes! All users are verified students, we provide safety
                guidelines, and we recommend meeting in public campus locations.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                How much does it cost to use?
              </h3>
              <p className="text-sm text-muted-foreground">
                UniSell is completely free to use. No listing fees, no
                transaction fees, no hidden costs.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                Can I sell items from off-campus?
              </h3>
              <p className="text-sm text-muted-foreground">
                Currently, we focus on on-campus trading to ensure safety and
                convenience for our student community.
              </p>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="mb-4 text-muted-foreground">
              Don't see your question here?
            </p>
            <Button variant="outline">
              <HelpCircle className="mr-2 h-4 w-4" />
              View All FAQs
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
