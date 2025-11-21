import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Trophy, User } from 'lucide-react';

const UserAffiliateLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [userSummary, setUserSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/affiliates/leaderboard');
        
        if (response && response.data && response.data.leaderboard) {
          setLeaderboard(response.data.leaderboard);
          // Store user's rank and performance data
          setUserRank(response.data.my_rank || null);
          setUserSummary(response.data.my_summary || null);
        } else {
          console.warn('⚠️ Unexpected response structure:', response);
          setError('Invalid response format from server.');
        }
      } catch (err) {
        console.error('❌ Leaderboard fetch error:', err);
        let errorMessage = 'Failed to load leaderboard.';
        
        // Handle specific backend errors
        if (err.response?.data?.message) {
          const backendMessage = err.response.data.message;
          if (backendMessage.includes('No query results') || backendMessage.includes('leaderboard')) {
            errorMessage = 'Leaderboard belum tersedia. Data afiliasi masih kosong.';
          } else {
            errorMessage = backendMessage;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-yellow-700';
    return 'text-gray-500';
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">Belum ada data leaderboard</p>
          <p className="text-sm text-gray-400">Data akan muncul setelah ada aktivitas afiliasi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
      </div>
      
      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">Belum ada data leaderboard</p>
          <p className="text-sm text-gray-400">Jadilah yang pertama di leaderboard afiliasi!</p>
        </div>
      ) : (
        <ul className="space-y-4">
        {leaderboard.map((entry) => (
          <li key={entry.user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <span className={`font-bold text-lg w-6 text-center ${getRankColor(entry.rank)}`}>{entry.rank}</span>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {entry.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{entry.user.name}</p>
                <p className="text-sm text-gray-500">{entry.total_referrals} referrals</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">Rp {new Intl.NumberFormat('id-ID').format(entry.total_earned)}</p>
            </div>
          </li>
        ))}
        </ul>
      )}
      
      {/* User's Current Performance */}
      {userRank && userSummary && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Performa Anda</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">#{userRank}</span>
              </div>
              <div>
                <p className="text-sm text-blue-700">Peringkat {userRank}</p>
                <p className="text-xs text-blue-600">{userSummary.total_referrals} referrals</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-blue-800">Rp {new Intl.NumberFormat('id-ID').format(userSummary.total_earned)}</p>
              <p className="text-xs text-blue-600">{userSummary.affiliate_count} affiliate aktif</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAffiliateLeaderboard;
