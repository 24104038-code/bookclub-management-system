import React from 'react';
import BookClubAPI from '../services/api';

export default function CertificateModal({ certificate, cert, onClose }) {
  const c = certificate || cert;
  if (!c) return null;

  const isChallenge = c.type === 'challenge' || (!c.eventId && !!c.challengeId);
  const issueDateFormatted = new Date(c.issueDate || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const pdfUrl = c.certificateId ? BookClubAPI.certificates.getPdfUrl(c.certificateId) : '#';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay show" id="globalModalOverlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-box modal-certificate-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', width: '92%' }}>
        <div className="modal-head">
          <h3 style={{ margin: 0 }}>
            {isChallenge ? 'Official Reading Challenge Certificate' : 'Official Event Certificate'}
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">&times;</button>
        </div>

        <div className="modal-body" style={{ padding: '24px 20px', background: '#0F1712' }}>
          <div
            id="printCertificateArea"
            style={{
              background: '#FFFDF9',
              color: '#1C2B22',
              padding: '40px 36px',
              border: '6px double #C5A059',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              position: 'relative',
              fontFamily: 'Georgia, serif'
            }}
          >
            {/* Header Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '2px', color: '#1E3A2E' }}>
                  BOOK FORGE
                </span>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#7A4E2D' }}>
                  The Reader's Guild · Verified Credential
                </div>
              </div>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #C5A059 0%, #8A6D3B 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '1.5rem',
                  border: '2px dashed #FFFDF9',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                ★
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '4px', color: '#C5A059', fontWeight: 700, marginBottom: '6px' }}>
              Certificate of Completion
            </div>
            <h2 style={{ fontSize: '2rem', margin: '0 0 16px 0', color: '#16291F', fontStyle: 'italic', textDecoration: 'none' }}>
              {isChallenge ? 'Challenge Achievement' : 'Event Participation'}
            </h2>

            <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#5B4E42' }}>This official credential certifies that</p>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#A44A3F', borderBottom: '1px solid #E7DCC8', display: 'inline-block', padding: '0 30px 4px', margin: '8px 0 16px 0' }}>
              {c.participantName || 'Fellow Reader'}
            </div>

            <p style={{ maxWidth: '580px', margin: '0 auto 20px auto', fontSize: '0.95rem', lineHeight: 1.6, color: '#2E251C' }}>
              {c.certificateStatement || c.statement || `has actively participated in and successfully completed all verified literary tasks for`}
            </p>

            <div style={{ background: 'rgba(197, 160, 89, 0.1)', padding: '12px 24px', borderRadius: '6px', display: 'inline-block', marginBottom: '24px', border: '1px solid rgba(197, 160, 89, 0.3)' }}>
              <strong style={{ fontSize: '1.25rem', color: '#1E3A2E' }}>
                {c.challengeTitle || c.eventName || 'Literary Event'}
              </strong>
            </div>

            {/* Footer with Signatures & ID */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed #C5A059', fontSize: '0.82rem' }}>
              <div style={{ textAlign: 'left' }}>
                <div>Organizer: <strong>{c.organizerName || 'Guild Moderator'}</strong></div>
                <div>Issue Date: <strong>{issueDateFormatted}</strong></div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'cursive', fontSize: '1.3rem', color: '#7A4E2D', borderBottom: '1px solid #2E251C', paddingBottom: '2px', marginBottom: '2px' }}>
                  Elena Ramos
                </div>
                <div style={{ fontSize: '0.7rem', color: '#5B4E42', textTransform: 'uppercase' }}>Guild Master Signature</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#5B4E42' }}>Certificate ID</div>
                <code style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E3A2E', background: '#F2EAD9', padding: '2px 6px', borderRadius: '4px' }}>
                  {c.certificateId}
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
            Tamper-proof verifiable ID: <code>{c.certificateId}</code>
          </div>
          <div className="flex gap-8">
            <button type="button" className="btn btn-outline btn-sm" onClick={handlePrint}>
              🖨️ Print
            </button>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={`Certificate-${c.certificateId}.pdf`}
              className="btn btn-primary btn-sm"
            >
              📥 Download PDF
            </a>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              ✕ Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
