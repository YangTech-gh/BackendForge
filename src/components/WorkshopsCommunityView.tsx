import React, { useState } from 'react';
import { 
  Video, 
  MessageSquare, 
  PhoneCall,
  Zap
} from 'lucide-react';
import { PRICING } from '../constants/pricing';
import { WorkshopEvent, UserState } from '../types';
import { invokeEdgeFunction } from '../lib/api';
import { useToast } from '../context/ToastContext';

interface WorkshopsCommunityViewProps {
  userState: UserState;
  workshops: WorkshopEvent[];
  onOpenUpgradeModal: () => void;
}

export const WorkshopsCommunityView: React.FC<WorkshopsCommunityViewProps> = ({
  userState,
  workshops,
  onOpenUpgradeModal,
}) => {
  const [rsvpedEvents, setRsvpedEvents] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ws_rsvps') || '[]');
    } catch { return []; }
  });
  const [bookingCall, setBookingCall] = useState<boolean>(false);
  const { showToast } = useToast();

  const handleToggleRsvp = (id: string) => {
    setRsvpedEvents(prev => {
      const next = prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id];
      localStorage.setItem('ws_rsvps', JSON.stringify(next));
      return next;
    });
  };

  const handleBookCoaching = async () => {
    try {
      setBookingCall(true);
      await invokeEdgeFunction('book-coaching-session', {
        method: 'POST',
        body: { sessionDate: new Date().toISOString() },
      });
      showToast('Coaching session booked! Check your email for details.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to book coaching session';
      showToast(message, 'error');
    } finally {
      setBookingCall(false);
    }
  };

  return (
    <div className="space-y-8 pb-16" role="main" aria-label="Workshops and Community">
      {/* Hidden SEO content block */}
      <div className="seo-hidden" aria-hidden="true">
        <h2>Backend Engineering Workshops and Community</h2>
        <p>
          Join monthly live system design workshops, book 1-on-1 architecture coaching calls with
          senior staff engineers, and connect with the Backend Forge community on Discord.
          Learn distributed systems patterns, RFC writing, and technical leadership skills
          through interactive mentorship and peer collaboration.
        </p>
      </div>
      
      {/* Header */}
      <header className="border-b border-zinc-800/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>LIVE SYSTEMS & COMMUNITY</span>
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            System Design Workshops & Mentorship
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Connect with senior backend engineers, attend monthly live "System Design & Ship" workshops, and book 1-on-1 technical coaching calls.
          </p>
        </div>
      </header>

      {/* 1-on-1 Coaching Banner (Pro Tier Feature) */}
      <section className="liquid-glass-red rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden" aria-labelledby="coaching-heading">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-mono font-bold border border-red-500/30">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>PRO LIFETIME PERK: 1-ON-1 COACHING</span>
          </div>
          <h2 id="coaching-heading" className="text-xl font-bold text-white">
            Book a 30-Minute Architecture & Career Review with a Staff Engineer
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            Get personalized code reviews on your system RFCs, database locking strategies, or career advice on leveling up to Senior/Staff roles.
          </p>
        </div>

        <div className="shrink-0 relative z-10">
          {userState.tier === 'pro' ? (
            <button
              onClick={handleBookCoaching}
              disabled={bookingCall}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl text-xs transition font-mono shadow-lg shadow-emerald-600/30 disabled:opacity-50"
            >
              {bookingCall ? 'Booking...' : `Book 1-on-1 Coaching Call (${userState.coachingCallsRemaining} remaining)`}
            </button>
          ) : (
            <button
              onClick={onOpenUpgradeModal}
              className="bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-xl text-xs transition font-mono shadow-lg shadow-red-950/50 flex items-center space-x-1.5 border border-red-500/30"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Unlock Coaching with Pro ({PRICING.PRO_LIFETIME_PRICE_DISPLAY})</span>
            </button>
          )}
        </div>
      </section>

      {/* Upcoming Workshops Grid */}
      <section className="space-y-4" aria-labelledby="workshops-heading">
        <h2 id="workshops-heading" className="text-xl font-bold text-white flex items-center space-x-2">
          <Video className="w-5 h-5 text-red-400" aria-hidden="true" />
          <span>Monthly Live "System Design & Ship" Workshops</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" role="list">
          {workshops.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-zinc-500" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-300 mb-2">No upcoming workshops</h3>
              <p className="text-zinc-500 text-sm max-w-md">Stay tuned for new system design workshops and mentorship sessions.</p>
            </div>
          )}
          {workshops.map((ws) => {
            const isRsvped = rsvpedEvents.includes(ws.id);

            return (
              <article
                key={ws.id}
                role="listitem"
                className="liquid-glass border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between hover:border-zinc-700 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-zinc-950 text-red-400 border border-zinc-800 font-bold">
                      {ws.date}
                    </span>
                    {ws.isLive && (
                      <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                        <span>NEXT LIVE</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-white">{ws.title}</h3>

                  <div className="text-xs text-zinc-400 space-y-1 font-sans">
                    <div><strong>Speaker:</strong> {ws.speaker} ({ws.speakerRole})</div>
                    <div><strong>Topic:</strong> {ws.topic}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {ws.attendeesCount + (isRsvped ? 1 : 0)} Engineers RSVPed
                  </span>

                  <button
                    onClick={() => handleToggleRsvp(ws.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                      isRsvped
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white shadow-md shadow-red-950/30'
                    }`}
                  >
                    {isRsvped ? '✓ RSVPed' : 'Reserve Spot'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Private Discord Channel Callout */}
      <section className="liquid-glass border border-zinc-800/80 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden" aria-labelledby="discord-heading">
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 id="discord-heading" className="font-bold text-base text-white">Private High-Signal Discord Community</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl font-sans">
              Strictly no low-effort spam. Access channels dedicated to #system-architecture-reviews, #rfc-feedback, #job-referrals, and #rails-vs-node-vs-rust-debates.
            </p>
          </div>
        </div>

        <a
          href="https://discord.gg/backendforge"
          target="_blank"
          rel="noreferrer"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl text-xs transition font-mono shadow-md shrink-0 relative z-10"
        >
          Join Discord Community
        </a>
      </section>

    </div>
  );
};
