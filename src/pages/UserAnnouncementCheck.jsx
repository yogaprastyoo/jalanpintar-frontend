import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const UserAnnouncementCheck = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('smartpath_announcements');
    if (saved) {
      const data = JSON.parse(saved);
      setAnnouncements(data);
      if (data.length > 0) {
        setSelectedAnnouncement(data[0].id);
      }
    } else {
       const dummyData = [
        {
          id: 1,
          title: 'Pengumuman Magang Batch 5',
          type: 'Magang',
          date: '2025-11-01',
          passedData: [
            { id: 'SP001', name: 'Ahmad Rizki', status: 'Lolos', note: 'Selamat! Anda diterima sebagai Software Engineer Intern. Mohon cek email untuk informasi lebih lanjut.' },
            { id: 'SP002', name: 'Siti Nurhaliza', status: 'Lolos', note: 'Selamat! Anda diterima sebagai UI/UX Designer Intern. Mohon cek email untuk informasi lebih lanjut.' },
          ],
          failedData: [
            { id: 'SP003', name: 'Dewi Lestari', status: 'Tidak Lolos', note: 'Terima kasih atas partisipasi Anda. Sayangnya, Anda belum dapat bergabung saat ini. Tetap semangat dan coba lagi di kesempatan berikutnya!' },
            { id: 'SP004', name: 'Eko Prasetyo', status: 'Tidak Lolos', note: 'Terima kasih atas partisipasi Anda. Sayangnya, Anda belum dapat bergabung saat ini. Tetap semangat dan coba lagi di kesempatan berikutnya!' }
          ]
        }
      ];
      setAnnouncements(dummyData);
      setSelectedAnnouncement(dummyData[0].id);
      localStorage.setItem('smartpath_announcements', JSON.stringify(dummyData));
    }
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const announcement = announcements.find(a => a.id === selectedAnnouncement);
    if (!announcement) return;

    const allData = [...(announcement.passedData || []), ...(announcement.failedData || [])];
    const result = allData.find(
      item => 
        (item.id && item.id.toLowerCase() === searchQuery.toLowerCase()) ||
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setSearchResult(result || { notFound: true });
  };

  return (
    <>
      <Helmet>
        <title>Cek Pengumuman - SmartPath</title>
        <meta name="description" content="Cek status pengumuman magang, beasiswa, dan program SmartPath" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <img 
              src="https://horizons-cdn.hostinger.com/97945fa6-ac93-416e-87c3-f12e19c0f260/0bed04b4c783f6129ca30c54d33467ad.png"
              alt="SmartPath Logo"
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Cek Pengumuman</h1>
            <p className="text-gray-600">Masukkan ID Pendaftaran atau Nama Anda untuk melihat hasil</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="announcement">Pilih Pengumuman</Label>
                <select
                  id="announcement"
                  value={selectedAnnouncement || ''}
                  onChange={(e) => {
                    setSelectedAnnouncement(parseInt(e.target.value));
                    setSearchResult(null);
                  }}
                  className="w-full mt-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {announcements.map((announcement) => (
                    <option key={announcement.id} value={announcement.id}>
                      {announcement.title} ({announcement.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="search">ID atau Nama</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Contoh: SP001 atau Ahmad Rizki"
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700">
                    <Search className="w-4 h-4" />
                    Cek
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {searchResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              {searchResult.notFound ? (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Data Tidak Ditemukan</h3>
                  <p className="text-gray-600">Pastikan ID atau nama yang Anda masukkan sudah benar dan sesuai dengan pengumuman yang dipilih.</p>
                </div>
              ) : searchResult.status === 'Lolos' ? (
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-2xl p-8">
                  <div className="text-center mb-6">
                    <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-600" />
                    <h3 className="text-2xl md:text-3xl font-bold text-green-900 mb-2">Selamat, {searchResult.name}! 🎉</h3>
                    <p className="text-green-700 text-lg">Anda Dinyatakan LOLOS</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-gray-600">ID</span>
                      <span className="font-bold text-gray-900">{searchResult.id}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-gray-600">Nama</span>
                      <span className="font-bold text-gray-900">{searchResult.name}</span>
                    </div>
                    <div className="pt-3 text-center">
                      <p className="text-gray-800">{searchResult.note}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-8">
                  <div className="text-center mb-6">
                    <XCircle className="w-20 h-20 mx-auto mb-4 text-red-600" />
                    <h3 className="text-2xl md:text-3xl font-bold text-red-900 mb-2">Mohon Maaf, {searchResult.name}</h3>
                    <p className="text-red-700 text-lg">Anda Belum Lolos Kali Ini</p>
                  </div>
                   <div className="bg-white rounded-xl p-6 space-y-3 text-center">
                     <p className="text-gray-800">{searchResult.note}</p>
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserAnnouncementCheck;