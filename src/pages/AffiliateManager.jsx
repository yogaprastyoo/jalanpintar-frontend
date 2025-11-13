import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, DollarSign, Check, X, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

const AffiliateManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [affiliates, setAffiliates] = useState([
    { id: 1, name: 'Budi Affiliate', code: 'BUDI10', referrals: 150, commission: 7500000, target: 200 },
    { id: 2, name: 'Citra Ceria', code: 'CITRA20', referrals: 85, commission: 4250000, target: 100 },
    { id: 3, name: 'Dedi Digital', code: 'DEDI30', referrals: 210, commission: 10500000, target: 250 },
  ]);

  const [withdrawals, setWithdrawals] = useState([
    { id: 1, affiliateId: 2, affiliateName: 'Citra Ceria', amount: 2000000, status: 'Pending' },
    { id: 2, affiliateId: 3, affiliateName: 'Dedi Digital', amount: 5000000, status: 'Pending' },
  ]);

  const handleWithdrawal = (id, newStatus) => {
    setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: newStatus } : w));
    toast({
      title: `Permintaan ${newStatus === 'Approved' ? 'Disetujui' : 'Ditolak'}`,
      description: `Penarikan dana telah diupdate.`,
    });
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Kode Disalin!',
      description: `Kode afiliasi ${code} telah disalin ke clipboard.`,
    });
  };

  return (
    <>
      <Helmet>
        <title>Program Afiliasi - SmartPath Admin</title>
        <meta name="description" content="Kelola afiliasi, komisi, dan penarikan dana" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </Button>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Program Afiliasi</h1>
              <Button onClick={() => toast({ title: '🚧 Fitur dalam pengembangan' })} className="gap-2 bg-gradient-to-r from-green-600 to-green-700">
                <Plus className="w-4 h-4" />
                Tambah Afiliasi
              </Button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Daftar Afiliasi</h2>
                </div>
                <div className="space-y-4">
                  {affiliates.map(aff => (
                    <motion.div key={aff.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-bold text-gray-800">{aff.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Kode: {aff.code}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(aff.code)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 sm:mt-0">
                          <div className="text-center">
                            <p className="font-bold text-lg text-blue-600">{aff.referrals}</p>
                            <p className="text-xs text-gray-500">Referral</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-lg text-green-600">Rp{aff.commission.toLocaleString('id-ID')}</p>
                            <p className="text-xs text-gray-500">Komisi</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label className="text-xs text-gray-500">Progress Target ({aff.referrals}/{aff.target})</Label>
                        <Progress value={(aff.referrals / aff.target) * 100} className="h-2 mt-1" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-xl font-bold text-gray-900">Permintaan Penarikan</h2>
                </div>
                <div className="space-y-3">
                  {withdrawals.filter(w => w.status === 'Pending').length > 0 ? withdrawals.filter(w => w.status === 'Pending').map(w => (
                    <div key={w.id} className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg">
                      <p className="font-semibold text-gray-800">{w.affiliateName}</p>
                      <p className="text-lg font-bold text-yellow-700">Rp{w.amount.toLocaleString('id-ID')}</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleWithdrawal(w.id, 'Approved')}>
                          <Check className="w-4 h-4 mr-1" /> Setujui
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleWithdrawal(w.id, 'Rejected')}>
                          <X className="w-4 h-4 mr-1" /> Tolak
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 text-center py-4">Tidak ada permintaan penarikan saat ini.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AffiliateManager;