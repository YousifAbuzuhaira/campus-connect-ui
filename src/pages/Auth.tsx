import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);

  const validateEmail = (email: string) => {
    // Check for .edu domain
    const eduPattern = /^[^\s@]+@[^\s@]+\.edu$/;
    setIsValidEmail(eduPattern.test(email));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Badge variant="outline" className="mb-4">
              <ShieldCheck className="mr-2 h-3 w-3" />
              Verified Students Only
            </Badge>
            <h1 className="text-3xl font-bold text-foreground">Welcome to UniSell</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in with your university email to get started
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login to Your Account</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">University Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="student@university.edu"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      Remember me
                    </label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button className="w-full">Login</Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link to="#" className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create Your Account</CardTitle>
                  <CardDescription>
                    Use your university email to verify your student status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">University Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="student@university.edu"
                        className="pl-10"
                        value={email}
                        onChange={handleEmailChange}
                      />
                      {email && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isValidEmail ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      )}
                    </div>
                    {email && !isValidEmail && (
                      <p className="text-xs text-destructive">
                        Please use your university .edu email address
                      </p>
                    )}
                    {isValidEmail && (
                      <p className="text-xs text-success">
                        ✓ Valid university email
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a strong password"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Re-enter your password"
                        className="pl-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    {password && confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-destructive">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="terms" className="mt-1 rounded" />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button className="w-full" disabled={!isValidEmail || password !== confirmPassword}>
                    Create Account
                  </Button>
                  <div className="rounded-lg border border-success/20 bg-success/5 p-4">
                    <p className="text-sm text-muted-foreground">
                      <ShieldCheck className="mr-2 inline h-4 w-4 text-success" />
                      You'll receive a verification email to confirm your student status
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
