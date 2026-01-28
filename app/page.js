"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const cyclingTexts = ["Think \uD83D\uDCA1", "Innovate \uD83D\uDE80", "Code \uD83E\uDDB1"];

const tracks = [
  {
    title: 'AI in Agriculture & Food',
    description:
      'Build AI models for crop health monitoring, precision farming, yield prediction, or smart irrigation to ensure sustainable agriculture and reduce food loss.',
  },
  {
    title: 'AI in Cybersecurity & Digital Trust',
    description:
      'Design AI-powered systems for anomaly detection, fraud prevention, phishing defense, and data integrity to strengthen digital ecosystems.',
  },
  {
    title: 'AI for Space & Remote Sensing',
    description:
      'Use satellite data, remote sensing, and AI vision systems for climate observation, resource mapping, and space exploration insights.',
  },
  {
    title: 'AI in Smart Governance & Public Policy',
    description:
      'Create intelligent solutions for e-governance, citizen engagement, and automated policy evaluation through NLP and data-driven analytics.',
  },
  {
    title: 'AI in Quality Control for Construction Equipment Manufacturing',
    description:
      'Develop AI systems for defect detection, dimensional verification, and predictive maintenance in industrial manufacturing.',
  },
  {
    title: 'AI for Assistive & Human-Centric Technology',
    description:
      'Build AI systems for accessibility, speech-to-text tools, sign language recognition, emotional AI, or assistive robotics enhancing inclusion.',
  },
];

const faqs = [
  { question: 'Can we participate as a team?', answer: 'Yes, a team can have 3-4 members.' },
  { question: 'Who can participate?', answer: 'Any student pursuing UG in Engineering is eligible to apply.' },
  { question: 'Is this an online hackathon?', answer: 'No, only the PPT shortlisting will be done online. The finals will be held offline.' },
  { question: 'Are Inter College teams allowed?', answer: 'Yes, Inter College teams are allowed and encouraged.' },
  { question: 'How long is this Hackathon?', answer: 'AI-WARS is a 24-hour hackathon, live on January 30th, 2026.' },
  { question: 'Where will be the finals conducted?', answer: 'The finals will be conducted offline at SRM Easwari Engineering College, Chennai on January 30th, 2026.' },
  { question: 'Will accommodation be provided?', answer: 'No, accommodation will not be provided. Food and refreshments will be provided for participants for a minimal fee.' },
];

