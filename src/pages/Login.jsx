import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, checkUserAuth } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  if (!isLoadingAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        await checkUserAuth();
        navigate('/', { replace: true });
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (signUpError) throw signUpError;

        if (data?.session) {
          await checkUserAuth();
          navigate('/', { replace: true });
        } else {
          setInfo('Account created. Please check your email to confirm, then sign in.');
          setMode('signin');
        }
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="login_root"
      className="min-h-screen flex items-center justify-center bg-background px-4 py-12"
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">QuickShield</h1>
          <p className="text-lg text-muted-foreground mt-1 font-extralight">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {mode === 'signin' ? 'Sign in' : 'Sign up'}
            </CardTitle>
            <CardDescription className="text-lg font-extralight">
              {mode === 'signin'
                ? 'Use your email and password to access your account.'
                : 'Create an account to get started.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="login_full_name" className="text-lg">Full name</Label>
                  <Input
                    id="login_full_name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login_email" className="text-lg">Email</Label>
                <Input
                  id="login_email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login_password" className="text-lg">Password</Label>
                <Input
                  id="login_password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                {mode === 'signup' && (
                  <p className="text-lg text-muted-foreground font-extralight">
                    Use at least 6 characters.
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
                  <p className="text-lg text-destructive font-extralight">{error}</p>
                </div>
              )}
              {info && (
                <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
                  <p className="text-lg text-primary font-extralight">{info}</p>
                </div>
              )}

              <Button type="submit" className="w-full text-lg" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              {mode === 'signin' ? (
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); setInfo(null); }}
                  className="text-lg text-primary hover:underline font-extralight"
                >
                  Don&apos;t have an account? Sign up
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); setInfo(null); }}
                  className="text-lg text-primary hover:underline font-extralight"
                >
                  Already have an account? Sign in
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
