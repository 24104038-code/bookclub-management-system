import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';
import { useAuth } from '../context/AuthContext';

export default function DiscussionDetails() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const discId = Number(paramId || searchParams.get('id') || 1);
  const outletCtx = useOutletContext() || {};
  const { user } = useAuth();

  const [disc, setDisc] = useState(null);
  const [revealSpoiler, setRevealSpoiler] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySpoiler, setReplySpoiler] = useState(false);
  const [parentReplyId, setParentReplyId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadDisc = () => {
    const d = BookClubStore.getDiscussionById(discId) || BookClubStore.getDiscussions()[0];
    setDisc(d);
  };

  useEffect(() => {
    loadDisc();
  }, [discId]);

  if (!disc) {
    return (
      <div>
        <Topbar title="Discussion Thread" subtitle="Loading salon thread..." />
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3>Thread Not Found</h3>
          <Link to="/discussions" className="btn btn-primary btn-sm">Return to Discussions</Link>
        </div>
      </div>
    );
  }

  const handleLike = () => {
    BookClubStore.toggleLikeDiscussion(disc.id);
    loadDisc();
    showToast('Updated discussion vote!');
  };

  const handlePostReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    BookClubStore.addDiscussionReply(disc.id, {
      author: user?.name || 'Jordan Rivera',
      username: user?.username || 'jordanreads',
      content: replyText,
      hasSpoiler: replySpoiler,
      parentId: parentReplyId
    });
    setReplyText('');
    setParentReplyId(null);
    loadDisc();
    showToast('Reply posted to conversation!');
  };

  const replies = disc.replies || [
    {
      id: 1,
      author: 'Colin Reyes',
      username: 'colin_author',
      timeAgo: '1 hour ago',
      content: 'Fascinating observation! The atmospheric pacing was specifically designed to reflect winter stillness.',
      likes: 6
    },
    {
      id: 2,
      author: 'Aditi Krishnan',
      username: 'aditi_reads',
      timeAgo: '45 mins ago',
      content: 'I agree completely with the symbol of the ledger book — it anchors the entire mystery.',
      likes: 4
    }
  ];

  return (
    <div>
      <Topbar
        title={disc.title}
        subtitle={`Category: ${disc.category} · Started by ${disc.author}`}
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/discussions" className="btn btn-outline btn-sm">← Back to Discussions</Link>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* ORIGINAL POST CARD */}
      <div className="card panel mb-30" style={{ padding: '24px' }}>
        <div className="flex-between mb-0" style={{ marginBottom: '8px' }}>
          <span className="discussion-book-tag" style={{ background: 'var(--cream-deep)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
            {disc.category}
          </span>
          <span className="text-soft" style={{ fontSize: '0.85rem' }}>{disc.timeAgo || 'Recently'}</span>
        </div>

        <h1 style={{ margin: '12px 0 8px 0', fontSize: '1.8rem' }}>{disc.title}</h1>

        <div className="author-line" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--clay)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
            {disc.author?.slice(0, 2).toUpperCase() || 'JR'}
          </span>
          <div>
            <strong>{disc.author}</strong>
            <span className="text-soft" style={{ fontSize: '0.82rem', marginLeft: '6px' }}>@{disc.username || 'reader'}</span>
          </div>
        </div>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '20px' }}>
          {disc.content}
        </p>

        {/* SPOILER CONTAINER */}
        {disc.hasSpoiler && (
          <div className="spoiler-box" style={{ padding: '14px', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '6px', marginBottom: '16px' }}>
            <div className="flex-between">
              <strong style={{ color: '#92400E' }}>⚠️ Plot Spoiler Warning:</strong>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setRevealSpoiler(!revealSpoiler)}
              >
                {revealSpoiler ? 'Hide Spoiler' : 'Reveal Spoiler'}
              </button>
            </div>
            {revealSpoiler ? (
              <div style={{ marginTop: '8px', color: '#78350F', fontSize: '0.9rem' }}>
                {disc.spoilerText || 'Major climax revelations discussed in this thread.'}
              </div>
            ) : (
              <div style={{ marginTop: '8px', filter: 'blur(4px)', userSelect: 'none', color: '#92400E' }}>
                This section contains spoiler elements that could reveal major twists.
              </div>
            )}
          </div>
        )}

        <div className="flex-between" style={{ borderTop: '1px solid var(--line)', paddingTop: '14px', marginTop: '16px' }}>
          <div className="flex gap-12" style={{ alignItems: 'center' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleLike}>
              {disc.isLiked ? '❤️' : '🤍'} {disc.likes || 0} Likes
            </button>
            <span className="text-soft">💬 {replies.length} Replies</span>
          </div>
          <a href="#replyBoxAnchor" className="btn btn-outline btn-sm">Reply to Thread ↓</a>
        </div>
      </div>

      {/* COMMENTS SECTION */}
      <div className="flex-between mb-30">
        <h2 style={{ margin: 0 }}>Community Replies ({replies.length})</h2>
      </div>

      <div style={{ marginBottom: '40px' }}>
        {replies.map((r) => (
          <div key={r.id} className="card" style={{ padding: '18px 22px', marginBottom: '14px' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green-shelf)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                  {r.author.slice(0, 2).toUpperCase()}
                </span>
                <strong>{r.author}</strong>
                <span className="text-soft" style={{ fontSize: '0.8rem' }}>@{r.username}</span>
              </div>
              <span className="text-soft" style={{ fontSize: '0.78rem' }}>{r.timeAgo}</span>
            </div>

            <p style={{ margin: '8px 0', fontSize: '0.92rem', lineHeight: 1.5 }}>{r.content}</p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => {
                  setParentReplyId(r.id);
                  const el = document.getElementById('replyBoxAnchor');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                ↩ Reply to this comment
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* REPLY FORM */}
      <div className="card panel" id="replyBoxAnchor" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 14px 0' }}>Leave a Reply</h3>
        <form onSubmit={handlePostReply}>
          {parentReplyId && (
            <div style={{ background: 'var(--cream-deep)', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.85rem' }} className="flex-between">
              <span>Replying to comment #{parentReplyId}...</span>
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => setParentReplyId(null)}>Cancel</button>
            </div>
          )}
          <div className="field">
            <textarea
              rows="4"
              placeholder="Join the discussion... Be respectful and constructive."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="flex-between">
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="replySpoilerCheck"
                checked={replySpoiler}
                onChange={(e) => setReplySpoiler(e.target.checked)}
              />
              <label htmlFor="replySpoilerCheck">Mark reply as spoiler</label>
            </div>
            <button type="submit" className="btn btn-primary">Post Reply</button>
          </div>
        </form>
      </div>
    </div>
  );
}
