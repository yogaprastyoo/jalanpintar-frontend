
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, User, GraduationCap, Gift, ChevronDown,
  // Import icons untuk section preview
  Mail, Phone, MapPin, CreditCard, FileText, Calendar, 
  Briefcase, Heart, Home, Settings, Star, ShoppingCart,
  // Import icons untuk upsell
  Zap, TrendingUp, Award, CheckCircle2, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import api, { getUserData, isAuthenticated } from '@/lib/api';

// Icon mapping untuk section (sama dengan FormBuilderEditor)
const SECTION_ICONS = {
  User, Mail, Phone, MapPin, CreditCard, FileText, Calendar,
  Briefcase, GraduationCap, Heart, Home, Settings, Star, ShoppingCart
};

// Helper function untuk format rupiah (tampilan saja, tanpa Rp)
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID').format(number);
};

// Memoized field component to prevent unnecessary re-renders
const FormField = memo(({ field, value, onChange }) => {
  // Check if this field was auto-filled
  const isAutoFilled = value && isAuthenticated() && (() => {
    const userData = getUserData();
    if (!userData) return false;
    
    // Check if value matches user data
    if (field.type === 'email' && value === userData.email) return true;
    if ((field.label.toLowerCase().includes('nama') || field.label.toLowerCase().includes('name')) && 
        value === userData.name) return true;
    if ((field.type === 'tel' || field.label.toLowerCase().includes('phone')) && 
        value === userData.phone) return true;
    
    return false;
  })();

  const commonProps = {
    id: `field-${field.id}`,
    required: field.required,
    placeholder: field.placeholder,
    value: value || '',
    onChange: onChange,
    className: `mt-1 ${isAutoFilled ? 'border-green-300 bg-green-50' : ''}`
  };

  const renderFieldInput = () => {
    switch (field.type) {
      case 'textarea':
        return <textarea {...commonProps} className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm mt-1" />;
      case 'select':
        return (
          <Select value={value || ''} onValueChange={(val) => onChange({ target: { value: val } })}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={field.placeholder || "Pilih salah satu"} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || '').split(',').map(opt => opt.trim()).filter(Boolean).map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="space-y-2 mt-2">
            {(field.options || '').split(',').map(opt => opt.trim()).filter(Boolean).map(option => {
              const selectedValues = value ? (Array.isArray(value) ? value : value.split(',')) : [];
              const isChecked = selectedValues.includes(option);
              return (
                <div key={option} className="flex items-center gap-3 p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors">
                  <Checkbox 
                    id={`checkbox-${field.id}-${option}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      let newValues = Array.isArray(value) ? [...value] : (value ? value.split(',') : []);
                      if (checked) {
                        newValues.push(option);
                      } else {
                        newValues = newValues.filter(v => v !== option);
                      }
                      onChange({ target: { value: newValues.join(',') } });
                    }}
                  />
                  <Label htmlFor={`checkbox-${field.id}-${option}`} className="font-normal cursor-pointer text-sm flex-1">
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        );
      default:
        return <Input type={field.type} {...commonProps} />;
    }
  };

  return (
    <div>
      <Label htmlFor={`field-${field.id}`} className="flex items-center gap-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
        {isAutoFilled && (
          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Auto-filled
          </span>
        )}
      </Label>
      {renderFieldInput()}
    </div>
  );
});

FormField.displayName = 'FormField';

const UserFormView = ({ isPreview = false, previewData = null }) => {
  const { formSlug } = useParams(); // Changed from formId to formSlug
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [affiliateCode, setAffiliateCode] = useState('');
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [isExpiredPreview, setIsExpiredPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Set true by default
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [affiliateInfo, setAffiliateInfo] = useState(null);
  const [isVerifyingAffiliate, setIsVerifyingAffiliate] = useState(false);

  // 🚨 CRITICAL: Check authentication for form submissions
  useEffect(() => {
    // Skip authentication check for preview mode
    if (isPreview) return;
    
    // Check if user is authenticated
    if (!isAuthenticated()) {
      console.log('🔐 Authentication required for form submission');
      toast({
        title: "Login Diperlukan 🔐",
        description: "Anda harus login terlebih dahulu untuk mengisi form ini.",
      });
      
      // Redirect to login with current path as redirect parameter
      const currentPath = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    
    console.log('✅ User authenticated, continuing with form');
  }, [isPreview, navigate, toast]);

  // Check for affiliate code in URL parameter and verify it
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref') || urlParams.get('affiliate') || urlParams.get('aff');
    if (refCode) {
      setAffiliateCode(refCode.toUpperCase());
      console.log('🎁 Affiliate code detected from URL:', refCode);
    }
  }, []);

  // Verify affiliate code when form data and affiliate code are available
  useEffect(() => {
    const verifyAffiliate = async () => {
      if (affiliateCode && formData && formData.id && !isPreview) {
        console.log('🔍 Verifying affiliate code:', {
          code: affiliateCode,
          formId: formData.id,
          formTitle: formData.title
        });
        
        setIsVerifyingAffiliate(true);
        try {
          const response = await api.verifyAffiliateCode(affiliateCode, formData.id);
          console.log('🔍 Affiliate verify response:', response);
          
          if (response.success) {
            setAffiliateInfo(response.data);
            console.log('✅ Affiliate code verified:', response.data);
            toast({
              title: "Kode Affiliate Valid! 🎉",
              description: `Referral dari ${response.data.affiliate_name} - Komisi ${response.data.commission_type === 'percentage' ? response.data.commission_value + '%' : 'Rp ' + response.data.commission_value}`,
            });
          }
        } catch (error) {
          console.warn('❌ Invalid affiliate code:', error);
          console.warn('❌ Error details:', error.response?.data || error.message);
          setAffiliateCode(''); // Clear invalid code
          toast({
            title: "Kode Affiliate Tidak Valid ❌",
            description: "Kode affiliate yang dimasukkan tidak valid untuk form ini.",
            variant: "destructive"
          });
        } finally {
          setIsVerifyingAffiliate(false);
        }
      }
    };

    verifyAffiliate();
  }, [affiliateCode, formData, isPreview]);

  // Debounced affiliate verification untuk manual input
  useEffect(() => {
    if (!affiliateCode || isPreview) return;

    const timeoutId = setTimeout(() => {
      if (formData && formData.id && affiliateCode.length >= 3) {
        // Re-verify jika user mengubah affiliate code
        const verifyManualCode = async () => {
          setIsVerifyingAffiliate(true);
          try {
            const response = await api.verifyAffiliateCode(affiliateCode, formData.id);
            if (response.success) {
              setAffiliateInfo(response.data);
            } else {
              setAffiliateInfo(null);
            }
          } catch (error) {
            setAffiliateInfo(null);
          } finally {
            setIsVerifyingAffiliate(false);
          }
        };
        verifyManualCode();
      } else {
        setAffiliateInfo(null);
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timeoutId);
  }, [affiliateCode]);

  // Optimize: Only update formData when necessary
  useEffect(() => {
    const loadForm = async () => {
      if (isPreview && previewData) {
        setFormData(previewData);
        setIsLoading(false); // No loading for preview mode
      } else if (!isPreview && formSlug) {
        setIsLoading(true);
        try {
          let response;
          let backendData;
          
          // Use authenticated endpoint if user is logged in to get submission status
          if (isAuthenticated()) {
            try {
              // First try to get the form with submission status from user endpoint
              const userFormsResponse = await api.get(`/user/forms?search=${formSlug}`);
              const matchedForm = userFormsResponse.data.find(form => form.slug === formSlug);
              
              if (matchedForm) {
                backendData = matchedForm;
                // Set submission status from user endpoint
                setHasSubmitted(matchedForm.user_has_submitted || false);
                if (matchedForm.user_has_submitted && matchedForm.user_submitted_at) {
                  setSubmissionData({
                    submitted_at: matchedForm.user_submitted_at,
                    status: matchedForm.user_submission_status,
                    id: matchedForm.user_submission_id
                  });
                  
                  // Redirect to dashboard if already submitted
                  console.log('⚠️ User already submitted this form, redirecting to dashboard...');
                  toast({
                    title: "Sudah Terdaftar! ✅",
                    description: "Anda sudah mendaftar pada form ini sebelumnya. Redirecting...",
                    variant: "default"
                  });
                  
                  setTimeout(() => {
                    navigate('/user/dashboard');
                  }, 1500);
                  return; // Stop further execution
                }
              } else {
                // Fallback to public endpoint if form not found in user forms
                response = await api.publicGet(`/public/forms/${formSlug}`);
                backendData = response.data;
              }
            } catch (userError) {
              console.warn('Failed to load from user endpoint, falling back to public:', userError);
              response = await api.publicGet(`/public/forms/${formSlug}`);
              backendData = response.data;
            }
          } else {
            // Use public endpoint for non-authenticated users
            response = await api.publicGet(`/public/forms/${formSlug}`);
            backendData = response.data;
          }
          
          // Transform backend data to match frontend structure
          const transformedData = {
            id: backendData.id,
            title: backendData.title,
            description: backendData.description || '',
            coverImage: backendData.cover_image || '',
            folder: backendData.category?.name || 'Uncategorized',
            sections: backendData.sections?.map(section => ({
              id: section.id || `section_${Date.now()}_${Math.random()}`,
              name: section.title,
              icon: section.icon || 'FileText'
            })) || [],
            fields: backendData.sections?.flatMap(section => 
              section.fields?.map(field => ({
                id: field.id || `field_${Date.now()}_${Math.random()}`,
                label: field.label,
                type: field.type === 'phone' ? 'tel' : field.type, // Map phone back to tel
                required: field.is_required || false,
                placeholder: field.placeholder || '',
                options: field.options?.map(opt => opt.label).join(', ') || '',
                sectionId: section.id
              })) || []
            ) || [],
            hasPayment: backendData.enable_payment || false,
            hasAffiliate: backendData.enable_affiliate || false,
            upsellEnabled: backendData.settings?.upsell_enabled || false,
            freeOption: backendData.settings?.free_option || false,
            pricingTiers: [
              // Always include free tier if enabled
              ...(backendData.settings?.free_option ? [{ 
                id: 0, 
                name: 'Gratis', 
                price: 0, 
                features: 'Akses dasar' 
              }] : []),
              // Add paid tiers from backend
              ...(backendData.pricing_tiers?.map(tier => ({
                id: tier.id,
                name: tier.name,
                price: parseInt(tier.price) || 0, // Convert to integer, remove decimal
                features: tier.description || tier.name
              })) || [])
            ],
            submissions: backendData.submissions_count || 0,
            createdAt: backendData.created_at
          };
          
          setFormData(transformedData);
          console.log('✅ Form loaded by slug:', formSlug, transformedData);
        } catch (error) {
          console.error('Failed to load form from API:', error);
          
          // Check if it's a 404 error (form not found)
          if (error.response && error.response.status === 404) {
            toast({
              title: "Form Tidak Ditemukan ❌",
              description: `Form dengan slug "${formSlug}" tidak ditemukan. Periksa kembali link Anda.`,
              variant: "destructive"
            });
          }
          
          // Fallback to localStorage (for backward compatibility or temp preview)
          const savedFormData = localStorage.getItem(`smartpath_form_${formSlug}`);
          if (savedFormData) {
            setFormData(JSON.parse(savedFormData));
            console.log('✅ Form loaded from localStorage:', formSlug);
          } else if (formSlug.startsWith('temp_preview_')) {
            // Temp preview sudah dihapus atau expired
            setIsExpiredPreview(true);
          }
          
          // Note: Temp preview data will NOT be auto-deleted
          // User can manually close the tab or it will be cleaned on next preview creation
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadForm();
  }, [formSlug, isPreview]); // Changed from formId to formSlug

  // Update form data separately when previewData changes (for preview mode only)
  useEffect(() => {
    if (isPreview && previewData) {
      setFormData(previewData);
    }
  }, [isPreview, previewData]);

  useEffect(() => {
    if (formData) {
      if (formData.sections && formData.sections.length > 0 && !currentSectionId) {
        setCurrentSectionId(formData.sections[0].id);
      }
      if (formData.hasPayment && formData.pricingTiers.length > 0 && !selectedTier) {
        const freeTier = formData.pricingTiers.find(t => t.price === 0);
        setSelectedTier(freeTier || formData.pricingTiers[0]);
      }
    }
  }, [formData, currentSectionId, selectedTier]);

  // Auto-fill form fields with user data if logged in
  useEffect(() => {
    if (formData && formData.fields && isAuthenticated()) {
      const userData = getUserData();
      if (userData) {
        const autoFillValues = {};
        
        formData.fields.forEach(field => {
          // Auto-fill email fields (for display only - backend uses authenticated user's email)
          if (field.type === 'email' || 
              field.label.toLowerCase().includes('email') ||
              field.label.toLowerCase().includes('e-mail')) {
            autoFillValues[field.id] = userData.email;
            console.log('📧 Email field auto-filled (display only):', field.label);
          }
          
          // Auto-fill name fields
          if (field.label.toLowerCase().includes('nama') ||
              field.label.toLowerCase().includes('name') ||
              field.label.toLowerCase().includes('fullname') ||
              field.label.toLowerCase().includes('full name')) {
            autoFillValues[field.id] = userData.name;
          }

          // Auto-fill phone fields (if available in userData)
          if ((field.type === 'tel' || 
               field.label.toLowerCase().includes('phone') ||
               field.label.toLowerCase().includes('telepon') ||
               field.label.toLowerCase().includes('hp') ||
               field.label.toLowerCase().includes('whatsapp')) &&
              userData.phone) {
            autoFillValues[field.id] = userData.phone;
          }
        });
        
        // Only set values if we found fields to auto-fill
        if (Object.keys(autoFillValues).length > 0) {
          setFormValues(prev => ({ ...autoFillValues, ...prev }));
          console.log('✅ Auto-filled user data:', autoFillValues);
        }
      }
    }
  }, [formData]);



  const handleSectionChange = useCallback((direction) => {
    setCurrentSectionId(prevId => {
      if (!formData || !formData.sections) return prevId;
      const currentIndex = formData.sections.findIndex(s => s.id === prevId);
      const nextIndex = currentIndex + direction;
      if (nextIndex >= 0 && nextIndex < formData.sections.length) {
        return formData.sections[nextIndex].id;
      }
      return prevId;
    });
  }, [formData]);

  const handleFieldChange = useCallback((fieldId, e) => {
    setFormValues(prev => ({ ...prev, [fieldId]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e, overrideTier = null) => {
    e.preventDefault();
    
    // Use overrideTier if provided (for upsell), otherwise use selectedTier
    const tierToSubmit = overrideTier || selectedTier;
    
    const currentIndex = formData.sections.findIndex(s => s.id === currentSectionId);
    
    // Allow navigation between sections even in preview mode
    if (currentIndex < formData.sections.length - 1) {
      handleSectionChange(1);
      return;
    }
    
    // Only prevent final submission in preview mode
    if (isPreview) {
      toast({ title: "Mode Preview", description: "Ini adalah mode preview. Form tidak akan benar-benar dikirim." });
      return;
    }

    // Prevent duplicate submissions for authenticated users
    if (hasSubmitted && isAuthenticated()) {
      toast({ 
        title: "Sudah Terdaftar! ✅", 
        description: "Anda sudah mendaftar pada form ini sebelumnya. Tidak dapat mendaftar ulang.",
        variant: "destructive"
      });
      return;
    }
    
    if (tierToSubmit?.price === 0 && formData.upsellEnabled && !showUpsell) {
      setShowUpsell(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Skip API call for temp preview forms
      if (!formSlug.startsWith('temp_preview_')) {
        // Build form data payload (excluding email - auto-filled from authenticated user)
        const submissionData = {};
        
        // Add form responses (exclude email fields - they're auto-filled by backend)
        Object.entries(formValues).forEach(([fieldId, value]) => {
          const field = formData.fields.find(f => f.id === fieldId);
          if (field && field.type !== 'email') { // Skip email fields - auto-filled from user
            submissionData[field.label] = value || '';
          }
        });
        
        // Add affiliate code to data object (same level as other form fields)
        if (affiliateCode) {
          submissionData.affiliate_code = affiliateCode;
        }
        
        // Build complete payload for authenticated submission
        const payload = {
          data: submissionData, // Contains form fields + affiliate_code
          // Add pricing tier ID (if not free tier)
          ...(tierToSubmit?.id && tierToSubmit.id !== 0 && { pricing_tier_id: tierToSubmit.id })
        };
        
        console.log('🔐 Authenticated Submission Data:');
        console.log('  Form Slug:', formSlug);
        console.log('  Tier:', tierToSubmit);
        console.log('  Payload:', payload);
        console.log('  🎁 Affiliate Code:', affiliateCode ? `"${affiliateCode}" (SENT in data object)` : 'NONE');
        console.log('  🚫 Email excluded - will be auto-filled from authenticated user');
        
        // Submit using new authenticated endpoint
        const response = await api.submitForm(formSlug, payload);
        console.log('✅ Authenticated submission successful:', response);
        
        // Debug: Check if affiliate info is in response
        if (affiliateCode) {
          console.log('🔍 Affiliate Debug Info:');
          console.log('  - Code sent:', affiliateCode);
          console.log('  - Verified info:', affiliateInfo);
          console.log('  - Response mentions affiliate:', JSON.stringify(response).includes('affiliate'));
        }
        
        // Check if payment is required (ada invoice_url dari Xendit)
        if (response?.data?.payment?.invoice_url) {
          // Save submission ID to localStorage untuk tracking
          localStorage.setItem('smartpath_pending_submission', JSON.stringify({
            submissionId: response.data.payment.id,
            formTitle: formData.title,
            tier: tierToSubmit?.name,
            amount: response.data.payment.amount,
            timestamp: new Date().toISOString()
          }));
          
          // Show toast before redirect
          toast({ 
            title: "Mengarahkan ke Pembayaran... 💳", 
            description: "Anda akan diarahkan ke halaman pembayaran Xendit.",
          });
          
          // Delay sedikit agar toast terlihat, lalu redirect
          setTimeout(() => {
            window.location.href = response.data.payment.invoice_url;
          }, 800);
          
          return; // Stop execution, karena akan redirect keluar
        }
        
        // SUCCESS: Show affiliate code if auto-generated
        if (response?.data?.affiliate_code) {
          toast({ 
            title: "Form Berhasil Dikirim! 🎉", 
            description: `Kode affiliate Anda: ${response.data.affiliate_code}`,
            duration: 10000, // Show longer for affiliate code
          });
          
          // Update local state
          setHasSubmitted(true);
          setSubmissionData({
            submitted_at: new Date().toISOString(),
            status: 'approved',
            affiliate_code: response.data.affiliate_code
          });
        } else {
          toast({ 
            title: "Form Berhasil Dikirim! ✅", 
            description: "Terima kasih telah mengisi form ini.",
          });
          
          setHasSubmitted(true);
        }
      } else {
        console.log('Preview mode - skipping API submission');
      }
      
      // Jika tidak ada payment (free tier), simpan ke localStorage
      const localResponse = { 
        id: Date.now(), 
        submittedAt: new Date().toISOString(), 
        data: formValues, 
        tier: tierToSubmit?.name, 
        amount: tierToSubmit?.price || 0 
      };
      const savedResponses = JSON.parse(localStorage.getItem(`smartpath_responses_${formSlug}`) || '[]');
      savedResponses.push(localResponse);
      localStorage.setItem(`smartpath_responses_${formSlug}`, JSON.stringify(savedResponses));

      // Redirect ke halaman success (hanya untuk free tier atau tanpa payment)
      const params = new URLSearchParams({
        form: formData.title,
        tier: tierToSubmit?.name || 'Gratis',
        timestamp: new Date().toLocaleString('id-ID')
      });
      
      navigate(`/success?${params.toString()}`);
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        tier: tierToSubmit,
        response: error.response,
        data: error.data
      });
      
      // Show specific error messages for different scenarios
      let errorMessage = "Gagal mengirim form. Coba lagi.";
      
      if (error.message?.includes('Authentication required')) {
        errorMessage = "Sesi Anda telah berakhir. Silakan login ulang.";
        // Redirect to login after showing error
        setTimeout(() => {
          const currentPath = window.location.pathname + window.location.search;
          navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
        }, 2000);
      } else if (error.message?.includes('duplicate') || error.message?.includes('already submitted')) {
        errorMessage = "Anda sudah pernah mengisi form ini sebelumnya.";
        setHasSubmitted(true); // Update UI state
      } else if (error.message?.includes('Xendit')) {
        errorMessage = "Terjadi kesalahan pada sistem pembayaran. Silakan hubungi admin.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: "Error! ❌", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isPreview, formData, currentSectionId, selectedTier, showUpsell, formValues, formSlug, navigate, toast, handleSectionChange, hasSubmitted, affiliateCode]);

  // Memoize current section data
  const currentSectionData = useMemo(() => {
    if (!formData || !formData.sections) return null;
    const currentIndex = formData.sections.findIndex(s => s.id === currentSectionId);
    const currentSection = formData.sections[currentIndex];
    const isLastSection = currentIndex === formData.sections.length - 1;
    return { currentSection, currentIndex, isLastSection };
  }, [formData, currentSectionId]);

  // Memoize filtered fields for current section
  const currentSectionFields = useMemo(() => {
    if (!formData || !formData.fields || !currentSectionData?.currentSection) return [];
    return formData.fields.filter(f => f.sectionId === currentSectionData.currentSection.id);
  }, [formData, currentSectionData]);

  // Show expired preview message
  if (isExpiredPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center"
        >
          <div className="mb-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview Sudah Kedaluwarsa</h2>
            <p className="text-gray-600 mb-4">
              Link preview ini sudah tidak berlaku. Preview form bersifat sementara dan otomatis dihapus setelah beberapa saat.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                💡 <strong>Tips:</strong> Untuk melihat preview terbaru, silakan buka preview baru dari halaman Form Builder.
              </p>
            </div>
            <Button 
              onClick={() => window.close()} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
            >
              Tutup Tab Ini
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Skeleton Loading Component - Check loading BEFORE checking formData
  if (isLoading) {
    return (
      <div className={isPreview ? "" : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50"}>
        <div className={isPreview ? "" : "container mx-auto px-4 py-8 max-w-4xl"}>
          {/* Skeleton Header */}
          <div className="text-center mb-8 animate-pulse">
            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-1/3 mx-auto"></div>
          </div>

          {/* Skeleton Form */}
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
            <div className="space-y-8 animate-pulse">
              {/* Skeleton Section Header */}
              <div className="flex items-center gap-3 border-b pb-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>

              {/* Skeleton Fields */}
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                  <div className="h-10 bg-gray-100 rounded"></div>
                </div>
              ))}

              {/* Skeleton Buttons */}
              <div className="flex gap-4">
                <div className="h-14 bg-gray-200 rounded-xl flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!formData) return <div className="text-center p-8 text-gray-500">Loading form...</div>;

  if (!currentSectionData) return <div className="text-center p-8 text-gray-500">Loading...</div>;

  const { currentSection, currentIndex, isLastSection } = currentSectionData;

  // Get icon component untuk current section
  const SectionIcon = SECTION_ICONS[currentSection?.icon] || FileText;

  return (
    <>
      {!isPreview && (
        <Helmet>
          <title>{formData.title} - SmartPath</title>
          <meta name="description" content="Daftar untuk mengikuti program SmartPath" />
        </Helmet>
      )}

      <div className={isPreview ? "" : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50"}>
        <div className={isPreview ? "" : "container mx-auto px-4 py-8 max-w-4xl"}>
          {/* Cover Image Banner with 4:1 Ratio */}
          {formData.coverImage && !isPreview && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full rounded-2xl overflow-hidden shadow-lg mb-8"
              style={{ aspectRatio: '4 / 1' }}
            >
              <img 
                src={formData.coverImage} 
                alt={`${formData.title} cover`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.parentElement.style.display = 'none';
                }}
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
            </motion.div>
          )}
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <img 
              src="https://horizons-cdn.hostinger.com/97945fa6-ac93-416e-87c3-f12e19c0f260/0bed04b4c783f6129ca30c54d33467ad.png" 
              alt="SmartPath Logo" 
              className="h-16 w-auto mx-auto mb-4" 
            />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{formData.title || "Judul Form"}</h1>
            {formData.description && (
              <p className="text-gray-600 text-lg mb-2 max-w-2xl mx-auto">{formData.description}</p>
            )}
            <p className="text-gray-500 text-sm">Isi form di bawah untuk mendaftar</p>
          </motion.div>

          {/* Affiliate code notification */}
          {affiliateInfo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Gift className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-800">Kode Affiliate Aktif!</h3>
                    <p className="text-purple-700 text-sm">
                      Referral dari <span className="font-medium">{affiliateInfo.affiliate_name}</span>
                    </p>
                    <p className="text-purple-600 text-xs mt-1">
                      Komisi: {affiliateInfo.commission_type === 'percentage' 
                        ? `${affiliateInfo.commission_value}%` 
                        : `Rp ${new Intl.NumberFormat('id-ID').format(affiliateInfo.commission_value)}`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-xs font-mono">
                      {affiliateCode}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!showUpsell ? (
              <motion.div key="main-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Authentication Info Banner */}
                  {isAuthenticated() && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-green-900">Login Terverifikasi</h3>
                          <p className="text-sm text-green-700">
                            Email Anda ({getUserData()?.email}) akan otomatis digunakan untuk pendaftaran.
                            {formData?.hasAffiliate && ' Kode affiliate akan dibuat otomatis setelah submit.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <AnimatePresence mode="wait">
                    {currentSection && (
                      <motion.div key={currentSection.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="space-y-6">
                        <div className="flex items-center gap-3 border-b pb-3 mb-4">
                          <div className="p-2 bg-blue-100 rounded-xl">
                            <SectionIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <h2 className="text-xl font-bold text-gray-800">{currentSection.name}</h2>
                        </div>
                        {currentSectionFields.map((field) => (
                          <FormField
                            key={field.id}
                            field={field}
                            value={formValues[field.id]}
                            onChange={(e) => handleFieldChange(field.id, e)}
                          />
                        ))}
                        {isLastSection && formData.hasAffiliate && (
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                            <Label htmlFor="affiliate-code" className="flex items-center gap-2 mb-2">
                              <Gift className="w-4 h-4 text-purple-600" />
                              <span className="text-purple-900 font-semibold">Kode Afiliasi (Opsional)</span>
                            </Label>
                            <div className="relative">
                              <Input
                                id="affiliate-code"
                                type="text"
                                placeholder="Masukkan kode afiliasi jika ada"
                                value={affiliateCode}
                                onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
                                className="bg-white border-purple-300 focus:border-purple-500 focus:ring-purple-500 pr-10"
                              />
                              {isVerifyingAffiliate && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                                </div>
                              )}
                              {affiliateInfo && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                </div>
                              )}
                            </div>
                            {affiliateInfo ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
                                <p className="text-xs text-green-700">
                                  ✅ Kode valid! Referral dari <span className="font-medium">{affiliateInfo.affiliate_name}</span>
                                  {affiliateInfo.commission_type === 'percentage' 
                                    ? ` (${affiliateInfo.commission_value}% komisi)`
                                    : ` (Rp ${new Intl.NumberFormat('id-ID').format(affiliateInfo.commission_value)} komisi)`
                                  }
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-purple-700 mt-2">Dapatkan benefit tambahan dengan kode afiliasi</p>
                            )}
                          </div>
                        )}
                        {isLastSection && formData.hasPayment && (
                          <div>
                            <Label className="mb-3 block">Pilih Paket</Label>
                            <div className="grid md:grid-cols-3 gap-4">
                              {formData.pricingTiers.map((tier) => (
                                <motion.div key={tier.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedTier(tier)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedTier?.id === tier.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                  <div className="text-center">
                                    <h3 className="font-bold text-gray-900 mb-2">{tier.name}</h3>
                                    <p className="text-2xl font-bold text-blue-600 mb-2">{tier.price === 0 ? 'Gratis' : `Rp ${formatRupiah(tier.price)}`}</p>
                                    <p className="text-sm text-gray-600">{tier.features}</p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex gap-4">
                    {currentIndex > 0 && <Button type="button" variant="outline" onClick={() => handleSectionChange(-1)} className="w-full" disabled={isSubmitting || hasSubmitted}>Kembali</Button>}
                    
                    {hasSubmitted && isAuthenticated() ? (
                      <Button disabled className="w-full bg-gradient-to-r from-green-500 to-green-600 text-lg py-6 cursor-not-allowed opacity-75">
                        <CheckCircle2 className="mr-2 w-5 h-5" />
                        Sudah Terdaftar
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitting || isLoading} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-lg py-6">
                        {isSubmitting ? (
                          selectedTier?.price > 0 ? 'Memproses Pembayaran...' : 'Mengirim...'
                        ) : (
                          !isLastSection ? 'Lanjut' : (
                            formData?.hasPayment ? (
                              selectedTier?.price === 0 ? 'Daftar Gratis' : '💳 Bayar Sekarang'
                            ) : 'Kirim Form'
                          )
                        )}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="upsell" 
                initial={{ opacity: 0, y: 50 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 opacity-90" />
                <div className="absolute inset-0">
                  <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
                  <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
                  <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
                </div>

                {/* Content */}
                <div className="relative bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-10 text-white border border-white/10">
                  {/* Header dengan animasi */}
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center mb-8"
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.1, 1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                      className="inline-block mb-4"
                    >
                      <div className="relative">
                        <Sparkles className="w-20 h-20 mx-auto text-yellow-300 drop-shadow-lg" />
                        <Crown className="w-8 h-8 absolute -top-2 -right-2 text-yellow-400 animate-bounce" />
                      </div>
                    </motion.div>
                    
                    <motion.h2 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl md:text-4xl font-extrabold mb-3 bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 bg-clip-text text-transparent"
                    >
                      Tunggu Dulu! 🎉
                    </motion.h2>
                    
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="inline-block bg-yellow-400/20 backdrop-blur-sm px-6 py-2 rounded-full border border-yellow-300/30 mb-3"
                    >
                      <p className="text-yellow-100 font-semibold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-300" />
                        Penawaran Spesial Hanya Untuk Anda
                      </p>
                    </motion.div>
                    
                    <p className="text-blue-100 text-lg">
                      Upgrade sekarang dan dapatkan akses eksklusif dengan harga terbaik!
                    </p>
                  </motion.div>

                  {/* Pricing Cards */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {formData.pricingTiers.filter(t => t.price > 0).map((tier, index) => (
                      <motion.div
                        key={tier.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + (index * 0.1) }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="relative group"
                      >
                        {/* Popular Badge */}
                        {index === 0 && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              PALING POPULER
                            </div>
                          </div>
                        )}

                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/20 group-hover:border-yellow-300/50 transition-all duration-300 h-full flex flex-col">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-2xl">{tier.name}</h3>
                            <TrendingUp className="w-6 h-6 text-green-400" />
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-extrabold text-yellow-300">
                                Rp {formatRupiah(tier.price)}
                              </span>
                            </div>
                            <p className="text-blue-200 text-sm mt-1">Pembayaran satu kali</p>
                          </div>

                          <div className="flex-1 mb-6">
                            <div className="space-y-3">
                              {tier.features.split(',').map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-blue-50 text-sm">{feature.trim()}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Button 
                            onClick={() => { 
                              handleSubmit({ preventDefault: () => {} }, tier); 
                            }} 
                            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                          >
                            <Award className="w-5 h-5 mr-2" />
                            Pilih Paket Ini
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Benefits Section */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10"
                  >
                    <h4 className="text-center font-semibold text-lg mb-4 text-yellow-200">
                      ⚡ Kenapa Upgrade Sekarang?
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      <div>
                        <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                        <p className="text-sm text-blue-100">Akses Instan</p>
                      </div>
                      <div>
                        <Award className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                        <p className="text-sm text-blue-100">Konten Premium</p>
                      </div>
                      <div>
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                        <p className="text-sm text-blue-100">Update Lifetime</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Skip Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <Button 
                      onClick={() => { 
                        const freeTier = formData.pricingTiers.find(t => t.price === 0);
                        handleSubmit({ preventDefault: () => {} }, freeTier); 
                      }} 
                      variant="ghost" 
                      className="w-full bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                    >
                      Tidak, Lanjut dengan Paket Gratis
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default UserFormView;
