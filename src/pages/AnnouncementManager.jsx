import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Eye, Upload, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const AnnouncementManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    type: 'Magang',
    passedData: [],
    failedData: []
  });

  useEffect(() => {
    const saved = localStorage.getItem('smartpath_announcements');
    if (saved) {
      setAnnouncements(JSON.parse(saved));
    } else {
      const dummyData = [
        {
          id: 1,
          title: 'Pengumuman Magang Batch 5',
          type: 'Magang',
          date: '2025-11-01',
          passedData: [
            { id: 'SP001', name: 'Ahmad Rizki', status: 'Lolos', note: 'Selamat! Anda diterima sebagai Software Engineer Intern' },
            { id: 'SP002', name: 'Siti Nurhaliza', status: 'Lolos', note: 'Selamat! Anda diterima sebagai UI/UX Designer Intern' },
            { id: 'SP005', name: 'Budi Santoso', status: 'Lolos', note: 'Selamat! Anda diterima sebagai Data Analyst Intern' }
          ],
          failedData: [
            { id: 'SP003', name: 'Dewi Lestari', status: 'Tidak Lolos', note: 'Mohon maaf, silakan coba lagi di batch berikutnya' },
            { id: 'SP004', name: 'Eko Prasetyo', status: 'Tidak Lolos', note: 'Mohon maaf, silakan coba lagi di batch berikutnya' }
          ]
        },
        {
          id: 2,
          title: 'Beasiswa SmartPath 2025',
          type: 'Beasiswa',
          date: '2025-10-15',
          passedData: [
            { id: 'BS001', name: 'Rina Wijaya', status: 'Lolos', note: 'Selamat! Anda mendapatkan beasiswa penuh' },
            { id: 'BS003', name: 'Fajar Ramadan', status: 'Lolos', note: 'Selamat! Anda mendapatkan beasiswa 50%' }
          ],
          failedData: [
            { id: 'BS002', name: 'Linda Kusuma', status: 'Tidak Lolos', note: 'Mohon maaf, kuota beasiswa sudah penuh' }
          ]
        }
      ];
      setAnnouncements(dummyData);
      localStorage.setItem('smartpath_announcements', JSON.stringify(dummyData));
    }
  }, []);

  const saveAnnouncements = (data) => {
    localStorage.setItem('smartpath_announcements', JSON.stringify(data));
    setAnnouncements(data);
  };

  const addAnnouncement = () => {
    if (!newAnnouncement.title) {
      toast({
        title: "Error",
        description: "Judul pengumuman harus diisi",
        variant: "destructive"
      });
      return;
    }

    const announcement = {
      id: Date.now(),
      ...newAnnouncement,
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [...announcements, announcement];
    saveAnnouncements(updated);
    setNewAnnouncement({ title: '', type: 'Magang', passedData: [], failedData: [] });
    toast({
      title: "Pengumuman ditambahkan! ✅",
      description: "Pengumuman berhasil dibuat dan tersimpan.",
    });
  };

  const deleteAnnouncement = (id) => {
    const updated = announcements.filter(a => a.id !== id);
    saveAnnouncements(updated);
    toast({
      title: "Pengumuman dihapus",
      description: "Pengumuman telah dihapus dari sistem.",
    });
  };

  const handleFileUpload = (type) => {
    toast({
      title: "🚧 Fitur upload file belum tersedia",
      description: "Anda dapat request fitur ini di prompt berikutnya! 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>Kelola Pengumuman - SmartPath Admin</title>
        <meta name="description" content="Kelola pengumuman magang, beasiswa, dan program SmartPath" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
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
              <h1 className="text-3xl font-bold text-gray-900">Kelola Pengumuman</h1>
              <Button
                onClick={() => navigate('/user/announcements')}
                variant="outline"
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview User
              </Button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Buat Pengumuman Baru</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Judul Pengumuman</Label>
                  <Input
                    id="title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    placeholder="Contoh: Pengumuman Magang Batch 6"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipe Pengumuman</Label>
                  <select
                    id="type"
                    value={newAnnouncement.type}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Magang">Magang</option>
                    <option value="Beasiswa">Beasiswa</option>
                    <option value="Program">Program Lainnya</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-2 border-green-200">
                    <div>
                      <p className="font-medium text-gray-900">Data Yang Lolos</p>
                      <p className="text-sm text-gray-600">Upload file CSV/Excel</p>
                    </div>
                    <Button onClick={() => handleFileUpload('passed')} size="sm" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border-2 border-red-200">
                    <div>
                      <p className="font-medium text-gray-900">Data Tidak Lolos</p>
                      <p className="text-sm text-gray-600">Upload file CSV/Excel</p>
                    </div>
                    <Button onClick={() => handleFileUpload('failed')} size="sm" variant="outline" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>
                </div>

                <Button onClick={addAnnouncement} className="w-full gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600">
                  <Plus className="w-4 h-4" />
                  Tambah Pengumuman
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-bold text-gray-900">Pengumuman Aktif</h2>
              {announcements.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <p className="text-gray-500">Belum ada pengumuman</p>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">{announcement.title}</h3>
                        <p className="text-sm text-gray-600">{announcement.type} • {announcement.date}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAnnouncement(announcement.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <p className="text-sm font-medium text-gray-900">Lolos</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{announcement.passedData.length}</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <p className="text-sm font-medium text-gray-900">Tidak Lolos</p>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{announcement.failedData.length}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnouncementManager;