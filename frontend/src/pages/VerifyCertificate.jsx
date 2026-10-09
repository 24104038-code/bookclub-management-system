import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import BookClubAPI from '../services/api';
import BookClubStore from '../services/store';

export default function VerifyCertificate() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || searchParams.get('certificateId') || '';
  const [certIdInput, setCertIdInput] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [verifiedCert, setVerifiedCert] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const runVerification = async (idToVerify) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setVerifiedCert(null);

    try {
      // 1. First check local store
      const localCert = BookClubStore.getCertificateById(idToVerify.trim());
      if (localCert) {
        setVerifiedCert({
          certificateId: localCert.id,
          participantName: localCert.recipient,
          type: localCert.type || 'challenge',
          challengeTitle: localCert.title,
          eventName: localCert.eventName || localCert.title,
          issueDate: localCert.date || new Date().toISOString(),
          status: 'verified',
          organizerName: localCert.issuer || 'BOOK FORGE Verification Guild',
          verificationCode: localCert.verificationCode || 'BF-VERIFIED'
        });
        setLoading(false);
        return;
      }

      // 2. Try backend API
      const res = await BookClubAPI.certificates.verify(encodeURIComponent(idToVerify.trim()));
      if (res && res.success && res.valid && res.data) {
        setVerifiedCert(res.data);
      } else {
        setErrorMsg('Invalid or unverified certificate ID. Please ensure the code matches the credential document.');
      }
    } catch (err) {
      setErrorMsg('Certificate could not be authenticated against the guild registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      runVerification(initialId);
    }
  }, [initialId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    runVerification(certIdInput);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '40px 20px' }}>
      <main style={{ maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Link to="/" className="brand" style={{ fontSize: '1.8rem', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span className="mark">📖</span>
            <span className="brand-text"><span className="brand-book">BOOK</span> <span className="brand-forge">FORGE</span></span>
          </Link>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '4px' }}>
            Credential Verification Portal
          </div>
          <p className="text-soft" style={{ marginTop: '6px' }}>
            Authenticate and verify official BOOK FORGE event & challenge credentials.
          </p>
        </div>

        {/* Verification Search Card */}
        <div className="card panel mb-30" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="e.g. BC-EVT-2026-000001 or CERT-CH-1"
              value={certIdInput}
              onChange={(e) => setCertIdInput(e.target.value)}
              style={{ flex: 1, minWidth: '240px', fontFamily: 'monospace', fontSize: '1rem', textTransform: 'uppercase' }}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Credential'}
            </button>
          </form>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="card panel" style={{ textAlign: 'center', padding: '30px' }}>
            <p>⏳ Verifying certificate ID: <strong>{certIdInput}</strong> against the official registry...</p>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="alert alert-error" style={{ padding: '16px 20px', borderRadius: '8px', background: '#FDF2F2', border: '1px solid #F87171', color: '#991B1B', marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        {/* Verified Result */}
        {verifiedCert && (
          <div className="card panel" style={{ borderTop: `4px solid ${verifiedCert.type === 'challenge' ? '#C5A059' : '#2D6A4F'}`, padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <div>
                <span className="badge" style={{ background: '#D8F3DC', color: '#1B4332', fontSize: '0.85rem', padding: '4px 10px' }}>
                  ✓ Official Verified Credential
                </span>
                <h2 style={{ margin: '10px 0 4px 0', color: 'var(--ink)' }}>
                  {verifiedCert.type === 'challenge' ? 'Valid Reading Challenge Completion Certificate' : 'Valid Event Participation Certificate'}
                </h2>
                <span className="text-soft" style={{ fontFamily: 'monospace' }}>
                  Certificate ID: <strong>{verifiedCert.certificateId}</strong>
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-completed">Status: {verifiedCert.status?.toUpperCase() || 'VERIFIED'}</span>
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: '16px', margin: '20px 0', background: 'var(--cream-deep)', padding: '18px', borderRadius: '8px' }}>
              <div>
                <span className="text-soft" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Participant</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>
                  {verifiedCert.participantName}
                </div>
              </div>
              <div>
                <span className="text-soft" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Credential Type</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brown-deep)', marginTop: '2px' }}>
                  {verifiedCert.type === 'challenge' ? 'Reading Challenge Completion' : 'Event Participation'}
                </div>
              </div>
              <div>
                <span className="text-soft" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  {verifiedCert.type === 'challenge' ? 'Challenge Title' : 'Event Name'}
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>
                  {verifiedCert.challengeTitle || verifiedCert.eventName}
                </div>
              </div>
              <div>
                <span className="text-soft" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Issue Date</span>
                <div style={{ fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>
                  {new Date(verifiedCert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <div>
                <span className="text-soft" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Verified Authority</span>
                <div style={{ fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>
                  {verifiedCert.organizerName || 'BOOK FORGE Reading Guild'}
                </div>
              </div>
              <div>
                <span className="text-soft" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Security Verification Code</span>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--shell-gold-deep)', marginTop: '2px', fontSize: '1.1rem' }}>
                  {verifiedCert.verificationCode || 'BF-AUTHENTIC'}
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-soft" style={{ textAlign: 'center', marginTop: '40px', fontSize: '0.85rem' }}>
          <Link to="/events">← Explore Community Events</Link> &nbsp;·&nbsp; <Link to="/dashboard">Reader Dashboard</Link>
        </p>
      </main>
    </div>
  );
}
