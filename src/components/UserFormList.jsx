import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { isAuthenticated } from '@/lib/api';
import { FileText, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Button } from './ui/button';

const UserFormList = () => {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAuthenticated()) {
          // Use authenticated endpoint that includes submission status
          const response = await api.get('/user/forms');
          setForms(response.data);
        } else {
          // Use public endpoint for non-authenticated users
          const response = await api.get('/forms');
          setForms(response.data);
        }
      } catch (err) {
        console.error('Failed to load forms:', err);
        setError('Failed to load forms.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 p-6 rounded-xl space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-white p-6 rounded-2xl shadow-sm text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Form Tersedia</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map(form => {
          // Check if user has submitted to this form using the API response
          const hasSubmitted = isAuthenticated() && form.user_has_submitted;
          

          
          return (
            <div key={form.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow relative">
              {/* Status indicator */}
              {hasSubmitted && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    {form.user_submission_status === 'approved' ? 'Disetujui' : 
                     form.user_submission_status === 'pending' ? 'Menunggu' : 
                     'Sudah Daftar'}
                  </div>
                </div>
              )}
              
              {/* Header color indicator */}
              <div className={`h-2 ${hasSubmitted ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`} />
              
              <div className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${hasSubmitted ? 'bg-gradient-to-r from-green-100 to-green-200' : 'bg-gradient-to-r from-blue-100 to-blue-200'}`}>
                      {hasSubmitted ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 pr-16">{form.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{form.description}</p>
                  
                  {/* Submission info for registered forms */}
                  {hasSubmitted && form.user_submitted_at && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-xs text-green-700 font-medium">Terdaftar pada:</p>
                      <p className="text-sm text-green-800">
                        {new Date(form.user_submitted_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
                
                {hasSubmitted ? (
                  <Button asChild className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90">
                    <Link to={`/user/form/${form.slug}`} className="flex items-center justify-center gap-2">
                      Lihat Detail <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90">
                    <Link to={`/user/form/${form.slug}`} className="flex items-center justify-center gap-2">
                      Daftar Sekarang <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserFormList;
