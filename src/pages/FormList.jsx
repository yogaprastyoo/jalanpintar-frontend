
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Folder, Eye, MessageSquare, FileSpreadsheet, MoreVertical, Edit, Trash2, FolderPlus,
  // Import icons untuk kategori
  User, Mail, Phone, MapPin, CreditCard, FileText, Calendar, 
  Briefcase, GraduationCap, Heart, Home, Settings, Star, ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api, { isAuthenticated } from '@/lib/api';

// Icon mapping untuk kategori
const CATEGORY_ICONS = {
  Folder, User, Mail, Phone, MapPin, CreditCard, FileText, Calendar,
  Briefcase, GraduationCap, Heart, Home, Settings, Star, ShoppingCart, FolderPlus
};

const ICON_OPTIONS = [
  { value: 'Folder', label: 'Folder' },
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
  { value: 'FolderPlus', label: 'Folder Plus' }
];

const COLOR_OPTIONS = [
  { value: '#F59E0B', label: 'Kuning', color: 'bg-yellow-500' },
  { value: '#3B82F6', label: 'Biru', color: 'bg-blue-500' },
  { value: '#10B981', label: 'Hijau', color: 'bg-green-500' },
  { value: '#EF4444', label: 'Merah', color: 'bg-red-500' },
  { value: '#8B5CF6', label: 'Ungu', color: 'bg-purple-500' },
  { value: '#EC4899', label: 'Pink', color: 'bg-pink-500' },
  { value: '#F97316', label: 'Orange', color: 'bg-orange-500' },
  { value: '#06B6D4', label: 'Cyan', color: 'bg-cyan-500' },
  { value: '#6366F1', label: 'Indigo', color: 'bg-indigo-500' },
  { value: '#14B8A6', label: 'Teal', color: 'bg-teal-500' }
];

