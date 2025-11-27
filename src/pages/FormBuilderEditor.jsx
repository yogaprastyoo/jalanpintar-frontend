
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, GripVertical, Edit, Check, Eye, ExternalLink, ChevronDown,
  // Import common icons untuk section dan folder
  Folder, User, Mail, Phone, MapPin, CreditCard, FileText, Calendar, 
  Briefcase, GraduationCap, Heart, Home, Settings, Star, ShoppingCart, Gift
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import UserFormView from '@/pages/UserFormView';
import api, { isAuthenticated } from '@/lib/api';
import { ROUTES } from '@/config/routes';
import { FORM_ENDPOINTS, CATEGORY_ENDPOINTS } from '@/config/endpoints';

// Icon mapping untuk section
const SECTION_ICONS = {
  Folder, User, Mail, Phone, MapPin, CreditCard, FileText, Calendar,
  Briefcase, GraduationCap, Heart, Home, Settings, Star, ShoppingCart, Gift
};

const ICON_OPTIONS = [
  { value: 'User', label: 'User' },
  { value: 'Mail', label: 'Email' },
  { value: 'Phone', label: 'Phone' },
  { value: 'MapPin', label: 'Location' },
  { value: 'CreditCard', label: 'Payment' },
  { value: 'FileText', label: 'Document' },
  { value: 'Calendar', label: 'Calendar' },
  { value: 'Briefcase', label: 'Business' },
  { value: 'GraduationCap', label: 'Education' },
  { value: 'Heart', label: 'Health' },
  { value: 'Home', label: 'Home' },
  { value: 'Settings', label: 'Settings' },
  { value: 'Star', label: 'Featured' },
  { value: 'ShoppingCart', label: 'Shopping' },
  { value: 'Gift', label: 'Gift/Affiliate' }
];

// Fixed SortableItem - only the grip handle is draggable
const SortableItem = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  
  // Pass the listeners separately so they can be applied only to the grip handle
  return (
    <div ref={setNodeRef} style={style}>
      {React.cloneElement(children, { dragHandleProps: { ...attributes, ...listeners } })}
    </div>
  );
};

