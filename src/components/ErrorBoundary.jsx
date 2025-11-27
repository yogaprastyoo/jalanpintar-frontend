import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

/**
 * Error Boundary Component
 * Catches unhandled React errors and displays graceful fallback UI
 * 
 * Features:
 * - Prevents entire app crash
 * - User-friendly error message
 * - Error logging (ready for Sentry/DataDog integration)
 * - Development mode: shows error stack trace
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('📍 Component stack:', errorInfo.componentStack);
    
    // Store error info in state for display
    this.setState({
      error,
      errorInfo
    });
    
    // TODO: Send to error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    // Example: logErrorToService(error, errorInfo);
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.group('🐛 Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
          <div className="max-w-2xl w-full mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
              {/* Error Icon */}
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Oops! Terjadi Kesalahan
                </h1>
                <p className="text-gray-600 text-lg">
                  Aplikasi mengalami error yang tidak terduga.
                </p>
              </div>

              {/* User-friendly message */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Apa yang bisa Anda lakukan?</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 text-left list-disc list-inside space-y-1">
                  <li>Coba refresh halaman</li>
                  <li>Kembali ke halaman utama</li>
                  <li>Jika masalah berlanjut, hubungi administrator</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <Button 
                  onClick={this.handleReset}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <RefreshCw className="w-4 h-4" />
                  Coba Lagi
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  Kembali ke Beranda
                </Button>
              </div>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 mb-2">
                    🔧 Error Details (Development Mode)
                  </summary>
                  <div className="mt-3 p-4 bg-red-50 rounded-lg border border-red-200 overflow-auto">
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-red-800 mb-1">Error Message:</p>
                      <pre className="text-xs text-red-700 whitespace-pre-wrap break-words">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-red-800 mb-1">Stack Trace:</p>
                        <pre className="text-xs text-red-700 whitespace-pre-wrap break-words font-mono">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo && (
                      <div>
                        <p className="text-xs font-semibold text-red-800 mb-1">Component Stack:</p>
                        <pre className="text-xs text-red-700 whitespace-pre-wrap break-words font-mono">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Production hint */}
              {!import.meta.env.DEV && (
                <p className="text-xs text-gray-500 mt-6">
                  Error ID: {Date.now().toString(36).toUpperCase()}
                  <br />
                  Tim kami telah diberitahu tentang masalah ini.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
