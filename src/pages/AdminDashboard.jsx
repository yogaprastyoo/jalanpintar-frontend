import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Megaphone, Users, Eye, Share2, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { logout, isAuthenticated, getUserData } from '@/lib/api';
import { ROUTES, buildRoute } from '@/config/routes';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userData = getUserData();

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem."
    });
    navigate(ROUTES.LOGIN.path);
  };

  const cards = [
    {
      title: 'Form Builder',
      description: 'Buat form custom dengan payment gateway Xendit',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      action: () => navigate(ROUTES.ADMIN_FORMS.path),
      userView: () => navigate(buildRoute('USER_FORM_VIEW', 'demo'))
    },
    {
      title: 'Pengumuman',
      description: 'Kelola pengumuman magang, beasiswa, dan lainnya',
      icon: Megaphone,
      color: 'from-yellow-500 to-yellow-600',
      action: () => navigate(ROUTES.ADMIN_ANNOUNCEMENTS.path),
      userView: () => navigate(ROUTES.USER_ANNOUNCEMENTS.path)
    },
    {
      title: 'Program Afiliasi',
      description: 'Kelola afiliasi, komisi, dan penarikan dana',
      icon: Share2,
      color: 'from-green-500 to-green-600',
      action: () => navigate(ROUTES.ADMIN_AFFILIATES.path),
      userView: null
    }
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - SmartPath</title>
        <meta name="description" content="SmartPath admin dashboard untuk mengelola form dan pengumuman" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3 max-w-6xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="https://horizons-cdn.hostinger.com/97945fa6-ac93-416e-87c3-f12e19c0f260/0bed04b4c783f6129ca30c54d33467ad.png"
                  alt="SmartPath Logo"
                  className="h-10 w-auto"
                />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">SmartPath</h1>
                  <p className="text-xs text-gray-500">Admin Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* User Info */}
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-sm">
                      {(userData?.name || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {userData?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-blue-600 font-medium capitalize">
                      {userData?.role || 'admin'}
                    </p>
                  </div>
                </div>
                
                {/* Logout Button */}
                <Button 
                  onClick={handleLogout}
                  size="sm"
                  variant="outline"
                  className="gap-2 border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600">Kelola form dan pengumuman SmartPath</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
              >
                <div className={`h-2 bg-gradient-to-r ${card.color}`} />
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color}`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h2>
                      <p className="text-gray-600 text-sm">{card.description}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex gap-3">
                    <Button 
                      onClick={card.action}
                      className={`flex-1 bg-gradient-to-r ${card.color.replace('from-', 'from-').replace('to-', 'to-')} hover:opacity-90`}
                    >
                      Kelola
                    </Button>
                    {card.userView && (
                      <Button 
                        onClick={card.userView}
                        variant="outline"
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Statistik</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-600">Total Form</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">8</p>
                <p className="text-sm text-gray-600">Pengumuman</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">245</p>
                <p className="text-sm text-gray-600">Pendaftar</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">89%</p>
                <p className="text-sm text-gray-600">Conversion</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;