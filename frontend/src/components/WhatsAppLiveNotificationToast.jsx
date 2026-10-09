import React, { useState, useEffect } from 'react';

// Subtle Web Audio notification chime
const playChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
};

export default function WhatsAppLiveNotificationToast() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handleAlert = (e) => {
      if (e.detail) {
        setNotification(e.detail);
        playChime();
      }
    };

    window.addEventListener('bookforge_host_whatsapp_alert', handleAlert);
    return () => window.removeEventListener('bookforge_host_whatsapp_alert', handleAlert);
  }, []);

  if (!notification) return null;

  const handleOpenWhatsApp = () => {
    const cleanPhone = String(notification.phone || '').replace(/[^0-9]/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(notification.text || '')}`
      : `https://wa.me/?text=${encodeURIComponent(notification.text || '')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 10000,
        maxWidth: '420px',
        width: '92%',
        background: '#0F1E17',
        color: '#FFFFFF',
        borderRadius: '14px',
        border: '1.5px solid #25D366',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45), 0 0 20px rgba(37, 211, 102, 0.25)',
        overflow: 'hidden',
        animation: 'slideInRight 0.35s ease-out'
      }}
    >
      {/* Top Banner: WhatsApp Business Verified */}
      <div
        style={{
          background: 'linear-gradient(90deg, #128C7E 0%, #25D366 100%)',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#FFFFFF'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{notification.isGroupBroadcast ? '📢' : '💬'}</span>
          <span>
            {notification.isGroupBroadcast
              ? `WhatsApp Multi-Member Broadcast (${notification.memberCount || 'All'} Members)`
              : 'WhatsApp Business · Verified Host Alert'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setNotification(null)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}
        >
          ✕
        </button>
      </div>

      {/* Body Content */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#25D366',
              color: '#0F1E17',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem'
            }}
          >
            {notification.isGroupBroadcast ? '👥' : '👤'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
              {notification.hostName || 'Group Host'} (Host · {notification.groupName})
            </div>
            <div style={{ fontSize: '0.72rem', color: '#A3B8AC' }}>
              {notification.isGroupBroadcast
                ? `Automated message dispatched to ${notification.memberCount || 'all'} circle members · Delivered ✓✓`
                : `Dispatched automatically to +${notification.phone} · Just now ✓✓`}
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '0.82rem',
            lineHeight: 1.45,
            marginBottom: '12px'
          }}
        >
          <div style={{ color: '#FCD34D', fontWeight: 700, marginBottom: '4px' }}>
            {notification.isGroupBroadcast ? '🎁 Automated Group Gathering & Offer Alert' : '🎁 Special Event Offer & Tracking Alert'}
          </div>
          <div style={{ color: '#E2E8F0', marginBottom: '4px' }}>
            {notification.offer || '+150 Bonus XP & Verified Attendance Badge unlocked!'}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
            Tracking ID: <code>{notification.trackingCode}</code>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => setNotification(null)}
            style={{ color: '#A3B8AC', fontSize: '0.78rem' }}
          >
            Dismiss
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleOpenWhatsApp}
            style={{
              background: '#25D366',
              color: '#0F1E17',
              fontWeight: 700,
              border: 'none',
              padding: '6px 14px',
              fontSize: '0.82rem',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>💬 Open on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
