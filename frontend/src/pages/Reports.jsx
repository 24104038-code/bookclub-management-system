import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';

export default function Reports() {
  const outletCtx = useOutletContext() || {};
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReport, setActiveReport] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadReports = () => {
    setReports(BookClubStore.getReports());
  };

  useEffect(() => {
    loadReports();
  }, []);

  const totalCount = reports.length;
  const pendingCount = reports.filter((r) => r.status === 'Pending').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;
  const dismissedCount = reports.filter((r) => r.status === 'Rejected' || r.status === 'Dismissed').length;

  let filtered = reports;
  if (statusFilter !== 'all') {
    filtered = filtered.filter((r) => r.status.toLowerCase() === statusFilter.toLowerCase());
  }

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (r) =>
        r.targetTitle?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q) ||
        r.reporter?.toLowerCase().includes(q) ||
        r.reportedUser?.toLowerCase().includes(q)
    );
  }

  const handleUpdateStatus = (id, newStatus) => {
    BookClubStore.updateReportStatus(id, newStatus, resolutionNote || `Moderator marked as ${newStatus}`);
    setActiveReport(null);
    setResolutionNote('');
    loadReports();
    showToast(`Report #${id} marked as ${newStatus}`);
  };

  return (
    <div>
      <Topbar
        title="Moderation Reports & Safety"
        subtitle="Review community flags, content violations, and uphold reader standards."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-4" style={{ marginBottom: '24px' }}>
        <div className="card stat-card">
          <div className="stat-title">Total Reports</div>
          <div className="stat-value tone-blue">{totalCount}</div>
          <div className="stat-delta">Platform safety logs</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">Pending Triage</div>
          <div className="stat-value" style={{ color: '#C0554A' }}>{pendingCount}</div>
          <div className="stat-delta">Requires moderator review</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">Resolved Cases</div>
          <div className="stat-value tone-green">{resolvedCount}</div>
          <div className="stat-delta up">Action taken</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">Dismissed / Rejected</div>
          <div className="stat-value tone-gold">{dismissedCount}</div>
          <div className="stat-delta">False alarms / Non-issues</div>
        </div>
      </div>

      {/* FILTER BAR & TABS */}
      <div className="tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', marginBottom: '20px' }}>
        {[
          { id: 'all', label: `All Reports (${totalCount})` },
          { id: 'Pending', label: `Pending Triage (${pendingCount})` },
          { id: 'Resolved', label: `Resolved (${resolvedCount})` },
          { id: 'Rejected', label: `Dismissed (${dismissedCount})` }
        ].map((tab) => (
          <span
            key={tab.id}
            className={`tab ${statusFilter === tab.id ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab.id)}
            style={{ cursor: 'pointer', padding: '10px 16px', fontWeight: statusFilter === tab.id ? 700 : 500 }}
          >
            {tab.label}
          </span>
        ))}
      </div>

      <div className="filter-bar">
        <div className="search-box" style={{ flex: 2 }}>
          <span>🔎</span>
          <input
            type="text"
            placeholder="Filter by target title, reason, reporter, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* REPORTS TABLE */}
      <div className="card panel mb-30">
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--line)' }}>
                <th style={{ padding: '12px' }}>Case #</th>
                <th style={{ padding: '12px' }}>Target Title & Snippet</th>
                <th style={{ padding: '12px' }}>Reason</th>
                <th style={{ padding: '12px' }}>Reported User</th>
                <th style={{ padding: '12px' }}>Reporter</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--ink-soft)' }}>
                    No reports match this status filter.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '12px', color: 'var(--ink-soft)' }}>#{r.id}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{r.targetTitle}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', fontStyle: 'italic', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        "{r.snippet || r.details || 'Content preview'}"
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="reason-badge" style={{ background: 'rgba(184, 91, 53, 0.12)', color: 'var(--clay)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {r.reason}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{r.reportedUser}</td>
                    <td style={{ padding: '12px', color: 'var(--ink-soft)' }}>{r.reporter}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${r.status === 'Resolved' ? 'badge-completed' : r.status === 'Pending' ? 'badge-active' : 'badge-member'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => setActiveReport(r)}
                      >
                        Triage Case ⚖️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Triage Modal */}
      {activeReport && (
        <div className="modal-overlay show" onClick={() => setActiveReport(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>Review Case #{activeReport.id}</h3>
              <button className="modal-close" onClick={() => setActiveReport(null)}>&times;</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ background: 'var(--cream-deep)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>Flagged Target:</div>
                <div style={{ fontWeight: 700, margin: '2px 0 6px 0' }}>{activeReport.targetTitle}</div>
                <div style={{ fontSize: '0.88rem', fontStyle: 'italic', color: 'var(--ink)' }}>"{activeReport.snippet || activeReport.details}"</div>
              </div>

              <div className="field-row">
                <div>
                  <span className="text-soft" style={{ fontSize: '0.8rem' }}>Reason:</span>
                  <div><strong>{activeReport.reason}</strong></div>
                </div>
                <div>
                  <span className="text-soft" style={{ fontSize: '0.8rem' }}>Reported Account:</span>
                  <div><strong>{activeReport.reportedUser}</strong></div>
                </div>
              </div>

              <div className="field" style={{ marginTop: '16px' }}>
                <label>Moderator Resolution Notes</label>
                <textarea
                  rows="3"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Explain actions taken (e.g. Warning issued, Content moderated, False flag dismissed)..."
                ></textarea>
              </div>

              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleUpdateStatus(activeReport.id, 'Rejected')}
                >
                  Dismiss / False Alarm
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleUpdateStatus(activeReport.id, 'Resolved')}
                >
                  Resolve & Take Action ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
