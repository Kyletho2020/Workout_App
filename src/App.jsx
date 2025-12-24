import React, { useState } from 'react';
import {
  Dumbbell,
  Activity,
  Target,
  Calendar,
  RefreshCw,
  Share2,
  Gift,
  Settings,
  ChevronRight,
  Plus,
  X,
  Check,
  MoreHorizontal,
  ArrowLeftRight,
  Bookmark,
  Repeat
} from 'lucide-react';
import './App.css';

const BodyFigure = ({ view = 'back' }) => {
  if (view === 'front') {
    return (
      <svg viewBox="0 0 240 420" className="body-figure">
        <g fill="#4e5166">
          <circle cx="120" cy="40" r="26" />
          <rect x="96" y="66" width="48" height="60" rx="20" />
          <rect x="70" y="120" width="100" height="90" rx="30" />
          <rect x="86" y="210" width="68" height="70" rx="28" />
          <rect x="60" y="260" width="50" height="120" rx="20" />
          <rect x="130" y="260" width="50" height="120" rx="20" />
        </g>
        <g fill="#7a7f9a">
          <rect x="40" y="110" width="38" height="110" rx="18" />
          <rect x="162" y="110" width="38" height="110" rx="18" />
          <rect x="70" y="310" width="36" height="90" rx="16" />
          <rect x="134" y="310" width="36" height="90" rx="16" />
        </g>
        <g fill="#c26b86">
          <ellipse cx="62" cy="120" rx="24" ry="30" />
          <ellipse cx="178" cy="120" rx="24" ry="30" />
          <rect x="78" y="118" width="84" height="46" rx="20" />
          <rect x="84" y="260" width="30" height="90" rx="14" />
          <rect x="126" y="260" width="30" height="90" rx="14" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 240 420" className="body-figure">
      <g fill="#4e5166">
        <circle cx="120" cy="40" r="26" />
        <rect x="96" y="66" width="48" height="60" rx="20" />
        <rect x="70" y="120" width="100" height="90" rx="30" />
        <rect x="86" y="210" width="68" height="70" rx="28" />
        <rect x="60" y="260" width="50" height="120" rx="20" />
        <rect x="130" y="260" width="50" height="120" rx="20" />
      </g>
      <g fill="#7a7f9a">
        <rect x="40" y="120" width="38" height="120" rx="18" />
        <rect x="162" y="120" width="38" height="120" rx="18" />
        <rect x="70" y="310" width="36" height="90" rx="16" />
        <rect x="134" y="310" width="36" height="90" rx="16" />
      </g>
      <g fill="#c26b86">
        <ellipse cx="80" cy="128" rx="28" ry="32" />
        <ellipse cx="160" cy="128" rx="28" ry="32" />
        <rect x="82" y="152" width="76" height="70" rx="30" />
        <rect x="88" y="258" width="30" height="90" rx="14" />
        <rect x="122" y="258" width="30" height="90" rx="14" />
      </g>
    </svg>
  );
};

const HexProgress = ({ percent }) => {
  const points = [
    { x: 100, y: 12 },
    { x: 174, y: 52 },
    { x: 174, y: 138 },
    { x: 100, y: 178 },
    { x: 26, y: 138 },
    { x: 26, y: 52 }
  ];

  const edges = [
    { from: 0, to: 1, color: '#f5e47c' },
    { from: 1, to: 2, color: '#695f4a' },
    { from: 2, to: 3, color: '#ff2f5e' },
    { from: 3, to: 4, color: '#7c2c3f' },
    { from: 4, to: 5, color: '#9bf7dc' },
    { from: 5, to: 0, color: '#4b5b58' }
  ];

  return (
    <svg viewBox="0 0 200 200" className="hex-progress">
      {edges.map((edge, index) => (
        <line
          key={edge.color}
          x1={points[edge.from].x}
          y1={points[edge.from].y}
          x2={points[edge.to].x}
          y2={points[edge.to].y}
          stroke={edge.color}
          strokeWidth="10"
          strokeLinecap="round"
        />
      ))}
      <text x="100" y="115" textAnchor="middle" className="hex-text">
        {percent}%
      </text>
    </svg>
  );
};

export default function WorkoutTracker() {
  const [activeTab, setActiveTab] = useState('body');
  const [bodyView, setBodyView] = useState('back');
  const [swapOpen, setSwapOpen] = useState(false);
  const [pickMusclesOpen, setPickMusclesOpen] = useState(false);

  const weeklyTargets = [
    {
      name: 'Push Muscles',
      current: 9.5,
      total: 27,
      color: 'target-push',
      remaining: '17.5'
    },
    {
      name: 'Pull Muscles',
      current: 10.5,
      total: 15,
      color: 'target-pull',
      remaining: '4.5'
    },
    {
      name: 'Leg Muscles',
      current: 17.5,
      total: 21,
      color: 'target-leg',
      remaining: '3.5'
    }
  ];

  return (
    <div className="app">
      <div className="screen">
        {activeTab === 'body' && (
          <section className="tab-body">
            <div className="segmented-control">
              <button type="button" className="segment">Results</button>
              <button type="button" className="segment active">Recovery</button>
            </div>

            <div className="body-stats">
              <div>
                <p className="body-stat-value">1</p>
                <p className="body-stat-label">Day since your last workout</p>
              </div>
              <div>
                <p className="body-stat-value">3</p>
                <p className="body-stat-label">Fresh muscle groups</p>
              </div>
            </div>

            <div className="body-figure-card">
              <BodyFigure view={bodyView} />
              <button
                type="button"
                className="flip-button"
                onClick={() => setBodyView(bodyView === 'back' ? 'front' : 'back')}
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </section>
        )}

        {activeTab === 'targets' && (
          <section className="tab-targets">
            <div className="targets-header">
              <h1>Weekly Set Targets</h1>
              <p>Dec 21 – Dec 27</p>
            </div>

            <div className="targets-hero">
              <HexProgress percent={59} />
            </div>

            <div className="targets-list">
              {weeklyTargets.map((target) => (
                <div key={target.name} className="target-card">
                  <div className={`target-icon ${target.color}`}>
                    <div className="target-icon-hex" />
                  </div>
                  <div className="target-info">
                    <p>{target.name}</p>
                    <span>{target.current} / {target.total} Sets</span>
                  </div>
                  <div className="target-meta">
                    <strong>{target.remaining}</strong>
                    <span>to go</span>
                  </div>
                  <ChevronRight size={20} className="target-arrow" />
                </div>
              ))}
            </div>

            <div className="targets-history">
              <h2>History</h2>
              <div className="history-row">
                {[
                  { percent: 0, label: 'Nov 29' },
                  { percent: 0, label: 'Dec 6' },
                  { percent: 80, label: 'Dec 13' },
                  { percent: 46, label: 'Dec 20' }
                ].map((item) => (
                  <div key={item.label} className="history-card">
                    <div className="history-hex">
                      <HexProgress percent={item.percent} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'log' && (
          <section className="tab-log">
            <header className="log-header">
              <Share2 size={20} />
              <h1>kyle.tho@icloud.com</h1>
              <div className="log-actions">
                <Gift size={20} />
                <Settings size={20} />
              </div>
            </header>

            <div className="log-stats">
              <div>
                <p className="stat-label">Workouts</p>
                <p className="stat-value">6</p>
              </div>
              <div>
                <p className="stat-label">Milestones</p>
                <div className="milestones">
                  <span className="milestone">🏆</span>
                  <span className="milestone">💪</span>
                  <span className="milestone">🔥</span>
                </div>
              </div>
              <div>
                <p className="stat-label">Weekly Goal</p>
                <p className="stat-value">2/4 days</p>
              </div>
              <div>
                <p className="stat-label">Current Streak</p>
                <p className="stat-value">0 weeks</p>
              </div>
            </div>

            <div className="report-card">
              <div>
                <h2>Your Weekly Workout Report is ready!</h2>
                <p>See your week over week progress and updated muscle strength & volume!</p>
                <button type="button">View Your Report</button>
              </div>
              <div className="report-icon">
                <Calendar size={28} />
              </div>
              <button type="button" className="close-report">
                <X size={16} />
              </button>
            </div>

            <div className="calendar-section">
              <div className="calendar-header">
                <h3>Calendar</h3>
                <div className="calendar-month">
                  <span>Dec</span>
                  <ChevronRight size={16} />
                </div>
              </div>
              <div className="calendar-grid">
                {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((day) => (
                  <span key={day} className="calendar-day">{day}</span>
                ))}
                {['21', '22', '23', '24', '25', '26', '27'].map((date, index) => (
                  <div key={date} className="calendar-date">
                    <span>{date}</span>
                    {(index === 1 || index === 2) && (
                      <small>{index === 1 ? '19m' : '22m'}</small>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="past-workouts">
              <div className="past-header">
                <h3>Past Workouts</h3>
                <Plus size={20} />
              </div>
              <button type="button" className="start-workout">Start Workout</button>
            </div>
          </section>
        )}

        {activeTab === 'workout' && (
          <section className="tab-workout">
            <div className="gym-row">
              <div className="gym-badge">YG</div>
              <div className="gym-title">
                <p>Your Gym</p>
                <ChevronRight size={18} />
              </div>
            </div>

            <div className="workout-card">
              <div className="workout-header">
                <div>
                  <h1>Full Body Day</h1>
                  <p>6 Exercises</p>
                </div>
                <div className="workout-actions">
                  <button type="button" className="swap-button" onClick={() => setSwapOpen(true)}>
                    <ArrowLeftRight size={16} />
                    Swap
                  </button>
                  <MoreHorizontal size={20} />
                </div>
              </div>

              <div className="chip-row">
                {['45m', 'Equipment', 'Advanced', '+ Warm-'].map((chip) => (
                  <span key={chip} className="chip">
                    {chip}
                    <ChevronRight size={12} />
                  </span>
                ))}
              </div>

              <div className="target-muscles">
                <h2>Target Muscles</h2>
                <div className="target-row">
                  {[
                    { name: 'Hamstrings', percent: '70%' },
                    { name: 'Triceps', percent: '100%' }
                  ].map((muscle) => (
                    <div key={muscle.name} className="target-muscle-card">
                      <div className="muscle-thumbnail" />
                      <div>
                        <p>{muscle.name}</p>
                        <span>{muscle.percent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bottom-sheet" aria-hidden={!swapOpen}>
              <div className={`sheet ${swapOpen ? 'show' : ''}`}>
                <div className="sheet-header">
                  <h3>Swap Workout</h3>
                  <button type="button" onClick={() => setSwapOpen(false)}>
                    <X size={18} />
                  </button>
                </div>
                <p className="sheet-subtitle">Within Training Split</p>
                {['Full Body Day 1', 'Full Body Day 2', 'Full Body Day 3', 'Full Body Day 4'].map((name, index) => (
                  <div key={name} className={`sheet-row ${index === 2 ? 'active' : ''}`}>
                    <div className="sheet-thumb" />
                    <span>{name}</span>
                    {index === 2 ? <Check size={20} /> : <span className="radio" />}
                  </div>
                ))}

                <p className="sheet-subtitle">New Workout</p>
                <div className="sheet-grid">
                  <button type="button" className="sheet-card" onClick={() => setPickMusclesOpen(true)}>
                    <Activity size={24} />
                    Pick Muscles
                  </button>
                  <button type="button" className="sheet-card">
                    <Bookmark size={24} />
                    Saved Workouts
                  </button>
                  <button type="button" className="sheet-card">
                    <Repeat size={24} />
                    Create Workout From Scratch
                  </button>
                  <button type="button" className="sheet-card">
                    <Dumbbell size={24} />
                    On Demand Workouts
                  </button>
                </div>
              </div>
            </div>

            <div className={`bottom-sheet ${pickMusclesOpen ? 'open' : ''}`} aria-hidden={!pickMusclesOpen}>
              <div className={`sheet ${pickMusclesOpen ? 'show' : ''}`}>
                <div className="sheet-header">
                  <h3>Pick Muscles</h3>
                  <button type="button" onClick={() => setPickMusclesOpen(false)}>
                    <X size={18} />
                  </button>
                </div>
                <p className="sheet-subtitle">Muscle Splits</p>
                {['Recovered muscles', 'Push muscles', 'Pull muscles', 'Upper body', 'Lower body', 'Full body'].map((name, index) => (
                  <div key={name} className={`sheet-row ${index === 5 ? 'active' : ''}`}>
                    <span>{name}</span>
                    {index === 5 ? <Check size={20} /> : <span className="radio" />}
                  </div>
                ))}
                <p className="sheet-subtitle">Specific Muscles</p>
                <div className="sheet-row">
                  <span>Select muscle groups...</span>
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <nav className="bottom-nav">
        {[
          { id: 'workout', label: 'Workout', icon: Dumbbell },
          { id: 'body', label: 'Body', icon: Activity },
          { id: 'targets', label: 'Targets', icon: Target },
          { id: 'log', label: 'Log', icon: Calendar }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={22} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
