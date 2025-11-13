import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Download, Share2, Sparkles, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FormSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [confetti, setConfetti] = useState(true);
  
  const formTitle = searchParams.get('form') || 'Form';
  const tier = searchParams.get('tier') || 'Gratis';
  const timestamp = searchParams.get('timestamp') || new Date().toLocaleString('id-ID');

  useEffect(() => {
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Helmet>
        <title>Pendaftaran Berhasil! - SmartPath</title>
        <meta name="description" content="Terima kasih telah mendaftar di SmartPath" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-40 sm:w-64 h-40 sm:h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
          <div className="absolute top-20 sm:top-40 right-5 sm:right-10 w-40 sm:w-64 h-40 sm:h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
          <div className="absolute bottom-10 sm:bottom-20 left-1/2 w-40 sm:w-64 h-40 sm:h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
        </div>

        {/* Confetti Effect */}
        {confetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: -100, 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 500),
                  rotate: 0,
                  opacity: 1
                }}
                animate={{ 
                  y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100,
                  rotate: 360,
                  opacity: 0
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  ease: "linear"
                }}
                className={`absolute w-2 h-2 sm:w-3 sm:h-3 ${
                  ['bg-green-400', 'bg-blue-400', 'bg-purple-400', 'bg-yellow-400', 'bg-pink-400'][i % 5]
                } rounded-full`}
              />
            ))}
          </div>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 max-w-2xl w-full"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-4 sm:mb-6"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="absolute inset-0 bg-green-400 rounded-full blur-xl sm:blur-2xl opacity-40"
              />
              <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-4 sm:p-6">
                <CheckCircle2 className="w-12 h-12 sm:w-16 md:w-20 sm:h-16 md:h-20 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <span>Selamat!</span>
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-2">
              Pendaftaran Anda Berhasil!
            </p>
            <p className="text-sm sm:text-base text-gray-500 px-2">
              Terima kasih telah mendaftar di <span className="font-semibold text-blue-600">{formTitle}</span>
            </p>
          </motion.div>

          {/* Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-blue-100"
          >
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              Detail Pendaftaran
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 sm:gap-3 text-gray-700">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Waktu Pendaftaran</p>
                  <p className="font-semibold text-sm sm:text-base truncate">{timestamp}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-gray-700">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Paket Dipilih</p>
                  <p className="font-semibold text-sm sm:text-base truncate">{tier}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8"
          >
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              Langkah Selanjutnya
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm">Cek email Anda untuk konfirmasi pendaftaran</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm">Simpan email konfirmasi sebagai bukti pendaftaran</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm">Tim kami akan menghubungi Anda dalam 1x24 jam</span>
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="space-y-2 sm:space-y-3"
          >
            <Button 
              onClick={() => window.print()}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg font-semibold shadow-lg"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Download Bukti Pendaftaran
            </Button>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button 
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  alert('Link berhasil disalin!');
                }}
                variant="outline"
                className="py-2.5 sm:py-3 text-xs sm:text-sm"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Bagikan</span>
                <span className="xs:hidden">Share</span>
              </Button>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="py-2.5 sm:py-3 text-xs sm:text-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Kembali
              </Button>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 text-center"
          >
            <p className="text-xs sm:text-sm text-gray-500 mb-2">
              Bergabung dengan <span className="font-semibold text-blue-600">10,000+</span> peserta lainnya
            </p>
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.4 + (i * 0.1) }}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default FormSuccess;
