import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearTokens } from '@/lib/api';
import { ROUTES } from '@/config/routes';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearTokens();
    navigate(ROUTES.LOGIN.path);
  };

  return (
    <>
      <Helmet>
        <title>Akses Ditolak - SmartPath</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Akses Ditolak
            </h1>
            
            <p className="text-gray-600 mb-8">
              Maaf, Anda tidak memiliki izin untuk mengakses halaman admin. 
              Halaman ini hanya dapat diakses oleh pengguna dengan role <strong>admin</strong>.
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-600 to-red-700"
              >
                Logout & Kembali ke Login
              </Button>
              
              <Button
                onClick={() => navigate(ROUTES.HOME.path)}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            Jika Anda merasa ini adalah kesalahan, hubungi administrator.
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default UnauthorizedPage;
