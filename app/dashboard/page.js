"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './dashboard.css';

const agendaItems = [
  { title: 'Check-in & Setup', detail: '08:30 AM - 09:00 AM' },
  { title: 'Opening Ceremony', detail: '09:00 AM - 09:30 AM' },
  { title: 'Hacking Starts', detail: '09:30 AM' },
  { title: 'Mentor Rounds', detail: '12:00 PM - 01:00 PM' },
  { title: 'Lunch Break', detail: '01:00 PM - 02:00 PM' },
  { title: 'Evaluation 1', detail: '04:00 PM - 05:00 PM' },
  { title: 'Evaluation 2', detail: '10:00 PM - 11:00 PM' },
  { title: 'Final Evaluation', detail: 'Next Day, 08:30 AM' },
];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authToken, setAuthToken] = useState(null);
  const [team, setTeam] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [announcementsError, setAnnouncementsError] = useState('');
  const [profileOpen, setProfileOpen] = useState(true);

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
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

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

    return () => controller.abort();
  }, [authToken, router]);

  useEffect(() => {
    if (!authToken) return;

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
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
    const targetDate = new Date('2026-01-30T09:00:00+05:30').getTime();

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(targetDate - now, 0);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown([
        { label: 'Days', value: String(days).padStart(2, '0') },
        { label: 'Hours', value: String(hours).padStart(2, '0') },
        { label: 'Minutes', value: String(minutes).padStart(2, '0') },
        { label: 'Seconds', value: String(seconds).padStart(2, '0') },
      ]);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

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
              {(team?.members || ['Member 1', 'Member 2', 'Member 3']).map((member, idx) => (
                <li key={idx}>{member?.name || member?.email || member}</li>
              ))}
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
                Academic Block – Room No: <strong id="roomNumber">{team?.venue?.roomNumber || 'LH 4402'}</strong>
              </p>
              <p className="venue-floor">{team?.venue?.floor || '4th Floor'}</p>
            </div>
          </div>
        </aside>

        <main className="main-panel">
          <section className="glass timer-section">
            <h2 id="timerTitle">EVALUATION TIMER</h2>
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
          </section>

          <section className="glass qr-section">
            <h3>QR CHECK-IN</h3>
            <div className="qr-placeholder">
              <img
                src={team?.qrCode?.image || '/images/dummy-qr.jpg'}
                alt="Team QR Code"
                width={180}
                height={180}
              />
              <small>(Placeholder – backend camera integration later)</small>
            </div>
          </section>

          <section className="glass agenda-section">
            <h3 className="agenda-title">
              {announcements.length > 0 ? 'Announcements' : 'Agenda for 24-hour Hackathon'}
            </h3>
            <div className="agenda-list" id="agendaList">
              {announcements.length > 0
                ? announcements.map((item) => (
                    <div className="agenda-item" key={item.id}>
                      <div className="agenda-left">
                        {item.title || 'Announcement'}
                        <span>{item.body || ''}</span>
                      </div>
                      <div className="agenda-right">{item.priority ? '⚠️' : 'ℹ️'}</div>
                    </div>
                  ))
                : agendaItems.map((item, idx) => (
                    <div className="agenda-item" key={idx}>
                      <div className="agenda-left">{item.title}</div>
                      <div className="agenda-right">{item.detail}</div>
                    </div>
                  ))}
            </div>
            {announcementsError && (
              <p style={{ marginTop: '12px', opacity: 0.8 }}>{announcementsError}</p>
            )}
          </section>

          <section className="glass chat-section">
            <h3>💬 SUPPORT CHAT</h3>
            <div className="chat-window">
              <div className="chat-message system">👋 Welcome! Ask your queries here.</div>
            </div>
            <div className="chat-input">
              <input type="text" placeholder="Type your message..." />
              <button>Send</button>
            </div>
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