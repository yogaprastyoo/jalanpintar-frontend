import React, { useState } from 'react';
import { Copy, Share2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';

const AffiliateLinksManager = ({ affiliates }) => {
  const [copiedId, setCopiedId] = useState(null);
  const { toast } = useToast();

  const generateAffiliateLink = (affiliate) => {
    // Debug: Log affiliate data to understand structure
    console.log('🔍 Generating link for affiliate:', affiliate);
    console.log('🔍 Available keys:', Object.keys(affiliate));
    
    // Generate proper affiliate URL with proper null checking
    let formSlug;
    
    // Check all possible slug locations based on your actual data structure
    if (affiliate.form && affiliate.form.slug) {
      formSlug = affiliate.form.slug;
      console.log('✅ Using form.slug:', formSlug);
    } else if (affiliate.form_slug) {
      formSlug = affiliate.form_slug;
      console.log('✅ Using form_slug:', formSlug);
    } else if (affiliate.slug) {
      formSlug = affiliate.slug;
      console.log('✅ Using affiliate.slug:', formSlug);
    } else if (affiliate.form && affiliate.form.title) {
      // Generate slug from nested form title - this is your actual data structure!
      formSlug = affiliate.form.title.toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '');
      console.log('✅ Generated slug from form.title "' + affiliate.form.title + '":', formSlug);
    } else if (affiliate.form_title && affiliate.form_title !== 'undefined') {
      // Generate slug from form_title field
      formSlug = affiliate.form_title.toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '');
      console.log('✅ Generated slug from form_title "' + affiliate.form_title + '":', formSlug);
    } else {
      // Try other possible title fields
      const titleFields = ['title', 'name', 'form_name'];
      let foundTitle = null;
      
      for (const field of titleFields) {
        if (affiliate[field] && typeof affiliate[field] === 'string' && affiliate[field] !== 'undefined') {
          foundTitle = affiliate[field];
          break;
        }
      }
      
      if (foundTitle) {
        formSlug = foundTitle.toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]/g, '')
          .replace(/--+/g, '-')
          .replace(/^-|-$/g, '');
        console.log('✅ Generated slug from found title "' + foundTitle + '":', formSlug);
      } else {
        // LAST RESORT: Use a generic slug instead of ID
        console.error('❌ No title found! Available data:', affiliate);
        formSlug = 'form-not-found';
      }
    }
    
    const link = `${window.location.origin}/forms/${formSlug}?ref=${affiliate.affiliate_code}`;
    console.log('🔗 Generated affiliate link:', link);
    return link;
  };

  const copyToClipboard = async (affiliate) => {
    try {
      const link = generateAffiliateLink(affiliate);
      await navigator.clipboard.writeText(link);
      setCopiedId(affiliate.id);
      toast({
        title: "Link Disalin! 📋",
        description: "Affiliate link berhasil disalin ke clipboard"
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Gagal Menyalin ❌",
        description: "Tidak dapat menyalin link ke clipboard",
        variant: "destructive"
      });
    }
  };

  const shareAffiliate = async (affiliate) => {
    const link = generateAffiliateLink(affiliate);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Daftar ${affiliate.form_title}`,
          text: `Ayo daftar ${affiliate.form_title} melalui link referral saya!`,
          url: link
        });
      } catch (error) {
        // Fallback to copy if share fails
        copyToClipboard(affiliate);
      }
    } else {
      // Fallback for browsers without Web Share API
      copyToClipboard(affiliate);
    }
  };

  if (!affiliates || affiliates.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Affiliate Links</h2>
        </div>
        <div className="text-center py-8">
          <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Belum ada affiliate links</p>
          <p className="text-sm text-gray-400">Hubungi admin untuk mendapatkan affiliate program</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
          <Share2 className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Affiliate Links</h2>
      </div>
      
      <div className="space-y-4">
        {affiliates.map((affiliate) => (
          <div key={affiliate.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-purple-900">{affiliate.form_title}</h3>
                <p className="text-sm text-purple-600 font-mono bg-purple-100 px-2 py-1 rounded inline-block">
                  {affiliate.affiliate_code}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                affiliate.status === 'approved' 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {affiliate.status}
              </span>
            </div>
            
            {/* Affiliate Link Display */}
            <div className="mb-3">
              <label className="text-xs text-purple-600 font-medium mb-2 block">Affiliate Link:</label>
              <div className="flex items-center gap-2">
                <Input
                  value={generateAffiliateLink(affiliate)}
                  readOnly
                  className="text-xs bg-white border-purple-200 font-mono"
                />
                <Button
                  onClick={() => copyToClipboard(affiliate)}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 ${
                    copiedId === affiliate.id 
                      ? 'bg-green-50 border-green-300 text-green-700' 
                      : 'border-purple-300 text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  {copiedId === affiliate.id ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copiedId === affiliate.id ? 'Tersalin!' : 'Copy'}
                </Button>
                <Button
                  onClick={() => shareAffiliate(affiliate)}
                  variant="outline"
                  size="sm"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-purple-600">Total Earned</p>
                <p className="font-semibold text-purple-900">
                  Rp {new Intl.NumberFormat('id-ID').format(affiliate.total_earned)}
                </p>
              </div>
              <div>
                <p className="text-purple-600">Referrals</p>
                <p className="font-semibold text-purple-900">{affiliate.total_referrals}</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-purple-200">
              <Button
                onClick={() => window.open(generateAffiliateLink(affiliate), '_blank')}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-purple-700 border-purple-300 hover:bg-purple-50"
              >
                <ExternalLink className="w-3 h-3" />
                Preview
              </Button>
              <Button
                onClick={() => shareAffiliate(affiliate)}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90"
              >
                Share Link
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AffiliateLinksManager;