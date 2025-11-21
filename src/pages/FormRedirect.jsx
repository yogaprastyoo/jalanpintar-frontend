import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const FormRedirect = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get the referral code from query parameters
    const urlParams = new URLSearchParams(location.search);
    const referralCode = urlParams.get('ref');
    
    // Determine the target URL
    let targetUrl = `/user/form/${slug}`;
    
    // If there's a referral code, append it to the target URL
    if (referralCode) {
      targetUrl += `?ref=${referralCode}`;
    }
    
    // Redirect to the actual form page
    navigate(targetUrl, { replace: true });
  }, [slug, location.search, navigate]);

  // Show a loading indicator while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Mengalihkan ke form...</p>
      </div>
    </div>
  );
};

export default FormRedirect;