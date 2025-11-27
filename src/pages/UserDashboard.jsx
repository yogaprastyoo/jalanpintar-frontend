import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, FileText, Trophy, DollarSign, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { logout, getUserData } from '@/lib/api';
import UserAffiliateStats from '../components/UserAffiliateStats';
import UserFormList from '../components/UserFormList';
import AffiliateLinksManager from '../components/AffiliateLinksManager';
import { ROUTES } from '@/config/routes';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userData = getUserData();
  const [userAffiliates, setUserAffiliates] = useState(null);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem."
    });
    navigate(ROUTES.LOGIN.path);
  };

  const quickActions = [
    {
      title: 'Isi Form',
      description: 'Lihat dan isi form yang tersedia',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      action: () => document.getElementById('forms-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      title: 'Statistik Afiliasi',
      description: 'Lihat performa afiliasi Anda',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      action: () => document.getElementById('stats-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      title: 'Link Afiliasi',
      description: 'Kelola link afiliasi Anda',
      icon: Share2,
      color: 'from-purple-500 to-purple-600',
      action: () => document.getElementById('links-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      title: 'Leaderboard',
      description: 'Lihat peringkat afiliasi terbaik',
      icon: Trophy,
      color: 'from-yellow-500 to-yellow-600',
      action: () => navigate(ROUTES.USER_LEADERBOARD.path)
    }
  ];

  return (
    <>
      <Helmet>
        <title>User Dashboard - SmartPath</title>
        <meta name="description" content="User dashboard for SmartPath" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3 max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="https://horizons-cdn.hostinger.com/97945fa6-ac93-416e-87c3-f12e19c0f260/0bed04b4c783f6129ca30c54d33467ad.png"
                  alt="SmartPath Logo"
                  className="h-10 w-auto"
                />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">SmartPath</h1>
                  <p className="text-xs text-gray-500">User Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* User Info */}
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-sm">
                      {(userData?.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {userData?.name || 'User'}
                    </p>
                    <p className="text-xs text-blue-600 font-medium capitalize">
                      {userData?.role || 'user'}
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

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600">Selamat datang di dashboard pribadi Anda</p>
          </motion.div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={action.action}
              >
                <div className={`h-2 bg-gradient-to-r ${action.color}`} />
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color}`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-gray-600 text-sm">{action.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="space-y-8">
            {/* Affiliate Statistics - Full Width */}
            <div id="stats-section">
              <UserAffiliateStats onAffiliatesLoad={setUserAffiliates} />
            </div>

            {/* Affiliate Links Manager */}
            {userAffiliates && userAffiliates.length > 0 && (
              <div id="links-section">
                <AffiliateLinksManager affiliates={userAffiliates} />
              </div>
            )}

            {/* Available Forms */}
            <div id="forms-section">
              <UserFormList />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
