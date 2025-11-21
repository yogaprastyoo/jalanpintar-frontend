import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserAffiliateLeaderboard from '../components/UserAffiliateLeaderboard';

const UserLeaderboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/user/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leaderboard Afiliasi</h1>
              <p className="text-sm text-gray-600">Lihat peringkat afiliasi terbaik</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Leaderboard - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <UserAffiliateLeaderboard />
          </div>

          {/* Side Information */}
          <div className="space-y-6">
            {/* How it Works Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Cara Kerja Leaderboard</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-600 text-xs font-bold">1</span>
                  </div>
                  <p className="text-sm text-gray-600">Peringkat ditentukan berdasarkan total pendapatan afiliasi</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-gray-600 text-xs font-bold">2</span>
                  </div>
                  <p className="text-sm text-gray-600">Jumlah referral juga mempengaruhi posisi Anda</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-700/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-700 text-xs font-bold">3</span>
                  </div>
                  <p className="text-sm text-gray-600">Leaderboard diperbarui secara real-time</p>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
              <h3 className="text-lg font-bold mb-4">💡 Tips Naik Peringkat</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Bagikan link afiliasi Anda di media sosial</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Ajak teman dan keluarga untuk bergabung</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Pastikan referral Anda aktif menggunakan platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Gunakan berbagai channel untuk promosi</span>
                </li>
              </ul>
            </div>

            {/* Rewards Info */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Hadiah & Rewards</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Peringkat 1</span>
                  <span className="text-sm font-bold text-yellow-600">Bonus Spesial</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Peringkat 2</span>
                  <span className="text-sm font-bold text-gray-600">Bonus Tambahan</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Peringkat 3</span>
                  <span className="text-sm font-bold text-yellow-700">Bonus Ekstra</span>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  *Hadiah diberikan setiap bulan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLeaderboard;