export default function HomePage() {
  const [typeText, setTypeText] = useState(`${cyclingTexts[0]}|`);
  const [activeFaq, setActiveFaq] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTrack, setActiveTrack] = useState(null);
  const lenisRef = useRef(null);
  const typeTimeout = useRef();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.hero-logo', { y: 80, opacity: 0, duration: 1.2, delay: 0.2 });
    gsap.from('.hero-subtitle', { y: 40, opacity: 0, delay: 0.5 });

    const sections = gsap.utils.toArray('.section');
    sections.forEach((section) => {
      gsap.from(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        immediateRender: false
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, normalizeWheel: true });
    lenisRef.current = lenis;

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    let current = 0;
    let charIndex = 0;
    let deleting = false;

    const type = () => {
      const fullText = cyclingTexts[current];
      if (deleting) {
        charIndex -= 1;
        setTypeText(`${fullText.substring(0, Math.max(charIndex, 0))}|`);
        if (charIndex < 0) {
          deleting = false;
          current = (current + 1) % cyclingTexts.length;
          typeTimeout.current = setTimeout(type, 500);
          return;
        }
        typeTimeout.current = setTimeout(type, 50);
      } else {
        charIndex += 1;
        setTypeText(`${fullText.substring(0, charIndex)}|`);
        if (charIndex > fullText.length) {
          deleting = true;
          typeTimeout.current = setTimeout(type, 2000);
          return;
        }
        typeTimeout.current = setTimeout(type, 150);
      }
    };

    type();
    return () => clearTimeout(typeTimeout.current);
  }, []);

  useEffect(() => {
    const hero = document.querySelector('#home');
    if (!hero) return;

    const updateBackground = () => {
      const threshold = hero.offsetHeight - 1;
      if (window.scrollY > threshold) {
        document.body.classList.add('show-bg2');
      } else {
        document.body.classList.remove('show-bg2');
      }
    };

    updateBackground();
    window.addEventListener('scroll', updateBackground, { passive: true });
    window.addEventListener('resize', updateBackground);

    return () => {
      window.removeEventListener('scroll', updateBackground);
      window.removeEventListener('resize', updateBackground);
      document.body.classList.remove('show-bg2');
    };
  }, []);

  const scrollToId = (target) => {
    const element = document.querySelector(target);
    if (element) {
      lenisRef.current?.scrollTo(element, { offset: 0 });
    }
    setMenuOpen(false);
  };

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  return (
    <main>
      <nav className="navbar">
        <button
          className="nav-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
        <ul className="nav-links">
          {[
            { id: '#home', label: 'Home' },
            { id: '#about', label: 'About' },
            { id: '#tracks', label: 'Hackathon Tracks' },
            { id: '#faq', label: 'FAQ' },
            { id: '#register', label: 'Register Now' },
          ].map((link) => (
            <li key={link.id}>
              <a
                href={link.id}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId(link.id);
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          {[
            { id: '#home', label: 'Home' },
            { id: '#about', label: 'About' },
            { id: '#tracks', label: 'Hackathon Tracks' },
            { id: '#faq', label: 'FAQ' },
            { id: '#register', label: 'Register Now' },
          ].map((link) => (
            <a
              key={link.id}
              href={link.id}
              onClick={(e) => {
                e.preventDefault();
                scrollToId(link.id);
              }}
            >
              {link.label}
            </a>
          ))}
          <a href="/login" className="nav-login-link">
            Login
          </a>
        </div>
      </nav>

      <section className="hero" id="home">
        <video autoPlay muted loop playsInline className="bg-video">
          <source src="/assets/bg.mp4" type="video/mp4" />
        </video>

        <div className="logo-top-left">
          <Image src="/images/ACE.png" alt="ACE" width={170} height={160} priority />
        </div>
        <div className="logo-top-middle">
          <Image src="/images/EASWARI-PONGAL.png" alt="EASWARI-PONGAL" width={230} height={80} priority />
        </div>
        <div className="logo-top-right">
          <Image src="/images/CSILO.png" alt="CSILO" width={170} height={170} priority />
        </div>
        <div className="logo-top-aiwars">
          <Image src="/images/AI-WARS-LOGO.png" alt="AI WARS" width={360} height={140} priority />
        </div>
        <div className="sponsor-bottom-right">
          <Image src="/images/image2.png" alt="Sponsor" width={320} height={250} priority />
        </div>

        <Link href="/login" className="login-button">
          Login
        </Link>

        <div id="cycling-text" className="title cycling-text-position">
          {typeText}
        </div>

        <div className="info-section">
          <div className="details">
            <h3>30–31, January 2026</h3>
            <p>Easwari Engineering College</p>
          </div>

          <div className="stats">
            <div className="stat-card">
              <div className="stat-value pink">3</div>
              <div className="stat-label">Max Team Size</div>
            </div>
            <div className="stat-card">
              <div className="stat-value blue">24</div>
              <div className="stat-label">Hours</div>
            </div>
            <div className="stat-card">
              <div className="stat-value green">₹15K</div>
              <div className="stat-label">Prize Pool</div>
            </div>
          </div>
        </div>

        <div className="hero-content">
          <h3 className="hero-subtitle">The Ultimate Arena for AI Innovation</h3>
          <a
            href="#register"
            onClick={(e) => {
              e.preventDefault();
              scrollToId('#register');
            }}
          >
            <button>Register Now</button>
          </a>
        </div>
      </section>

      <video autoPlay muted loop playsInline className="bg-video-secondary">
        <source src="/assets/bg2.mp4" type="video/mp4" />
      </video>

      <section className="section" id="about">
        <div className="glass-section">
          <p className="title-accent" style={{ fontSize: '4.5rem', fontWeight: 200 }}>
            ABOUT THE EVENT
          </p>
          <p>
            AI WARS is a 24-hour hackathon on 30–31 January 2026 at Easwari Engineering College, challenging
            innovators to build AI-powered solutions for real-world problems.
          </p>
          <p>
            Compete in teams of up to 3, showcase your skills, and win from a ₹10K prize pool. The event is part of
            the AI Impact Summit, fostering collaboration and creativity in the AI space.
          </p>
          <p>
            Whether you are a student, developer, or AI enthusiast — this is your arena to code, create, and impact the
            future.
          </p>
          <p className="ccc" style={{ fontSize: '3rem' }}>
            🚀 Code. Create. Conquer.
          </p>
        </div>
      </section>

      <section className="section timeline" id="tracks">
        <div className="glass-section">
          <h2 style={{ fontSize: '4.5rem', fontWeight: 200 }}>Proposed Tracks/Domains</h2>
          <ul>
            {tracks.map((track) => (
              <li key={track.title}>
                <div
                  className={`track-card ${activeTrack === track.title ? 'is-flipped' : ''}`}
                  onClick={() =>
                    setActiveTrack((prev) => (prev === track.title ? null : track.title))
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveTrack((prev) => (prev === track.title ? null : track.title));
                    }
                  }}
                >
                  <div className="front" style={{ fontFamily: 'Array, sans-serif', fontWeight: 100 }}>
                    {track.title}
                  </div>
                  <div className="back">{track.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" className="faq-accordion">
        <div className="glass-section">
          <h2 className="faq-title">FAQs</h2>
          {faqs.map((faq, index) => {
            const isActive = activeFaq === index;
            return (
              <div key={faq.question} className={`faq-item ${isActive ? 'active' : ''}`}>
                <div className="faq-header" onClick={() => setActiveFaq(isActive ? -1 : index)}>
                  <span style={{ fontFamily: 'Array, sans-serif', fontWeight: 100 }}>{faq.question}</span>
                  <span className="faq-arrow">▼</span>
                </div>
                <div className="faq-body">
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="cta" id="register">
        <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>Ready to Build?</h2>
        <a href="https://forms.gle/re7RkMB8rMN3mBg3A" target="_blank" rel="noopener noreferrer">
          <button>Join Now</button>
        </a>
      </section>
    </main>
  );
}