// Simplified FieldItem - direct updates
const FieldItem = ({ field, onUpdate, onDelete }) => {
  return (
    <div className="p-3 bg-white border rounded-xl shadow-sm">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <Label className="text-xs">Label</Label>
          <Input 
            value={field.label || ''} 
            onChange={(e) => onUpdate(field.id, { label: e.target.value })}
            className="mt-1 h-8" 
          />
        </div>
        <div>
          <Label className="text-xs">Type</Label>
          <Select value={field.type} onValueChange={(value) => onUpdate(field.id, { type: value })}>
            <SelectTrigger className="mt-1 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="tel">Phone</SelectItem>
              <SelectItem value="textarea">Textarea</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-xs">Placeholder</Label>
        <Input 
          value={field.placeholder || ''} 
          onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
          className="mt-1 h-8" 
        />
      </div>
      {field.type === 'select' && (
        <div>
          <Label className="text-xs">Options (comma-separated)</Label>
          <Input 
            value={field.options || ''} 
            onChange={(e) => onUpdate(field.id, { options: e.target.value })}
            className="mt-1 h-8" 
          />
        </div>
      )}
      {field.type === 'checkbox' && (
        <div>
          <Label className="text-xs">Checkbox Items (comma-separated)</Label>
          <Input 
            value={field.options || ''} 
            onChange={(e) => onUpdate(field.id, { options: e.target.value })}
            className="mt-1 h-8" 
            placeholder="Option 1, Option 2, Option 3"
          />
          <p className="text-xs text-gray-500 mt-1">Masukkan pilihan checkbox, pisahkan dengan koma</p>
        </div>
      )}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <Switch 
            checked={field.required} 
            onCheckedChange={(checked) => onUpdate(field.id, { required: checked })} 
          />
          <Label className="text-xs">Required</Label>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-red-500" 
          onClick={() => onDelete(field.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Simplified SectionItem - only grip handle is draggable
const SectionItem = ({ 
  section, 
  isEditing, 
  fields,
  onStartEdit, 
  onStopEdit, 
  onUpdateName, 
  onDelete,
  onUpdateField,
  onDeleteField,
  onAddField,
  onUpdateIcon,
  dragHandleProps // Received from SortableItem
}) => {
  const [iconPickerOpen, setIconPickerOpen] = React.useState(false);
  // Get icon component
  const IconComponent = SECTION_ICONS[section.icon] || FileText;
  
  return (
    <div className="p-4 border-2 border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          {/* Only the grip handle is draggable */}
          <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          
          {/* Section Icon - dapat di-edit dengan icon picker */}
          {isEditing ? (
            <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
              <PopoverTrigger asChild>
                <button 
                  type="button"
                  className="flex items-center gap-2 p-2 bg-blue-100 rounded-xl hover:bg-blue-200 transition-colors cursor-pointer border-2 border-blue-300"
                >
                  <IconComponent className="w-5 h-5 text-blue-600" />
                  <ChevronDown className="w-4 h-4 text-blue-600" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Pilih Icon</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {ICON_OPTIONS.map(opt => {
                      const Icon = SECTION_ICONS[opt.value];
                      const isSelected = section.icon === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            onUpdateIcon(section.id, opt.value);
                            setIconPickerOpen(false);
                          }}
                          className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          title={opt.label}
                        >
                          <Icon className={`w-5 h-5 mx-auto ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-blue-100 rounded-xl">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
          )}
          
          {isEditing ? (
            <Input 
              value={section.name} 
              onChange={(e) => onUpdateName(section.id, e.target.value)} 
              autoFocus 
              className="h-8 mr-3"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onStopEdit();
                }
              }}
            />
          ) : (
            <h3 className="text-lg font-bold text-gray-800">{section.name}</h3>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700" onClick={onStopEdit}>
                <Check className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onStartEdit(section.id)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => onDelete(section.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="space-y-3 pl-7">
          {fields.map(field => (
            <FieldItem
              key={field.id}
              field={field}
              onUpdate={onUpdateField}
              onDelete={onDeleteField}
            />
          ))}
          <Button onClick={() => onAddField(section.id)} size="sm" variant="outline" className="w-full gap-2 mt-2">
            <Plus className="w-4 h-4" /> Tambah Field
          </Button>
        </div>
      </div>
  );
};

const FormBuilderEditor = () => {
  const navigate = useNavigate();
  const { formId } = useParams(); // Note: This is actually formSlug from route /admin/forms/edit/:formId
  const { toast } = useToast();
  // formId parameter actually contains the slug (not UUID) when editing
  const isNewForm = !formId || formId === 'new';
  const [folders, setFolders] = useState([]);
  const [categories, setCategories] = useState([]); // Store full category objects with icon & color
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNewForm); // Set true for edit mode
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    coverImage: '',
    folder: '',
    sections: [{ id: Date.now(), name: 'Section 1', icon: 'FileText' }],
    fields: [],
    hasPayment: false,
    hasAffiliate: false,
    upsellEnabled: false,
    freeOption: true,
    pricingTiers: [{ id: 1, name: 'Gratis', price: 0, features: 'Akses kelas dasar' }],
    maxSubmissions: null, // null means unlimited
    startDate: '',
    endDate: '',
    isActive: true,
    submissions: 0,
    createdAt: new Date().toISOString()
  });

  useEffect(() => {
    const loadData = async () => {
      // Load categories/folders from API
      try {
        const response = await api.get(CATEGORY_ENDPOINTS.LIST);
        // Store full category objects
        setCategories(response.data);
        // Extract category names for folder select
        const categoryNames = response.data.map(cat => cat.name);
        setFolders(categoryNames);
        
        // Also save to localStorage as backup
        localStorage.setItem('smartpath_folders', JSON.stringify(categoryNames));
      } catch (error) {
        console.error('Failed to load categories from API:', error);
        // If 401 Unauthorized, redirect to login (will be handled by ProtectedRoute)
        if (error.message.includes('Session expired') || error.message.includes('401')) {
          toast({
            title: "Session Expired",
            description: "Silakan login kembali.",
            variant: "destructive"
          });
          navigate(ROUTES.LOGIN.path);
          return;
        }
        setFolders([]);
        setCategories([]);
      }

      // Load form data
      if (!isNewForm) {
        setIsLoading(true);
        try {
          // Try to load from API first - using public endpoint with slug
          const response = await api.get(FORM_ENDPOINTS.PUBLIC(formId));
          const backendData = response.data;
          
          // Transform backend data to frontend structure
          const transformedData = {
            id: backendData.id, // Store actual UUID from backend
            slug: backendData.slug, // Store slug separately
            title: backendData.title,
            description: backendData.description || '',
            coverImage: backendData.cover_image || '',
            folder: backendData.category?.name || 'Uncategorized',
            sections: backendData.sections
              ?.filter(section => 
                // Filter out sections that are auto-managed by backend
                !['Kode Referral', 'Pembayaran & Referral', 'Referral'].includes(section.title)
              )
              .map(section => ({
                id: section.id || `section_${Date.now()}_${Math.random()}`,
                name: section.title,
                icon: section.icon || 'FileText'
              })) || [],
            fields: backendData.sections
              ?.filter(section => 
                // Filter out sections that are auto-managed by backend
                !['Kode Referral', 'Pembayaran & Referral', 'Referral'].includes(section.title)
              )
              .flatMap(section => 
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
                price: tier.price,
                features: tier.description || tier.name
              })) || [])
            ],
            maxSubmissions: backendData.max_submissions || null,
            startDate: backendData.start_date || '',
            endDate: backendData.end_date || '',
            isActive: backendData.is_active !== undefined ? backendData.is_active : true,
            submissions: backendData.submissions_count || 0,
            createdAt: backendData.created_at
          };
          
          setFormData(transformedData);
          console.log('✅ Form loaded for editing:', transformedData);
        } catch (error) {
          console.error('Failed to load form from API, trying localStorage:', error);
          // Fallback to localStorage if API fails
          const savedFormData = localStorage.getItem(`smartpath_form_${formId}`);
          if (savedFormData) {
            const parsedData = JSON.parse(savedFormData);
            setFormData({ ...parsedData, id: formId });
          } else {
            toast({ 
              title: "Error! ❌", 
              description: "Form tidak ditemukan.", 
              variant: "destructive" 
            });
            navigate(ROUTES.ADMIN_FORMS.path);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [formId, isNewForm, navigate, toast]);

  const updateFormData = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const addSection = useCallback(() => {
    setFormData(prev => {
      const newSection = { 
        id: `section_${Date.now()}_${Math.random()}`, 
        name: `Section Baru ${prev.sections.length + 1}`,
        icon: 'FileText' // Default icon
      };
      return { ...prev, sections: [...prev.sections, newSection] };
    });
  }, []);

  const updateSectionName = useCallback((id, newName) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, name: newName } : s)
    }));
  }, []);

  const updateSectionIcon = useCallback((id, newIcon) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, icon: newIcon } : s)
    }));
  }, []);

  const deleteSection = useCallback((id) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id),
      fields: prev.fields.filter(f => f.sectionId !== id)
    }));
  }, []);

  const addField = useCallback((sectionId) => {
    setFormData(prev => {
      const newField = { 
        id: `field_${Date.now()}_${Math.random()}`, 
        label: 'Field Baru', 
        type: 'text', 
        required: false, 
        placeholder: '', 
        options: '', 
        sectionId 
      };
      return { ...prev, fields: [...prev.fields, newField] };
    });
  }, []);

  const updateField = useCallback((id, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  }, []);

  const deleteField = useCallback((id) => {
    setFormData(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== id) }));
  }, []);

  const addPricingTier = useCallback(() => {
    setFormData(prev => {
      const newTier = { id: `tier_${Date.now()}_${Math.random()}`, name: 'Paket Baru', price: 0, features: 'Deskripsi fitur' };
      return { ...prev, pricingTiers: [...prev.pricingTiers, newTier] };
    });
  }, []);

  const updatePricingTier = useCallback((id, updates) => {
    setFormData(prev => ({
      ...prev,
      pricingTiers: prev.pricingTiers.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  }, []);

  const deletePricingTier = useCallback((id) => {
    setFormData(prev => ({ ...prev, pricingTiers: prev.pricingTiers.filter(t => t.id !== id) }));
  }, []);

  // Transform frontend formData to Laravel backend format
  const transformToBackendFormat = (formData) => {
    // Find category_id from folder name
    const selectedCategory = categories.find(cat => cat.name === formData.folder);
    
    // Generate slug from title (or use existing slug for edit)
    const slug = formData.slug || formData.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]/g, '');
    
    // Map frontend field types to backend field types
    const mapFieldType = (frontendType) => {
      const typeMapping = {
        'tel': 'phone',
        'text': 'text',
        'email': 'email',
        'textarea': 'textarea',
        'number': 'number',
        'select': 'select',
        'checkbox': 'checkbox',
        'date': 'date',
        'time': 'time',
        'file': 'file'
      };
      return typeMapping[frontendType] || frontendType;
    };
    
    // Transform sections with fields
    const transformedSections = formData.sections.map((section, sectionIndex) => ({
      title: section.name,
      description: `Isi data ${section.name.toLowerCase()} dengan lengkap`,
      icon: section.icon || 'FileText',
      order: sectionIndex + 1,
      fields: formData.fields
        .filter(field => field.sectionId === section.id)
        .map((field, fieldIndex) => ({
          label: field.label,
          name: field.label.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, ''),
          type: mapFieldType(field.type), // Map field type here
          placeholder: field.placeholder || `Masukkan ${field.label.toLowerCase()}`,
          help_text: field.required ? 'Wajib diisi' : '',
          is_required: field.required || false,
          order: fieldIndex + 1,
          ...(field.type === 'select' && field.options ? {
            options: field.options.split(',').map((opt, idx) => ({
              value: opt.trim().toLowerCase().replace(/\s+/g, '_'),
              label: opt.trim()
            }))
          } : {}),
          ...(field.type === 'checkbox' && field.options ? {
            options: field.options.split(',').map((opt, idx) => ({
              value: opt.trim().toLowerCase().replace(/\s+/g, '_'),
              label: opt.trim()
            }))
          } : {}),
          validation_rules: field.type === 'email' ? { email: true } : {}
        }))
    }));
    
    // Transform pricing tiers (only if payment is enabled)
    const transformedPricingTiers = formData.hasPayment 
      ? formData.pricingTiers
          .filter(tier => tier.price > 0) // Skip free tier
          .map((tier, index) => ({
            name: tier.name,
            description: tier.features || tier.name,
            price: tier.price,
            currency: 'IDR',
            is_default: index === 0,
            is_active: true,
            order: index + 1
          }))
      : [];
    
    // Transform upsells (only if upsell is enabled)
    const transformedUpsells = (formData.hasPayment && formData.upsellEnabled)
      ? [] // Empty for now, can be populated from formData if needed
      : [];
    
    // Backend payload
    return {
      title: formData.title,
      description: formData.description || `Form ${formData.title}`,
      slug: slug,
      category_id: selectedCategory?.id || null,
      cover_image: formData.coverImage || null,
      is_active: formData.isActive !== undefined ? formData.isActive : true,
      enable_payment: formData.hasPayment || false,
      enable_affiliate: formData.hasAffiliate || false,
      max_submissions: formData.maxSubmissions || null,
      start_date: formData.startDate || null,
      end_date: formData.endDate || null,
      settings: {
        theme: 'modern',
        send_email: true,
        upsell_enabled: formData.upsellEnabled || false,
        free_option: formData.freeOption || false
      },
      sections: transformedSections,
      pricing_tiers: transformedPricingTiers,
      upsells: transformedUpsells
    };
  };

  const saveForm = useCallback(async () => {
    if (!formData.title || !formData.folder) {
      toast({ title: "Error! ❌", description: "Judul dan folder harus diisi.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Transform data to backend format
      const backendPayload = transformToBackendFormat(formData);
      
      console.log('📤 Sending form data to backend:', backendPayload);
      console.log('🔍 Field types check:');
      backendPayload.sections.forEach((section, idx) => {
        console.log(`  Section ${idx + 1} - ${section.title}:`);
        section.fields.forEach((field, fieldIdx) => {
          console.log(`    Field ${fieldIdx + 1}: ${field.label} (type: ${field.type})`);
        });
      });
      
      let savedForm;
      
      if (isNewForm) {
        // Create new form via API
        const response = await api.post(FORM_ENDPOINTS.CREATE, backendPayload);
        savedForm = response.data;
        
        console.log('✅ Form created:', savedForm);
        
        toast({ 
          title: "Form berhasil dibuat! 🎉", 
          description: "Form baru telah tersimpan." 
        });
      } else {
        // Update existing form via API
        // Use actual form ID (UUID), not the slug from URL params
        const actualFormId = formData.id;
        if (!actualFormId) {
          throw new Error('Form ID not found. Cannot update form.');
        }
        const response = await api.put(FORM_ENDPOINTS.UPDATE(actualFormId), backendPayload);
        savedForm = response.data;
        
        console.log('✅ Form updated:', savedForm);
        console.log('🆔 Used form ID:', actualFormId, '(not slug:', formId, ')');
        
        toast({ 
          title: "Form berhasil diupdate! ✅", 
          description: "Perubahan form telah tersimpan." 
        });
      }
      
      // Also save to localStorage as backup
      localStorage.setItem(`smartpath_form_${savedForm.id}`, JSON.stringify(savedForm));
      
      // Update forms list in localStorage
      const savedForms = JSON.parse(localStorage.getItem('smartpath_forms') || '[]');
      const existingIndex = savedForms.findIndex(f => f.id === savedForm.id);
      const formListItem = { 
        id: savedForm.id, 
        title: savedForm.title || backendPayload.title, 
        folder: formData.folder,
        submissions: savedForm.submissions_count || savedForm.responses_count || 0, 
        createdAt: savedForm.created_at || new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        savedForms[existingIndex] = formListItem;
      } else {
        savedForms.push(formListItem);
      }
      localStorage.setItem('smartpath_forms', JSON.stringify(savedForms));
      
      navigate(ROUTES.ADMIN_FORMS.path);
    } catch (error) {
      console.error('❌ Save form error:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast({ 
        title: "Error! ❌", 
        description: error.response?.data?.message || error.message || "Gagal menyimpan form. Coba lagi.", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  }, [formData, isNewForm, formId, toast, navigate, categories]);

  // Update preview data setiap kali formData berubah
  useEffect(() => {
    // Selalu update localStorage dengan data terbaru
    const tempId = `temp_preview_live`;
    localStorage.setItem(`smartpath_form_${tempId}`, JSON.stringify(formData));
  }, [formData]);

  // Preview functions
  const openPreviewInNewTab = () => {
    // Use fixed ID for preview
    const tempId = `temp_preview_live`;
    
    // Save temp data untuk preview
    localStorage.setItem(`smartpath_form_${tempId}`, JSON.stringify(formData));
    
    // Open in new tab
    window.open(`/user/form/${tempId}`, '_blank');
    
    toast({
      title: "Preview Dibuka",
      description: "Refresh halaman preview untuk melihat perubahan terbaru.",
    });
  };

  const togglePreviewDialog = () => {
    setShowPreview(!showPreview);
  };

  // Drag and drop handlers
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFormData(prev => {
        const oldIndex = prev.sections.findIndex(s => s.id === active.id);
        const newIndex = prev.sections.findIndex(s => s.id === over.id);
        return { ...prev, sections: arrayMove(prev.sections, oldIndex, newIndex) };
      });
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{isNewForm ? 'Buat Form Baru' : 'Edit Form'} - SmartPath Admin</title>
        <meta name="description" content="Form builder dengan multi-section dan payment integration" />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate(ROUTES.ADMIN_FORMS.path)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </Button>
                <h1 className="text-xl font-bold text-gray-900">{isNewForm ? 'Buat Form Baru' : 'Edit Form'}</h1>
              </div>
              <div className="flex gap-3">
                <Button onClick={togglePreviewDialog} variant="outline" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
                <Button onClick={openPreviewInNewTab} variant="outline" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Preview di Tab Baru
                </Button>
                <Button onClick={saveForm} disabled={isSaving || isLoading} className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700">
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Form'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto">
            {isLoading ? (
              // Skeleton Loading
              <div className="space-y-6">
                {/* Skeleton: Informasi Form */}
                <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-4">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-10 bg-gray-100 rounded"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-10 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Skeleton: Tabs & Sections */}
                <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="flex gap-2 mb-6">
                    <div className="h-10 bg-gray-200 rounded flex-1"></div>
                    <div className="h-10 bg-gray-100 rounded flex-1"></div>
                  </div>
                  
                  {/* Skeleton Sections */}
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 border-2 border-gray-100 rounded-2xl mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-gray-200 rounded"></div>
                        <div className="h-6 bg-gray-200 rounded flex-1"></div>
                        <div className="w-8 h-8 bg-gray-100 rounded"></div>
                        <div className="w-8 h-8 bg-gray-100 rounded"></div>
                      </div>
                      
                      {/* Skeleton Fields */}
                      <div className="pl-12 space-y-3">
                        {[1, 2].map(j => (
                          <div key={j} className="p-3 bg-gray-50 border rounded-xl">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="h-8 bg-gray-200 rounded"></div>
                              <div className="h-8 bg-gray-200 rounded"></div>
                            </div>
                            <div className="h-8 bg-gray-100 rounded"></div>
                          </div>
                        ))}
                        <div className="h-9 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Actual Content
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Form</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">
                      Judul Form
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input id="title" value={formData.title} onChange={(e) => updateFormData('title', e.target.value)} placeholder="Contoh: Pendaftaran Kelas Digital Marketing" className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="folder">
                      Folder
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select value={formData.folder} onValueChange={(value) => updateFormData('folder', value)} required>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pilih folder">
                          {formData.folder && (() => {
                            const selectedCategory = categories.find(cat => cat.name === formData.folder);
                            const IconComponent = SECTION_ICONS[selectedCategory?.icon] || Folder;
                            return (
                              <span className="flex items-center gap-2">
                                <IconComponent 
                                  className="w-4 h-4" 
                                  style={{ color: selectedCategory?.color || '#F59E0B' }}
                                />
                                {formData.folder}
                              </span>
                            );
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {folders.map(folderName => {
                          const category = categories.find(cat => cat.name === folderName);
                          const IconComponent = SECTION_ICONS[category?.icon] || Folder;
                          return (
                            <SelectItem key={folderName} value={folderName}>
                              <span className="flex items-center gap-2">
                                <IconComponent 
                                  className="w-4 h-4" 
                                  style={{ color: category?.color || '#F59E0B' }}
                                />
                                {folderName}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Additional Form Settings */}
                <div className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="description">Deskripsi Form</Label>
                    <Input 
                      id="description"
                      value={formData.description} 
                      onChange={(e) => updateFormData('description', e.target.value)} 
                      placeholder="Deskripsi singkat tentang form ini"
                      className="mt-1" 
                    />
                  </div>

                  <div>
                    <Label htmlFor="coverImage">Cover Image URL</Label>
                    <Input 
                      id="coverImage"
                      value={formData.coverImage} 
                      onChange={(e) => updateFormData('coverImage', e.target.value)} 
                      placeholder="https://example.com/banner.jpg"
                      className="mt-1" 
                    />
                    {formData.coverImage && (
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <img src={formData.coverImage} alt="Cover preview" className="w-full h-32 object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Tanggal Mulai</Label>
                      <Input 
                        id="startDate"
                        type="date"
                        value={formData.startDate} 
                        onChange={(e) => updateFormData('startDate', e.target.value)} 
                        className="mt-1" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">Tanggal Berakhir</Label>
                      <Input 
                        id="endDate"
                        type="date"
                        value={formData.endDate} 
                        onChange={(e) => updateFormData('endDate', e.target.value)} 
                        className="mt-1" 
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="maxSubmissions">Batas Maksimal Submission</Label>
                    <Input 
                      id="maxSubmissions"
                      type="number"
                      value={formData.maxSubmissions || ''} 
                      onChange={(e) => updateFormData('maxSubmissions', e.target.value ? parseInt(e.target.value) : null)} 
                      placeholder="Kosongkan untuk unlimited"
                      className="mt-1" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ada batas</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <div>
                        <p className="font-semibold">Enable Affiliate</p>
                        <p className="text-xs text-gray-600">Kode afiliasi opsional</p>
                      </div>
                      <Switch 
                        checked={formData.hasAffiliate} 
                        onCheckedChange={(checked) => updateFormData('hasAffiliate', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                      <div>
                        <p className="font-semibold">Status Form</p>
                        <p className="text-xs text-gray-600">Form {formData.isActive ? 'aktif' : 'nonaktif'}</p>
                      </div>
                      <Switch 
                        checked={formData.isActive} 
                        onCheckedChange={(checked) => updateFormData('isActive', checked)} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="fields" className="bg-white rounded-2xl shadow-lg p-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fields">Form Fields</TabsTrigger>
                  <TabsTrigger value="payment">Payment & Pricing</TabsTrigger>
                </TabsList>

                <TabsContent value="fields" className="space-y-4 mt-4">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={formData.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                      {formData.sections.map(section => (
                        <SortableItem key={section.id} id={section.id}>
                          <SectionItem
                            section={section}
                            isEditing={editingSectionId === section.id}
                            fields={formData.fields.filter(f => f.sectionId === section.id)}
                            onStartEdit={setEditingSectionId}
                            onStopEdit={() => setEditingSectionId(null)}
                            onUpdateName={updateSectionName}
                            onUpdateIcon={updateSectionIcon}
                            onDelete={deleteSection}
                            onUpdateField={updateField}
                            onDeleteField={deleteField}
                            onAddField={addField}
                          />
                        </SortableItem>
                      ))}
                    </SortableContext>
                  </DndContext>
                  <Button onClick={addSection} className="w-full gap-2"><Plus className="w-4 h-4" /> Tambah Section</Button>
                </TabsContent>

                <TabsContent value="payment" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div>
                      <p className="font-semibold">Enable Payment</p>
                      <p className="text-xs text-gray-600">Aktifkan pembayaran untuk form ini</p>
                    </div>
                    <Switch checked={formData.hasPayment} onCheckedChange={(checked) => updateFormData('hasPayment', checked)} />
                  </div>

                  {formData.hasPayment && (
                    <>
                      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                        <p className="font-semibold">Enable Upsell</p>
                        <Switch checked={formData.upsellEnabled} onCheckedChange={(checked) => updateFormData('upsellEnabled', checked)} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">Pricing Tiers</h3>
                        <Button onClick={addPricingTier} size="sm" className="gap-2">
                          <Plus className="w-4 h-4" /> Tambah Tier
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {formData.pricingTiers.map(tier => (
                          <div key={tier.id} className="p-4 border-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Nama Paket</Label>
                                  <Input 
                                    value={tier.name} 
                                    onChange={(e) => updatePricingTier(tier.id, { name: e.target.value })} 
                                    className="mt-1" 
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Harga (Rp)</Label>
                                  <Input 
                                    type="number" 
                                    value={tier.price} 
                                    onChange={(e) => updatePricingTier(tier.id, { price: parseInt(e.target.value) || 0 })} 
                                    className="mt-1" 
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Fitur</Label>
                                <Input 
                                  value={tier.features} 
                                  onChange={(e) => updatePricingTier(tier.id, { features: e.target.value })} 
                                  className="mt-1" 
                                />
                              </div>
                              <div className="flex justify-end">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => deletePricingTier(tier.id)} 
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Hapus
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
            )}
          </div>
        </main>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview Form</DialogTitle>
            </DialogHeader>
            <UserFormView isPreview={true} previewData={formData} />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default FormBuilderEditor;
