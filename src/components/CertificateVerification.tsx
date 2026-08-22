import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Award, Loader2, ExternalLink } from 'lucide-react';
import { invokeEdgeFunction } from '../lib/api';

interface CertificateData {
  studentName: string;
  trackTitle: string;
  issuedAt: string;
  isVerified: boolean;
}

export function CertificateVerification() {
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateData | null>(null);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!certId.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await invokeEdgeFunction<{ certificate: CertificateData }>('verify-certificate', {
        queryParams: { certId: certId.trim() }
      });
      setResult(data.certificate);
    } catch (err: any) {
      setError(err.message || 'Certificate not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Backend Forge</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verify Certificate</h1>
          <p className="text-zinc-500 text-sm">Enter a certificate ID to verify its authenticity</p>
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={certId}
            onChange={e => setCertId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleVerify()}
            placeholder="Enter certificate ID (e.g., BF-1-abc123...)"
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            onClick={handleVerify}
            disabled={loading || !certId.trim()}
            className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-zinc-900 border border-emerald-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              {result.isVerified ? (
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
              <div>
                <h3 className="font-bold text-white">
                  {result.isVerified ? 'Certificate Verified' : 'Certificate Invalid'}
                </h3>
                <p className="text-xs text-zinc-500">
                  {result.isVerified ? 'This certificate is authentic and was issued by Backend Forge' : 'This certificate could not be verified'}
                </p>
              </div>
            </div>
            {result.isVerified && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Student</span>
                  <span className="text-white font-medium">{result.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Track</span>
                  <span className="text-white font-medium">{result.trackTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Issued</span>
                  <span className="text-white font-medium">{new Date(result.issuedAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-4 text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
