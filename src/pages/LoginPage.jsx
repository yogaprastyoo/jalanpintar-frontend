import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { login, register, clearTokens } from '@/lib/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Register form
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('🔐 Attempting login with:', loginData.email);
      const response = await login(loginData.email, loginData.password);
      
      console.log('✅ Login response:', response);
      console.log('🔑 Access token:', localStorage.getItem('smartpath_access_token'));
      console.log('🔄 Refresh token:', localStorage.getItem('smartpath_refresh_token'));
      console.log('👤 User role:', response.user?.role);
      
      // Check if user has admin role
      if (response.user?.role !== 'admin') {
        clearTokens(); // Clear tokens for non-admin users
        toast({
          title: "Akses Ditolak! ❌",
          description: "Hanya admin yang dapat mengakses halaman ini.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Login Berhasil! 🎉",
        description: `Selamat datang, ${response.user?.name || 'Admin'}!`
      });
      navigate('/admin');
    } catch (error) {
      console.error('❌ Login error:', error);
      toast({
        title: "Login Gagal! ❌",
        description: error.message || "Email atau password salah.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.password_confirmation) {
      toast({
        title: "Error! ❌",
        description: "Password dan konfirmasi password tidak sama.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await register(registerData);
      toast({
        title: "Registrasi Berhasil! 🎉",
        description: `Akun ${response.user?.name} berhasil dibuat dengan role ${response.user?.role}!`
      });
      
      // Redirect berdasarkan role
      if (response.user?.role === 'admin') {
        navigate('/admin');
      } else {
        // User biasa bisa diarahkan ke halaman lain (misalnya dashboard user)
        toast({
          title: "Info",
          description: "Akun user berhasil dibuat. Silakan login.",
        });
        clearTokens(); // Clear token untuk user non-admin
      }
    } catch (error) {
      toast({
        title: "Registrasi Gagal! ❌",
        description: error.message || "Gagal membuat akun.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - SmartPath</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <img 
              src="https://horizons-cdn.hostinger.com/97945fa6-ac93-416e-87c3-f12e19c0f260/0bed04b4c783f6129ca30c54d33467ad.png" 
              alt="SmartPath Logo" 
              className="h-16 w-auto mx-auto mb-4" 
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SmartPath</h1>
            <p className="text-gray-600">Masuk atau daftar untuk melanjutkan</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    {isLoading ? 'Memproses...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-name">Nama Lengkap</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="john@example.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-password-confirmation">Konfirmasi Password</Label>
                    <Input
                      id="register-password-confirmation"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password_confirmation}
                      onChange={(e) => setRegisterData({ ...registerData, password_confirmation: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isLoading ? 'Memproses...' : 'Daftar Akun'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            © 2025 SmartPath. All rights reserved.
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
