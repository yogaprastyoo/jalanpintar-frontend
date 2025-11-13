
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Search, Filter, Calendar, User, CreditCard, Gift, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

const FormResponses = () => {
  const navigate = useNavigate();
  const { formId } = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState(null);
  const [responses, setResponses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all'); // 'all', 'free', 'paid'
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all'); // 'all', 'pending', 'paid', 'failed'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFormAndResponses();
  }, [formId]);

  const loadFormAndResponses = async () => {
    setIsLoading(true);
    try {
      // Load form data from API
      const formResponse = await api.get(`/api/forms/${formId}`);
      const backendFormData = formResponse.data;
      
      // Transform form data
      const transformedFormData = {
        id: backendFormData.id,
        title: backendFormData.title,
        description: backendFormData.description || '',
        fields: backendFormData.sections?.flatMap(section => 
          section.fields?.map(field => ({
            id: field.id,
            label: field.label,
            type: field.type,
          })) || []
        ) || [],
        pricingTiers: backendFormData.pricing_tiers || []
      };
      
      setFormData(transformedFormData);
      
      // Try to load submissions from API
      // Backend mungkin belum punya route ini, jadi wrap dalam try-catch
      try {
        const responsesData = await api.get(`/api/forms/${formId}/submissions`);
        const transformedResponses = responsesData.data.map(submission => ({
          id: submission.id,
          submittedAt: submission.created_at,
          data: submission.data || {},
          tier: submission.pricing_tier?.name || 'Gratis',
          amount: submission.pricing_tier?.price || 0,
          paymentStatus: submission.payment_status || 'pending',
          paymentMethod: submission.payment_method || null,
          affiliateCode: submission.affiliate_code || null,
        }));
        
        setResponses(transformedResponses);
      } catch (submissionError) {
        console.warn('Submissions endpoint not available, falling back to localStorage:', submissionError);
        // Fallback to localStorage for responses
        loadResponsesFromLocal();
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
      toast({
        title: "Error loading data",
        description: "Gagal memuat data form, menggunakan data lokal",
        variant: "destructive"
      });
      
      // Fallback to localStorage if API fails
      loadFormDataFromLocal();
      loadResponsesFromLocal();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFormDataFromLocal = () => {
    const savedFormData = localStorage.getItem(`smartpath_form_${formId}`);
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
  };

  const loadResponsesFromLocal = () => {
    const savedResponses = localStorage.getItem(`smartpath_responses_${formId}`);
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
  };

  const exportToCSV = () => {
    toast({
      title: "🚧 Fitur ekspor akan segera hadir!",
      description: "Data akan dapat di-export ke CSV/Excel.",
    });
  };

  const filteredResponses = responses.filter(response => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = Object.values(response.data).some(value => 
        value?.toString().toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }
    
    // Tier filter
    if (tierFilter === 'free' && response.amount > 0) return false;
    if (tierFilter === 'paid' && response.amount === 0) return false;
    
    // Payment status filter
    if (paymentStatusFilter !== 'all' && response.paymentStatus !== paymentStatusFilter) return false;
    
    return true;
  });

  // Statistics
  const stats = {
    total: responses.length,
    free: responses.filter(r => r.amount === 0).length,
    paid: responses.filter(r => r.amount > 0 && r.paymentStatus === 'paid').length,
    pending: responses.filter(r => r.amount > 0 && r.paymentStatus === 'pending').length,
    totalRevenue: responses
      .filter(r => r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + (r.amount || 0), 0)
  };

  return (
    <>
      <Helmet>
        <title>Form Responses - SmartPath Admin</title>
        <meta name="description" content="Lihat dan kelola semua responses form" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/forms')}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Daftar Form
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Form Responses</h1>
                <p className="text-gray-600">{formData?.title || 'Loading...'}</p>
              </div>
              <Button onClick={exportToCSV} className="gap-2 bg-gradient-to-r from-green-600 to-green-700">
                <Download className="w-4 h-4" />
                Export to CSV
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-4 gap-4 mb-6"
          >
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <User className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Free Tier</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.free}</p>
                </div>
                <Gift className="w-8 h-8 text-gray-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <div className="flex flex-col gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan nama, email, atau data lainnya..."
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex gap-2">
                  <Button
                    variant={tierFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setTierFilter('all')}
                    size="sm"
                  >
                    Semua Tier
                  </Button>
                  <Button
                    variant={tierFilter === 'free' ? 'default' : 'outline'}
                    onClick={() => setTierFilter('free')}
                    size="sm"
                    className={tierFilter === 'free' ? 'bg-gray-600' : ''}
                  >
                    <Gift className="w-4 h-4 mr-1" />
                    Free
                  </Button>
                  <Button
                    variant={tierFilter === 'paid' ? 'default' : 'outline'}
                    onClick={() => setTierFilter('paid')}
                    size="sm"
                    className={tierFilter === 'paid' ? 'bg-green-600' : ''}
                  >
                    <CreditCard className="w-4 h-4 mr-1" />
                    Paid
                  </Button>
                </div>
                
                <div className="border-l pl-2 flex gap-2">
                  <Button
                    variant={paymentStatusFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setPaymentStatusFilter('all')}
                    size="sm"
                  >
                    Semua Status
                  </Button>
                  <Button
                    variant={paymentStatusFilter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setPaymentStatusFilter('pending')}
                    size="sm"
                    className={paymentStatusFilter === 'pending' ? 'bg-yellow-600' : ''}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Pending
                  </Button>
                  <Button
                    variant={paymentStatusFilter === 'paid' ? 'default' : 'outline'}
                    onClick={() => setPaymentStatusFilter('paid')}
                    size="sm"
                    className={paymentStatusFilter === 'paid' ? 'bg-green-600' : ''}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Paid
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4"
          >
            {isLoading ? (
              // Skeleton Loading
              <>
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-lg"></div>
                        <div>
                          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                          <div className="h-4 bg-gray-100 rounded w-40"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-gray-100 rounded w-24 mb-2"></div>
                        <div className="h-6 bg-green-100 rounded-full w-28"></div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map(j => (
                        <div key={j} className="p-3 bg-gray-50 rounded-lg">
                          <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                          <div className="h-4 bg-gray-100 rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : filteredResponses.length > 0 ? (
              filteredResponses.map((response, index) => {
                // Safely get first name and email from data object
                const dataEntries = Object.entries(response.data || {});
                const firstEntry = dataEntries[0];
                const secondEntry = dataEntries[1];
                
                // Try to intelligently find name and email
                const userName = response.data?.['NAMA'] || 
                                response.data?.['Nama'] || 
                                response.data?.['Nama Lengkap'] || 
                                response.data?.['Name'] ||
                                firstEntry?.[1] ||
                                'No Name';
                                
                const userEmail = response.data?.['EMAIL'] || 
                                 response.data?.['Email'] || 
                                 response.data?.['email'] ||
                                 secondEntry?.[1] ||
                                 'No Email';
                
                return (
                  <motion.div
                    key={response.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          response.amount > 0 ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {response.amount > 0 ? (
                            <CreditCard className="w-5 h-5 text-green-600" />
                          ) : (
                            <Gift className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{userName}</p>
                          <p className="text-sm text-gray-600">{userEmail}</p>
                          {response.affiliateCode && (
                            <p className="text-xs text-purple-600 mt-1">🎁 Kode: {response.affiliateCode}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(response.submittedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            response.amount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {response.tier} {response.amount > 0 ? `- Rp ${response.amount.toLocaleString('id-ID')}` : ''}
                          </span>
                          {response.amount > 0 && (
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              response.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                              response.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {response.paymentStatus === 'paid' ? '✓ Paid' :
                               response.paymentStatus === 'pending' ? '⏱ Pending' :
                               '✗ Failed'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      {Object.entries(response.data).map(([fieldLabel, value]) => (
                        <div key={fieldLabel} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-600 text-xs mb-1 font-medium">{fieldLabel}</p>
                          <p className="font-medium text-gray-900 break-words">{value || '-'}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                {responses.length === 0 ? (
                  <>
                    <p className="text-gray-500 text-lg mb-2">Belum ada response untuk form ini</p>
                    <p className="text-gray-400 text-sm">Response akan muncul setelah ada user yang mengisi form</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500 text-lg mb-2">Tidak ada response yang sesuai dengan filter</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery('');
                        setTierFilter('all');
                        setPaymentStatusFilter('all');
                      }}
                      className="mt-4"
                    >
                      Reset Filter
                    </Button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default FormResponses;
