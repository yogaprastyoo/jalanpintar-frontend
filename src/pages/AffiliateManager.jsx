import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Check, X, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { ROUTES } from '@/config/routes';

const AffiliateManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [affiliates, setAffiliates] = useState([]);
  const [pendingAffiliates, setPendingAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    affiliate_code: '',
    form_id: '019aa23a-6e53-7359-a667-d23c7cc42be5', // Default form ID UUID, will be updated when forms load
    commission_type: 'percentage',
    commission_value: '10'
  });
  const [forms, setForms] = useState([{ id: '019aa23a-6e53-7359-a667-d23c7cc42be5', title: 'Default Form' }]); // Initialize with default UUID
  const [creating, setCreating] = useState(false);

  // Load affiliates and withdrawals data
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load affiliates
      const affiliatesResponse = await api.getAffiliates();
      if (affiliatesResponse.success) {
        setAffiliates(affiliatesResponse.data);
      }

      // Load pending affiliates
      const pendingResponse = await api.getPendingAffiliates();
      if (pendingResponse.success) {
        setPendingAffiliates(pendingResponse.data);
      }
    } catch (error) {
      console.error('Error loading affiliate data:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data afiliasi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

      // Load forms for affiliate assignment
  const loadForms = async () => {
    try {
      const response = await api.get('/forms');
      console.log('Forms loaded:', response);
      if (response.success && response.data && response.data.length > 0) {
        setForms(response.data);
        // Update form_id default dengan form pertama yang tersedia (UUID)
        setFormData(prev => ({
          ...prev,
          form_id: response.data[0].id // UUID string, tidak perlu toString()
        }));
      } else {
        // Set default forms if no forms found - use UUID format
        const defaultForms = [{ id: '019aa23a-6e53-7359-a667-d23c7cc42be5', title: 'Default Form' }];
        setForms(defaultForms);
        setFormData(prev => ({
          ...prev,
          form_id: '019aa23a-6e53-7359-a667-d23c7cc42be5'
        }));
      }
    } catch (error) {
      console.error('Error loading forms:', error);
      // Set default forms if API fails - use UUID format
      const defaultForms = [{ id: '019aa23a-6e53-7359-a667-d23c7cc42be5', title: 'Default Form' }];
      setForms(defaultForms);
      setFormData(prev => ({
        ...prev,
        form_id: '019aa23a-6e53-7359-a667-d23c7cc42be5'
      }));
    }
  };  useEffect(() => {
    loadData();
    loadForms();
  }, []);

  const handleAffiliate = async (id, action) => {
    try {
      setUpdating(true);
      
      let response;
      if (action === 'approve') {
        response = await api.approveAffiliate(id);
      } else {
        response = await api.rejectAffiliate(id);
      }

      if (response.success) {
        // Remove from pending and optionally add to approved
        setPendingAffiliates(pendingAffiliates.filter(a => a.id !== id));
        
        if (action === 'approve') {
          // Refresh affiliates list to show newly approved
          const affiliatesResponse = await api.getAffiliates();
          if (affiliatesResponse.success) {
            setAffiliates(affiliatesResponse.data);
          }
        }
        
        toast({
          title: `Afiliasi ${action === 'approve' ? 'Disetujui' : 'Ditolak'}`,
          description: `Permintaan afiliasi telah ${action === 'approve' ? 'disetujui' : 'ditolak'}.`,
        });
      } else {
        throw new Error(response.message || `Gagal ${action} afiliasi`);
      }
    } catch (error) {
      console.error(`Error ${action} affiliate:`, error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Gagal ${action} afiliasi.`,
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Kode Disalin!',
      description: `Kode afiliasi ${code} telah disalin ke clipboard.`,
    });
  };

  // Generate unique affiliate code
  const generateAffiliateCode = (name) => {
    const cleanName = name.replaceAll(/\s+/g, '').toUpperCase();
    const randomNum = Math.floor(Math.random() * 9999);
    return `${cleanName.slice(0, 6)}${randomNum}`;
  };

  // Generate secure password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate affiliate code when name changes
    if (field === 'name' && value) {
      setFormData(prev => ({
        ...prev,
        affiliate_code: generateAffiliateCode(value)
      }));
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      affiliate_code: '',
      form_id: forms.length > 0 ? forms[0].id : '019aa23a-6e53-7359-a667-d23c7cc42be5', // UUID format
      commission_type: 'percentage',
      commission_value: '10'
    });
  };

  // Open add affiliate dialog
  const createNewAffiliate = () => {
    resetForm();
    setShowAddDialog(true);
  };

  // Handle form submission
  const handleSubmitAffiliate = async () => {
    try {
      // Basic validation
      if (!formData.name || !formData.email || !formData.password || !formData.affiliate_code || !formData.form_id || !formData.commission_value) {
        console.log('Validation failed. Form data:', formData);
        toast({
          title: 'Error',
          description: 'Semua field harus diisi.',
          variant: 'destructive',
        });
        return;
      }

      // Validate form_id exists
      if (!forms.find(form => form.id === formData.form_id)) {
        console.error('Invalid form_id:', formData.form_id, 'Available forms:', forms);
        toast({
          title: 'Error',
          description: 'Form yang dipilih tidak valid.',
          variant: 'destructive',
        });
        return;
      }

      // Password validation
      if (formData.password.length < 6) {
        toast({
          title: 'Error',
          description: 'Password harus minimal 6 karakter.',
          variant: 'destructive',
        });
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: 'Error',
          description: 'Format email tidak valid.',
          variant: 'destructive',
        });
        return;
      }

      // Commission value validation
      const commissionValue = Number.parseFloat(formData.commission_value);
      if (Number.isNaN(commissionValue) || commissionValue <= 0) {
        toast({
          title: 'Error',
          description: 'Nilai komisi harus berupa angka positif.',
          variant: 'destructive',
        });
        return;
      }

      if (formData.commission_type === 'percentage' && commissionValue > 100) {
        toast({
          title: 'Error',
          description: 'Persentase komisi tidak boleh lebih dari 100%.',
          variant: 'destructive',
        });
        return;
      }

      setCreating(true);

      // Step 1: Create user first
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password, // Laravel requires password confirmation
        role: 'user'
      };

      let userId;
      try {
        const userResponse = await api.post('/register', userData);
        console.log('User registration response:', userResponse);
        
        // Handle different response formats from Laravel API
        if (userResponse && userResponse.user && userResponse.user.id) {
          userId = userResponse.user.id;
          console.log('User created successfully with ID:', userId);
        } else {
          console.error('Unexpected user response format:', userResponse);
          throw new Error('Failed to create user - no user ID in response');
        }
      } catch (userError) {
        console.warn('User creation failed:', userError);
        
        // Check if it's an email already exists error
        if (userError.response?.data?.message?.includes('email') || 
            userError.response?.data?.errors?.email) {
          toast({
            title: 'Email Sudah Terdaftar',
            description: 'Email ini sudah digunakan. Silakan gunakan email lain.',
            variant: 'destructive',
          });
          return;
        }
        
        // For other errors, we can't proceed without a valid user
        throw new Error(`Gagal membuat user: ${userError.response?.data?.message || userError.message}`);
      }

      // Step 2: Create affiliate with the user_id
      const affiliateData = {
        user_id: userId,
        affiliate_code: formData.affiliate_code,
        form_id: formData.form_id, // UUID string, tidak perlu Number()
        commission_type: formData.commission_type,
        commission_value: Number(formData.commission_value),
        is_active: true
      };

      console.log('Creating affiliate with data:', affiliateData);
      console.log('Form data form_id:', formData.form_id);
      console.log('Available forms:', forms);

      const response = await api.createAffiliate(affiliateData);

      if (response.success) {
        toast({
          title: 'Berhasil!',
          description: 'Afiliasi baru berhasil dibuat.',
        });
        
        // Refresh data
        await loadData();
        
        // Close dialog and reset form
        setShowAddDialog(false);
        resetForm();
      } else {
        throw new Error(response.message || 'Gagal membuat afiliasi');
      }
    } catch (error) {
      console.error('Error creating affiliate:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Gagal membuat afiliasi baru.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
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
              onClick={() => navigate(ROUTES.ADMIN_DASHBOARD.path)}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </Button>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Program Afiliasi</h1>
              <Button onClick={createNewAffiliate} className="gap-2 bg-gradient-to-r from-green-600 to-green-700">
                <Plus className="w-4 h-4" />
                Tambah Afiliasi
              </Button>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3 flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  <span className="text-lg text-gray-600">Memuat data afiliasi...</span>
                </div>
              </div>
            </div>
          ) : (
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
                    {affiliates.length > 0 ? affiliates.map(aff => (
                      <motion.div key={aff.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-bold text-gray-800">{aff.user_name || aff.name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>Kode: {aff.affiliate_code}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(aff.affiliate_code)}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 sm:mt-0">
                            <div className="text-center">
                              <p className="font-bold text-lg text-blue-600">{aff.total_referrals || 0}</p>
                              <p className="text-xs text-gray-500">Referral</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-lg text-green-600">Rp{(aff.total_commission || 0).toLocaleString('id-ID')}</p>
                              <p className="text-xs text-gray-500">Komisi</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Label className="text-xs text-gray-500">Status: {aff.is_active ? 'Aktif' : 'Tidak Aktif'}</Label>
                          <div className="text-xs text-gray-500 mt-1">
                            Bergabung: {new Date(aff.created_at).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Belum ada afiliasi terdaftar</p>
                      </div>
                    )}
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
                    <Users className="w-6 h-6 text-yellow-600" />
                    <h2 className="text-xl font-bold text-gray-900">Afiliasi Menunggu Persetujuan</h2>
                  </div>
                  <div className="space-y-3">
                    {pendingAffiliates.length > 0 ? pendingAffiliates.map(affiliate => (
                      <div key={affiliate.id} className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg">
                        <p className="font-semibold text-gray-800">{affiliate.user_name || affiliate.name}</p>
                        <p className="text-sm text-gray-600">{affiliate.email}</p>
                        <div className="text-sm text-gray-600 mt-1">
                          Pendaftaran: {new Date(affiliate.created_at).toLocaleDateString('id-ID')}
                        </div>
                        {affiliate.affiliate_code && (
                          <div className="text-sm text-gray-600 mt-1">
                            Kode: {affiliate.affiliate_code}
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700" 
                            onClick={() => handleAffiliate(affiliate.id, 'approve')}
                            disabled={updating}
                          >
                            {updating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} 
                            Setujui
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1" 
                            onClick={() => handleAffiliate(affiliate.id, 'reject')}
                            disabled={updating}
                          >
                            {updating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <X className="w-4 h-4 mr-1" />} 
                            Tolak
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Tidak ada permintaan afiliasi saat ini.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Add Affiliate Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Afiliasi Baru</DialogTitle>
            <DialogDescription>
              Buat afiliasi baru dengan mengisi informasi di bawah ini. Kode afiliasi akan dibuat otomatis.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={creating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan alamat email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={creating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password (min. 6 karakter)"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={creating}
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleInputChange('password', generatePassword())}
                  disabled={creating}
                  className="shrink-0"
                >
                  Generate
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="affiliate_code">Kode Afiliasi</Label>
              <div className="flex gap-2">
                <Input
                  id="affiliate_code"
                  placeholder="Kode akan dibuat otomatis"
                  value={formData.affiliate_code}
                  onChange={(e) => handleInputChange('affiliate_code', e.target.value)}
                  disabled={creating}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleInputChange('affiliate_code', generateAffiliateCode(formData.name || 'USER'))}
                  disabled={creating}
                >
                  Generate
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="form_id">Form Terkait</Label>
              <Select 
                value={formData.form_id} 
                onValueChange={(value) => handleInputChange('form_id', value)}
                disabled={creating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih form" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map(form => (
                    <SelectItem key={form.id} value={form.id}>
                      {form.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="commission_type">Tipe Komisi</Label>
              <Select 
                value={formData.commission_type} 
                onValueChange={(value) => handleInputChange('commission_type', value)}
                disabled={creating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe komisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Persentase (%)</SelectItem>
                  <SelectItem value="fixed">Nominal Tetap (Rp)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="commission_value">
                Nilai Komisi {formData.commission_type === 'percentage' ? '(%)' : '(Rp)'}
              </Label>
              <Input
                id="commission_value"
                type="number"
                placeholder={formData.commission_type === 'percentage' ? 'Contoh: 10' : 'Contoh: 50000'}
                value={formData.commission_value}
                onChange={(e) => handleInputChange('commission_value', e.target.value)}
                disabled={creating}
                min="0"
                max={formData.commission_type === 'percentage' ? '100' : undefined}
                step={formData.commission_type === 'percentage' ? '0.1' : '1000'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={creating}>
              Batal
            </Button>
            <Button onClick={handleSubmitAffiliate} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Membuat...
                </>
              ) : (
                'Buat Afiliasi'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AffiliateManager;