// src/pages/AdminLogin.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, Lock, User, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('Login error:', error);
        setError('Invalid email or password. Please try again.');
        toast({ 
          title: "Login Failed", 
          description: "Invalid email or password. Please try again.", 
          variant: "destructive" 
        });
        return;
      }

      if (data.user) {
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', data.user.email)
          .single();

        if (profileError || !profile) {
          // If no admin profile found, sign out and deny access
          await supabase.auth.signOut();
          setError('You don\'t have admin privileges.');
          toast({ 
            title: "Access Denied", 
            description: "You don't have admin privileges.", 
            variant: "destructive" 
          });
          return;
        }

        // Store admin session
        localStorage.setItem("adminAuthed", "true");
        localStorage.setItem("adminUser", JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name: profile.name || data.user.email
        }));

        toast({ 
          title: "Welcome", 
          description: `Logged in as ${profile.name || data.user.email}` 
        });
        
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      setError('An unexpected error occurred. Please try again.');
      toast({ 
        title: "Login Error", 
        description: "An unexpected error occurred. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />
      
      <main id="main-content" className="relative">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container-responsive spacing-responsive-lg">
          <div className="max-w-md mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>

            {/* Login Card */}
            <Card className="card-responsive shadow-lg border-0 bg-card/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>

                {/* Title */}
                <CardTitle className="text-responsive-2xl font-bold text-foreground mb-2">
                  Admin Login
                </CardTitle>
                
                {/* Description */}
                <p className="text-responsive text-muted-foreground">
                  Access the admin dashboard to manage bookings and studio availability
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
                    <AlertDescription className="text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="email" 
                      className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={cn(
                        "h-11 text-base transition-all duration-200",
                        "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                        error && "border-destructive focus:border-destructive focus:ring-destructive/20"
                      )}
                      required
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="password" 
                      className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={cn(
                          "h-11 text-base pr-12 transition-all duration-200",
                          "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                          error && "border-destructive focus:border-destructive focus:ring-destructive/20"
                        )}
                        required
                        autoComplete="current-password"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium btn-responsive"
                    disabled={isLoading || !email || !password}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Sign In
                      </div>
                    )}
                  </Button>
                </form>

                {/* Security Notice */}
                <div className="text-center pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    This is a secure admin area. All activities are logged and monitored.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Help */}
            <div className="text-center mt-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                Need help accessing your account?
              </p>
              <Button 
                variant="link" 
                size="sm" 
                className="text-primary hover:text-primary/80 p-0 h-auto"
                onClick={() => {
                  // In a real app, this would open a support modal or navigate to help
                  alert('Please contact your system administrator for assistance.');
                }}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;