const FormList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [forms, setForms] = useState([]);
  const [folders, setFolders] = useState([]);
  const [categories, setCategories] = useState([]); // Store full category objects with ID
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
    icon: 'Folder',
    color: '#F59E0B'
  });
  const [editingFolder, setEditingFolder] = useState(null); // For editing folder
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Clear old dummy data from localStorage on first load
    const clearOldData = () => {
      const savedForms = localStorage.getItem('smartpath_forms');
      if (savedForms) {
        try {
          const forms = JSON.parse(savedForms);
          // Check if it contains dummy data
          if (forms.some(f => f.id === 'demo' || f.submissions === 60000)) {
            localStorage.removeItem('smartpath_forms');
          }
        } catch (e) {
          // Invalid data, clear it
          localStorage.removeItem('smartpath_forms');
        }
      }
      
      const savedFolders = localStorage.getItem('smartpath_folders');
      if (savedFolders) {
        try {
          const folders = JSON.parse(savedFolders);
          // Check if it contains dummy folders
          if (folders.includes('Kelas Gratis') || folders.includes('Program Beasiswa')) {
            localStorage.removeItem('smartpath_folders');
          }
        } catch (e) {
          localStorage.removeItem('smartpath_folders');
        }
      }
    };
    
    clearOldData();
    loadForms();
    loadFolders();
  }, []);

  const loadForms = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/forms');
      console.log('📋 Forms from API:', response.data);
      
      // Map API response to match current structure
      const apiFormsData = response.data.map(form => ({
        id: form.id,
        slug: form.slug, // Add slug field for SEO-friendly URLs
        title: form.title || form.name,
        folder: form.category?.name || form.folder || 'Uncategorized',
        submissions: form.submissions_count || form.responses_count || 0,
        createdAt: form.created_at
      }));
      
      console.log('📋 Mapped forms with slug:', apiFormsData);
      setForms(apiFormsData);
      
      // Also save to localStorage as backup
      localStorage.setItem('smartpath_forms', JSON.stringify(apiFormsData));
    } catch (error) {
      console.error('Failed to load forms from API:', error);
      // Show empty state instead of dummy data
      setForms([]);
      toast({
        title: "Info",
        description: "Tidak dapat memuat data dari server. Pastikan API sudah berjalan.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await api.get('/api/categories');
      console.log('📂 Categories loaded from API:', response.data);
      
      // Log each category's icon and color
      response.data.forEach(cat => {
        console.log(`Category "${cat.name}":`, {
          icon: cat.icon,
          color: cat.color,
          description: cat.description
        });
        
        // Check if backend is saving icon/color
        if (cat.icon === null) {
          console.warn(`⚠️ Backend tidak menyimpan icon untuk "${cat.name}". Pastikan field 'icon' ada di migration dan $fillable.`);
        }
        if (cat.color === null) {
          console.warn(`⚠️ Backend tidak menyimpan color untuk "${cat.name}". Pastikan field 'color' ada di migration dan $fillable.`);
        }
      });
      
      // Store full category objects
      setCategories(response.data);
      // Extract category names for display
      const categoryNames = response.data.map(cat => cat.name);
      setFolders(categoryNames);
      
      // Also save to localStorage as backup
      localStorage.setItem('smartpath_folders', JSON.stringify(categoryNames));
    } catch (error) {
      console.error('Failed to load categories from API:', error);
      // Show empty state instead of dummy data
      setFolders([]);
      setCategories([]);
      toast({
        title: "Info",
        description: "Tidak dapat memuat kategori dari server.",
        variant: "destructive"
      });
    }
  };

  const createFolder = async () => {
    if (!newFolder.name.trim()) {
      toast({
        title: "Error! ❌",
        description: "Nama folder harus diisi.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Generate slug from folder name (lowercase, replace spaces with dashes)
      const slug = newFolder.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, ''); // Remove special characters
      
      const payload = {
        name: newFolder.name.trim(),
        slug: slug,
        description: newFolder.description || `Kategori ${newFolder.name}`,
        icon: newFolder.icon,
        color: newFolder.color,
        is_active: true
      };
      
      console.log('📤 Creating category with payload:', payload);
      
      // Create via API with Laravel structure
      const response = await api.post('/api/categories', payload);
      
      console.log('✅ Category created:', response.data);
      console.log('📝 Icon saved:', response.data.icon);
      console.log('🎨 Color saved:', response.data.color);
      
      // Reload both folders and forms from API
      await loadFolders();
      await loadForms(); // ← Reload forms juga untuk sinkronisasi data
      
      // Reset form
      setNewFolder({
        name: '',
        description: '',
        icon: 'Folder',
        color: '#F59E0B'
      });
      setIsDialogOpen(false);
      toast({
        title: "Folder berhasil dibuat! 📁",
        description: `Folder "${newFolder.name}" telah ditambahkan.`,
      });
    } catch (error) {
      console.error('Failed to create folder via API:', error);
      toast({
        title: "Error! ❌",
        description: error.message || "Gagal membuat folder.",
        variant: "destructive"
      });
    }
  };

  const updateFolder = async () => {
    if (!editingFolder || !editingFolder.name.trim()) return;
    
    try {
      // Generate new slug
      const slug = editingFolder.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '');
      
      const payload = {
        name: editingFolder.name.trim(),
        slug: slug,
        description: editingFolder.description || `Kategori ${editingFolder.name}`,
        icon: editingFolder.icon || 'Folder',
        color: editingFolder.color || '#F59E0B',
        is_active: editingFolder.is_active !== false
      };
      
      console.log('📤 Updating category with payload:', payload);
      
      // Update via API
      const response = await api.put(`/api/categories/${editingFolder.id}`, payload);
      
      console.log('✅ Category updated:', response.data);
      console.log('📝 Icon updated:', response.data.icon);
      console.log('🎨 Color updated:', response.data.color);
      
      // Reload both folders AND forms from API
      await loadFolders();
      await loadForms(); // ← Tambahkan ini untuk reload forms juga
      
      setEditingFolder(null);
      setIsEditDialogOpen(false);
      toast({
        title: "Folder berhasil diupdate! ✏️",
        description: `Folder telah diperbarui.`,
      });
    } catch (error) {
      console.error('Failed to update folder via API:', error);
      toast({
        title: "Error! ❌",
        description: error.message || "Gagal mengupdate folder.",
        variant: "destructive"
      });
    }
  };

  const deleteFolder = async (categoryId, categoryName) => {
    // Check if folder has forms
    const formsInFolder = forms.filter(f => f.folder === categoryName);
    
    if (formsInFolder.length > 0) {
      toast({
        title: "Tidak bisa menghapus! ⚠️",
        description: `Folder ini masih memiliki ${formsInFolder.length} form. Hapus atau pindahkan form terlebih dahulu.`,
        variant: "destructive"
      });
      return;
    }
    
    if (!confirm(`Yakin ingin menghapus folder "${categoryName}"?`)) {
      return;
    }
    
    try {
      // Delete via API
      await api.delete(`/api/categories/${categoryId}`);
      
      console.log('✅ Category deleted');
      
      // Reload both folders and forms from API
      await loadFolders();
      await loadForms(); // ← Reload forms untuk sinkronisasi
      
      toast({
        title: "Folder dihapus! 🗑️",
        description: "Folder telah berhasil dihapus.",
      });
    } catch (error) {
      console.error('Failed to delete folder via API:', error);
      toast({
        title: "Error! ❌",
        description: error.message || "Gagal menghapus folder.",
        variant: "destructive"
      });
    }
  };

  const deleteForm = async (formId) => {
    try {
      // Delete via API
      await api.delete(`/api/forms/${formId}`);
      
      // Update local state
      const updatedForms = forms.filter(f => f.id !== formId);
      setForms(updatedForms);
      localStorage.setItem('smartpath_forms', JSON.stringify(updatedForms));
      
      toast({
        title: "Form dihapus! 🗑️",
        description: "Form telah berhasil dihapus.",
      });
    } catch (error) {
      console.error('Failed to delete form via API:', error);
      toast({
        title: "Error! ❌",
        description: error.message || "Gagal menghapus form.",
        variant: "destructive"
      });
    }
  };

  const groupedForms = folders.reduce((acc, folder) => {
    acc[folder] = forms.filter(f => f.folder === folder);
    return acc;
  }, {});

  return (
    <>
      <Helmet>
        <title>Form Builder - SmartPath Admin</title>
        <meta name="description" content="Buat dan kelola form custom dengan payment gateway" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Form Builder</h1>
                <p className="text-gray-600">Kelola semua form pendaftaran Anda di sini.</p>
              </div>
              <div className="flex gap-3">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <FolderPlus className="w-4 h-4" />
                      Folder Baru
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Buat Folder Baru</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="folderName">Nama Folder</Label>
                        <Input
                          id="folderName"
                          value={newFolder.name}
                          onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                          placeholder="Contoh: Program Magang"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="folderDescription">Deskripsi</Label>
                        <Input
                          id="folderDescription"
                          value={newFolder.description}
                          onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                          placeholder="Contoh: Folder untuk program magang"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="folderIcon">Icon</Label>
                        <Select
                          value={newFolder.icon}
                          onValueChange={(value) => setNewFolder({ ...newFolder, icon: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                {React.createElement(CATEGORY_ICONS[newFolder.icon] || Folder, { className: "w-4 h-4" })}
                                <span>{ICON_OPTIONS.find(opt => opt.value === newFolder.icon)?.label || 'Folder'}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {ICON_OPTIONS.map(option => {
                              const IconComponent = CATEGORY_ICONS[option.value];
                              return (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    {IconComponent && <IconComponent className="w-4 h-4" />}
                                    <span>{option.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="folderColor">Warna Icon</Label>
                        <Select
                          value={newFolder.color}
                          onValueChange={(value) => setNewFolder({ ...newFolder, color: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: newFolder.color }}
                                />
                                <span>{COLOR_OPTIONS.find(opt => opt.value === newFolder.color)?.label || 'Kuning'}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {COLOR_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className={`w-4 h-4 rounded ${option.color}`}
                                  />
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={createFolder} className="w-full">
                        Buat Folder
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={() => navigate('/admin/forms/new')}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Plus className="w-4 h-4" />
                  Buat Form Baru
                </Button>
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Skeleton Folders */}
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  {/* Skeleton Folder Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                      <div className="h-6 bg-gray-200 rounded w-32"></div>
                      <div className="h-5 w-16 bg-blue-100 rounded-full"></div>
                    </div>
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  </div>

                  {/* Skeleton Forms */}
                  <div className="space-y-3">
                    {[1, 2].map(j => (
                      <div key={j} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                          <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-8 bg-gray-200 rounded"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : folders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-12 text-center"
            >
              <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Kategori</h3>
              <p className="text-gray-600 mb-6">
                Mulai dengan membuat kategori/folder untuk mengorganisir form Anda
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700"
              >
                <FolderPlus className="w-4 h-4" />
                Buat Kategori Pertama
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {folders.map((folderName) => {
                const category = categories.find(cat => cat.name === folderName);
                
                return (
              <div key={folderName} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {React.createElement(
                        CATEGORY_ICONS[category?.icon] || Folder, 
                        { 
                          className: "w-6 h-6",
                          style: { color: category?.color || '#F59E0B' }
                        }
                      )}
                      <h2 className="text-xl font-bold text-gray-900">{folderName}</h2>
                      <span className="text-sm text-gray-500">({groupedForms[folderName]?.length || 0} form)</span>
                    </div>
                    {category?.description && (
                      <p className="text-sm text-gray-600 ml-9">{category.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingFolder({
                            id: category?.id,
                            name: folderName,
                            slug: category?.slug,
                            description: category?.description,
                            icon: category?.icon || 'Folder',
                            color: category?.color || '#F59E0B',
                            is_active: category?.is_active
                          });
                          setIsEditDialogOpen(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Folder</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600" 
                          onClick={() => category && deleteFolder(category.id, folderName)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Hapus Folder</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="space-y-3">
                  {groupedForms[folderName]?.length > 0 ? (
                    groupedForms[folderName].map(form => (
                      <motion.div
                        key={form.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">{form.title}</p>
                          <p className="text-sm text-blue-600 font-medium">{form.submissions?.toLocaleString('id-ID') || 0} Pendaftar</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/user/form/${form.slug || form.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/admin/forms/edit/${form.id}`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Form</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/admin/forms/responses/${form.id}`)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span>Lihat Respon</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: '🚧 Fitur ekspor akan segera hadir!' })}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                <span>Ekspor ke Spreadsheet</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => deleteForm(form.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Hapus</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">Belum ada form di folder ini</p>
                  )}
                </div>
              </div>
              );
            })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Edit Folder Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="editFolderName">Nama Folder</Label>
              <Input
                id="editFolderName"
                value={editingFolder?.name || ''}
                onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                placeholder="Nama folder"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="editFolderDescription">Deskripsi</Label>
              <Input
                id="editFolderDescription"
                value={editingFolder?.description || ''}
                onChange={(e) => setEditingFolder({ ...editingFolder, description: e.target.value })}
                placeholder="Deskripsi folder"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="editFolderIcon">Icon</Label>
              <Select
                value={editingFolder?.icon || 'Folder'}
                onValueChange={(value) => setEditingFolder({ ...editingFolder, icon: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {React.createElement(CATEGORY_ICONS[editingFolder?.icon] || Folder, { className: "w-4 h-4" })}
                      <span>{ICON_OPTIONS.find(opt => opt.value === editingFolder?.icon)?.label || 'Folder'}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map(option => {
                    const IconComponent = CATEGORY_ICONS[option.value];
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {IconComponent && <IconComponent className="w-4 h-4" />}
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="editFolderColor">Warna Icon</Label>
              <Select
                value={editingFolder?.color || '#F59E0B'}
                onValueChange={(value) => setEditingFolder({ ...editingFolder, color: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: editingFolder?.color || '#F59E0B' }}
                      />
                      <span>{COLOR_OPTIONS.find(opt => opt.value === editingFolder?.color)?.label || 'Kuning'}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-4 h-4 rounded ${option.color}`}
                        />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={updateFolder} className="w-full">
              Simpan Perubahan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FormList;
