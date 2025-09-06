// src/pages/AdminLogin.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        console.error('Login error:', error);
        toast({ 
          title: "Login Failed", 
          description: "Invalid email or password. Please try again.", 
          variant: "destructive" 
        });
        return;
      }

      if (data.user) {
        // Check if user has admin role (you can customize this logic)
        const { data: profile, error: profileError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', data.user.email)
          .single();

        if (profileError || !profile) {
          // If no admin profile found, sign out and deny access
          await supabase.auth.signOut();
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
      toast({ 
        title: "Login Error", 
        description: "An unexpected error occurred. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card className="shadow-medium">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl sm:text-2xl">Admin Login</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">Access the admin dashboard</p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@vorwerk.com"
                    className="h-11 text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={pass} 
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="Enter your password"
                    className="h-11 text-base"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium" 
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
          <p className="text-xs sm:text-sm text-muted-foreground mt-4 text-center px-4">
            Contact system administrator for access credentials
          </p>
        </div>
      </section>
    </div>
  );
};

export default AdminLogin;