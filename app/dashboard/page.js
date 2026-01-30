"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './dashboard.css';

const fallbackAgendaItems = [
  { title: 'Check-in & Setup', detail: '—' },
  { title: 'Evaluation Rounds', detail: 'Will appear here once the event starts' },
];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authToken, setAuthToken] = useState(null);
  const [team, setTeam] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [agenda, setAgenda] = useState(null);
  const [agendaError, setAgendaError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [announcementsError, setAnnouncementsError] = useState('');
  const [profileOpen, setProfileOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatError, setChatError] = useState('');

  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [readyLoading, setReadyLoading] = useState(false);

  const [countdown, setCountdown] = useState([
    { label: 'Days', value: '00' },
    { label: 'Hours', value: '00' },
    { label: 'Minutes', value: '00' },
    { label: 'Seconds', value: '00' },
  ]);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    if (urlToken) {
      setAuthToken(urlToken);
      localStorage.setItem('authToken', urlToken);

      // Drop the token from the URL
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.delete('token');
      const cleanQuery = params.toString();
      const cleanPath = cleanQuery ? `/dashboard?${cleanQuery}` : '/dashboard';
      router.replace(cleanPath);
      return;
    }

    if (storedToken) {
      setAuthToken(storedToken);
      return;
    }

    router.replace('/login');
  }, [router, searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth <= 900) {
      setProfileOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!authToken) return;

    const controller = new AbortController();
    const API_BASE = '/backend';

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE}/api/team/me`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch profile: ${res.status}`);
        }

        const data = await res.json();
        setTeam(data);
      } catch (err) {
        console.error(err);
        setError('Session expired or invalid. Please login again.');
        localStorage.removeItem('authToken');
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    const intervalId = setInterval(fetchProfile, 15000);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [authToken, router]);

  useEffect(() => {
    if (!authToken) return;

    const API_BASE = '/backend';
    let cancelled = false;

    const fetchAgenda = async () => {
      try {
        setAgendaError('');
        const res = await fetch(`${API_BASE}/api/agenda`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch agenda: ${res.status}`);
        }

        const data = await res.json();
        if (cancelled) return;
        setAgenda(data);
        const live = data?.live_evaluation;
        if (live && typeof live.remaining_seconds === 'number') {
          setRemainingSeconds(live.remaining_seconds);
        } else {
          setRemainingSeconds(null);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setAgendaError('Unable to load agenda right now.');
        }
      }
    };

    fetchAgenda();
    const intervalId = setInterval(fetchAgenda, 12000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [authToken]);

  useEffect(() => {
    if (!authToken) return;

    const API_BASE = '/backend';
    let cancelled = false;

    const fetchChat = async () => {
      try {
        setChatError('');
        const res = await fetch(`${API_BASE}/api/team/chat`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch chat: ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) {
          setChatMessages(data.messages || []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setChatError('Unable to load chat right now.');
        }
      }
    };

    fetchChat();
    const intervalId = setInterval(fetchChat, 7000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [authToken]);

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || !authToken) return;

    const API_BASE = '/backend';
    setChatInput('');

    try {
      setChatError('');
      const res = await fetch(`${API_BASE}/api/team/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        throw new Error(`Failed to send message: ${res.status}`);
      }

      const data = await res.json();
      const msg = data.message;
      if (msg) {
        setChatMessages((prev) => [...prev, msg]);
      }
    } catch (err) {
      console.error(err);
      setChatError('Failed to send message. Try again.');
      // restore message so user doesn't lose it
      setChatInput(text);
    }
  };

  useEffect(() => {
    if (!authToken) return;

    const API_BASE = '/backend';
    let cancelled = false;

    const fetchAnnouncements = async () => {
      try {
        setAnnouncementsError('');
        const res = await fetch(`${API_BASE}/api/announcements`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch announcements: ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) {
          setAnnouncements(data.announcements || []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setAnnouncementsError('Unable to load announcements right now.');
        }
      }
    };

    fetchAnnouncements();
    const intervalId = setInterval(fetchAnnouncements, 30000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [authToken]);

  useEffect(() => {
    const id = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (typeof prev !== 'number') return prev;
        return Math.max(prev - 1, 0);
      });
    }, 1000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const total = typeof remainingSeconds === 'number' ? Math.max(remainingSeconds, 0) : 0;
    const days = Math.floor(total / (60 * 60 * 24));
    const hours = Math.floor((total / (60 * 60)) % 24);
    const minutes = Math.floor((total / 60) % 60);
    const seconds = Math.floor(total % 60);

    setCountdown([
      { label: 'Days', value: String(days).padStart(2, '0') },
      { label: 'Hours', value: String(hours).padStart(2, '0') },
      { label: 'Minutes', value: String(minutes).padStart(2, '0') },
      { label: 'Seconds', value: String(seconds).padStart(2, '0') },
    ]);
  }, [remainingSeconds]);

  const liveEvaluation = agenda?.live_evaluation || null;
  const readyVisible = !!liveEvaluation;
  const teamState = team?.teamState;
  const readyDisabled = readyLoading || teamState !== 'eval_pending';

  const readyLabel = useMemo(() => {
    if (!liveEvaluation) return 'Ready for Evaluation';
    if (teamState === 'ready_for_eval') return 'Ready (already submitted)';
    if (teamState && teamState !== 'eval_pending') return 'Not eligible yet';
    return 'Ready for Evaluation';
  }, [liveEvaluation, teamState]);

  const markReady = async () => {
    if (!authToken || !liveEvaluation?.id) return;
    try {
      setReadyLoading(true);
      const API_BASE = '/backend';
      const res = await fetch(`${API_BASE}/api/team/evaluations/${liveEvaluation.id}/ready`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to mark ready: ${res.status}`);
      }

      // Refresh team + agenda state (single source of truth)
      const teamRes = await fetch(`${API_BASE}/api/team/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (teamRes.ok) {
        const nextTeam = await teamRes.json();
        setTeam(nextTeam);
      }

      const agendaRes = await fetch(`${API_BASE}/api/agenda`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (agendaRes.ok) {
        const nextAgenda = await agendaRes.json();
        setAgenda(nextAgenda);
        const live = nextAgenda?.live_evaluation;
        if (live && typeof live.remaining_seconds === 'number') {
          setRemainingSeconds(live.remaining_seconds);
        }
      }
    } catch (err) {
      console.error(err);
      // keep it simple: show a toast-ish inline error
      setAnnouncementsError('Unable to mark ready right now. Please retry.');
    } finally {
      setReadyLoading(false);
    }
  };

  const agendaTimeline = useMemo(() => {
    const items = agenda?.evaluations;
    if (Array.isArray(items) && items.length) return items;
    return null;
  }, [agenda]);

  return (
    <main>
      <video autoPlay muted loop playsInline className="bg-video">
        <source src="/assets/bg3.mp4" type="video/mp4" />
      </video>

      <header className="dashboard-header">
        <h1>🧑‍💻 DASHBOARD 🚀</h1>
      </header>

      {loading && (
        <div className="glass" style={{ position: 'fixed', top: 24, right: 24, padding: '12px 16px', zIndex: 10 }}>
          Syncing your team data...
        </div>
      )}

      {error && (
        <div className="glass" style={{ position: 'fixed', top: 24, right: 24, padding: '12px 16px', zIndex: 10, color: '#ffb4b4' }}>
          {error}
        </div>
      )}

      <div className="dashboard-container">
        <div
          className={`profile-overlay ${profileOpen ? 'open' : ''}`}
          onClick={() => setProfileOpen(false)}
        />
        <button
          className="profile-toggle"
          onClick={() => setProfileOpen((p) => !p)}
          aria-label="Toggle profile panel"
        >
          ☰
        </button>

        <aside className={`profile-panel glass ${profileOpen ? '' : 'hidden'}`}>
          <h2 className="panel-title">TEAM PROFILE</h2>

          <div className="profile-item">
            <span>Team ID</span>
            <p id="teamId">{team?.teamId || '—'}</p>
          </div>

          <div className="profile-item">
            <span>Team Name</span>
            <p id="teamName">{team?.teamName || '—'}</p>
          </div>

          <div className="profile-item">
            <span>Team Members</span>
            <ul id="teamMembers">
              {team?.members?.length ? (
                team.members.map((member, idx) => (
                  <li key={idx}>{member?.name || member?.email || '—'}</li>
                ))
              ) : (
                <li className="muted">—</li>
              )}
            </ul>
          </div>

          <div className="profile-item">
            <span>College</span>
            <p id="teamCollege">{team?.college || '—'}</p>
          </div>

          <div className="profile-item">
            <span>Problem Statement</span>
            <p id="problemStatement">{team?.problemStatement || '—'}</p>
          </div>

          <div className="profile-item">
            <span>Preferred Track</span>
            <p id="preferredTrack">{team?.preferredTrack || '—'}</p>
          </div>

          <div className="profile-item">
            <span>Payment Status</span>
            <p id="paymentStatus">{team?.payment?.status || '—'}</p>
          </div>

          <div className="profile-item venue-allocation">
            <h3 className="venue-title">VENUE ALLOCATION</h3>
            <div className="venue-box">
              <span className="venue-subtitle">Hall Details</span>
              <p className="venue-room">
                {(team?.venue?.block || team?.venue?.building || team?.venue?.venueName) ? (
                  <>
                    {(team?.venue?.venueName || team?.venue?.building || team?.venue?.block)} – Room/Table: <strong id="roomNumber">{team?.venue?.roomNumber || '—'}</strong>
                  </>
                ) : (
                  <>
                    Room/Table: <strong id="roomNumber">{team?.venue?.roomNumber || '—'}</strong>
                  </>
                )}
              </p>
              <p className="venue-floor">{team?.venue?.floor || '—'}</p>
            </div>
          </div>
        </aside>

        <main className="main-panel">
          <section className="glass timer-section">
            <h2 id="timerTitle">{liveEvaluation ? `CURRENT ROUND: ${liveEvaluation.name || 'Evaluation'}` : 'NO LIVE EVALUATION'}</h2>
            <div className="countdown">
              {countdown.map((c) => (
                <div key={c.label} className="time-box">
                  <span>{c.value}</span>
                  <label>{c.label}</label>
                </div>
              ))}
            </div>
            <div className="evaluation-buttons">
              <button className={`eval-btn ${team?.evaluation?.eval1 ? 'active' : 'locked'}`} id="eval1">Evaluation 1</button>
              <button className={`eval-btn ${team?.evaluation?.eval2 ? 'active' : 'locked'}`} id="eval2">Evaluation 2</button>
              <button className={`eval-btn ${team?.evaluation?.final ? 'active' : 'locked'}`} id="eval3">Final Evaluation</button>
            </div>

            {readyVisible ? (
              <div style={{ marginTop: 14, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="eval-btn active" onClick={markReady} disabled={readyDisabled} style={{ opacity: readyDisabled ? 0.55 : 1 }}>
                  {readyLoading ? 'Submitting…' : readyLabel}
                </button>
                <small style={{ opacity: 0.85 }}>
                  {teamState === 'eval_pending'
                    ? 'Tap Ready when your team is called.'
                    : teamState === 'ready_for_eval'
                      ? 'Ready submitted for this round.'
                      : 'Complete check-in/payment to become eligible.'}
                </small>
              </div>
            ) : (
              <small style={{ opacity: 0.8, marginTop: 10, display: 'block' }}>No live round right now. This will update automatically.</small>
            )}
          </section>

          <section className="glass qr-section">
            <h3>QR CHECK-IN</h3>
            <div className="qr-placeholder">
              {team?.qrCode?.image ? (
                <>
                  <img
                    src={team.qrCode.image}
                    alt="Team QR Code"
                    width={180}
                    height={180}
                  />
                  <small>Show this QR at the check-in desk.</small>
                </>
              ) : (
                <small>QR not available yet.</small>
              )}
            </div>
          </section>

          <section className="glass agenda-section">
            <h3 className="agenda-title">Announcements</h3>
            <div className="agenda-list" id="agendaList">
              {announcements.length > 0 ? (
                announcements.map((item) => (
                  <div className="agenda-item" key={item.id}>
                    <div className="agenda-left">
                      {item.title || 'Announcement'}
                      <span>{item.body || ''}</span>
                    </div>
                    <div className="agenda-right">{item.priority ? '⚠️' : 'ℹ️'}</div>
                  </div>
                ))
              ) : (
                <div className="agenda-item">
                  <div className="agenda-left">
                    <span className="muted">No announcements yet.</span>
                  </div>
                  <div className="agenda-right">ℹ️</div>
                </div>
              )}
            </div>
            {announcementsError && (
              <p style={{ marginTop: '12px', opacity: 0.8 }}>{announcementsError}</p>
            )}

            <div style={{ marginTop: 18 }}>
              <h3 className="agenda-title">Agenda</h3>
              <div className="agenda-list">
                {agendaTimeline ? (
                  agendaTimeline.map((item) => {
                    const right = item.status === 'live' ? 'LIVE' : item.status;
                    const isLive = item.status === 'live';
                    const icon = item.status === 'completed' ? '✅' : isLive ? '🟢' : '⏳';
                    return (
                      <div className="agenda-item" key={item.id || item.order} style={{ opacity: item.status === 'pending' ? 0.75 : 1 }}>
                        <div className="agenda-left">
                          {item.name || `Round ${item.order}`}
                          <span>{isLive ? 'Happening now' : item.status === 'completed' ? 'Completed' : 'Upcoming'}</span>
                        </div>
                        <div className="agenda-right">{icon} {right}</div>
                      </div>
                    );
                  })
                ) : (
                  fallbackAgendaItems.map((item, idx) => (
                    <div className="agenda-item" key={idx}>
                      <div className="agenda-left">{item.title}</div>
                      <div className="agenda-right">{item.detail}</div>
                    </div>
                  ))
                )}
              </div>
              {agendaError ? <p style={{ marginTop: 12, opacity: 0.8 }}>{agendaError}</p> : null}
            </div>
          </section>

          <section className="glass chat-section">
            <h3>💬 SUPPORT CHAT</h3>
            <div className="chat-window">
              <div className="chat-message system">👋 Welcome! Ask your queries here.</div>
              {chatMessages.map((m) => {
                const role = m.sender_role || m.senderRole;
                const cls = role === 'team' ? 'user' : 'admin';
                return (
                  <div key={m.id || `${m.created_at}-${m.message}`} className={`chat-message ${cls}`}>
                    {m.message}
                  </div>
                );
              })}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendChat();
                }}
              />
              <button onClick={sendChat}>Send</button>
            </div>
            {chatError ? (
              <p style={{ marginTop: 10, opacity: 0.8, color: '#ffb4b4' }}>{chatError}</p>
            ) : null}
          </section>
        </main>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}