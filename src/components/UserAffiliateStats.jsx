import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { DollarSign, Users, BarChart, TrendingUp } from 'lucide-react';

const StatCard = ({ icon, title, value, change, changeType }) => {
  const Icon = icon;
  const isPositive = changeType === 'positive';
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="w-4 h-4" />
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const UserAffiliateStats = ({ onAffiliatesLoad }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/affiliates/my/statistics');
        setStats(response.data);
        
        // Pass affiliates data to parent component
        if (onAffiliatesLoad && response.data?.affiliates) {
          onAffiliatesLoad(response.data.affiliates);
        }
      } catch (err) {
        console.error('❌ Affiliate stats fetch error:', err);
        let errorMessage = 'Failed to load affiliate statistics.';
        
        // Handle specific backend errors
        if (err.response?.data?.message) {
          const backendMessage = err.response.data.message;
          if (backendMessage.includes('No query results') || backendMessage.includes('AffiliateReward')) {
            errorMessage = 'Data afiliasi belum tersedia. Mulai ajak teman untuk bergabung!';
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

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 p-6 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg col-span-full">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">Data Afiliasi Belum Tersedia</p>
            <p className="text-sm text-gray-400">Mulai ajak teman bergabung untuk melihat statistik afiliasi!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
          <BarChart className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Performa Afiliasi</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={DollarSign} 
          title="Total Pendapatan" 
          value={`Rp ${new Intl.NumberFormat('id-ID').format(stats?.total_earned || 0)}`}
        />
        <StatCard 
          icon={Users} 
          title="Total Referrals" 
          value={stats?.total_referrals || 0}
        />
        <StatCard 
          icon={BarChart} 
          title="Total Afiliasi" 
          value={stats?.total_affiliates || 0}
        />
        <StatCard 
          icon={TrendingUp} 
          title="Rata-rata per Referral" 
          value={stats?.total_referrals > 0 ? 
            `Rp ${new Intl.NumberFormat('id-ID').format(Math.round(stats.total_earned / stats.total_referrals))}` : 
            'Rp 0'}
        />
      </div>
      
      {/* Recent Referrals */}
      {stats?.recent_referrals && stats.recent_referrals.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Terbaru</h3>
          <div className="space-y-3">
            {stats.recent_referrals.slice(0, 5).map((referral, index) => (
              <div key={referral.submission_id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{referral.customer_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(referral.submitted_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    +Rp {new Intl.NumberFormat('id-ID').format(referral.commission)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAffiliateStats;
