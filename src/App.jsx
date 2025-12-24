import React, { useState, useEffect } from 'react';
import { Dumbbell, Target, Calendar, User, Plus, ChevronRight, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// ChatGPT API Configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

function App() {
  const [currentTab, setCurrentTab] = useState('workout');
  const [workouts, setWorkouts] = useState([]);
  const [muscleRecovery, setMuscleRecovery] = useState({});
  const [weeklyTargets, setWeeklyTargets] = useState({
    pushMuscles: { current: 0, target: 27, name: 'Push Muscles' },
    pullMuscles: { current: 0, target: 15, name: 'Pull Muscles' },
    legMuscles: { current: 0, target: 21, name: 'Leg Muscles' }
  });
  const [showWorkoutGenerator, setShowWorkoutGenerator] = useState(false);
  const [generatingWorkout, setGeneratingWorkout] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedWorkouts = localStorage.getItem('workouts');
    const savedRecovery = localStorage.getItem('muscleRecovery');
    const savedTargets = localStorage.getItem('weeklyTargets');

    if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts));
    if (savedRecovery) setMuscleRecovery(JSON.parse(savedRecovery));
    if (savedTargets) setWeeklyTargets(JSON.parse(savedTargets));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('muscleRecovery', JSON.stringify(muscleRecovery));
  }, [muscleRecovery]);

  useEffect(() => {
    localStorage.setItem('weeklyTargets', JSON.stringify(weeklyTargets));
  }, [weeklyTargets]);

  // Calculate days since last workout for each muscle group
  const updateMuscleRecovery = () => {
    const recovery = {};
    const muscleGroups = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 
                          'abs', 'obliques', 'lowerback', 'quads', 'hamstrings', 'calves'];

    muscleGroups.forEach(muscle => {
      const lastWorkout = workouts
        .filter(w => w.muscles.includes(muscle))
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

      if (lastWorkout) {
        const daysSince = Math.floor((Date.now() - new Date(lastWorkout.date)) / (1000 * 60 * 60 * 24));
        recovery[muscle] = daysSince;
      } else {
        recovery[muscle] = 7; // Default if never worked out
      }
    });

    setMuscleRecovery(recovery);
  };

  useEffect(() => {
    if (workouts.length > 0) {
      updateMuscleRecovery();
    }
  }, [workouts]);

  // Calculate fresh muscle groups (recovered 3+ days)
  const getFreshMuscleCount = () => {
    return Object.values(muscleRecovery).filter(days => days >= 3).length;
  };

  // Generate AI workout
  const generateAIWorkout = async (prompt) => {
    setGeneratingWorkout(true);

    try {
      const freshMuscles = Object.entries(muscleRecovery)
        .filter(([_, days]) => days >= 3)
        .map(([muscle, _]) => muscle);

      const systemPrompt = `You are a professional fitness trainer. Generate a workout based on the user's request.
Fresh/recovered muscles (3+ days rest): ${freshMuscles.join(', ')}
Current weekly targets: Push ${weeklyTargets.pushMuscles.current}/${weeklyTargets.pushMuscles.target}, Pull ${weeklyTargets.pullMuscles.current}/${weeklyTargets.pullMuscles.target}, Legs ${weeklyTargets.legMuscles.current}/${weeklyTargets.legMuscles.target}

Return ONLY a JSON object with this structure:
{
  "name": "Workout Name",
  "duration": 45,
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "reps": "10-12",
      "weight": 0,
      "muscles": ["chest", "triceps"]
    }
  ],
  "muscles": ["chest", "triceps", "shoulders"],
  "category": "Push Day"
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${OPENAI_API_KEY}\`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const workoutData = JSON.parse(data.choices[0].message.content);

      // Add workout to history
      const newWorkout = {
        ...workoutData,
        id: Date.now(),
        date: new Date().toISOString(),
        completed: false
      };

      setWorkouts([newWorkout, ...workouts]);
      setShowWorkoutGenerator(false);
      setCurrentTab('workout');

    } catch (error) {
      console.error('Error generating workout:', error);
      alert('Failed to generate workout. Please check your API key.');
    } finally {
      setGeneratingWorkout(false);
    }
  };

  return (
    <div className="app">
      <WorkoutTab 
        workouts={workouts}
        setWorkouts={setWorkouts}
        muscleRecovery={muscleRecovery}
        onGenerateWorkout={() => setShowWorkoutGenerator(true)}
        active={currentTab === 'workout'}
      />

      <BodyTab 
        muscleRecovery={muscleRecovery}
        freshMuscleCount={getFreshMuscleCount()}
        active={currentTab === 'body'}
      />

      <TargetsTab 
        weeklyTargets={weeklyTargets}
        workouts={workouts}
        active={currentTab === 'targets'}
      />

      <LogTab 
        workouts={workouts}
        active={currentTab === 'log'}
      />

      {/* AI Workout Generator Modal */}
      <AnimatePresence>
        {showWorkoutGenerator && (
          <AIWorkoutGenerator
            onGenerate={generateAIWorkout}
            onClose={() => setShowWorkoutGenerator(false)}
            generating={generatingWorkout}
            freshMuscles={Object.entries(muscleRecovery)
              .filter(([_, days]) => days >= 3)
              .map(([muscle, _]) => muscle)}
          />
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={\`nav-item \${currentTab === 'workout' ? 'active' : ''}\`}
          onClick={() => setCurrentTab('workout')}
        >
          <Dumbbell size={24} />
          <span>Workout</span>
        </button>
        <button 
          className={\`nav-item \${currentTab === 'body' ? 'active' : ''}\`}
          onClick={() => setCurrentTab('body')}
        >
          <User size={24} />
          <span>Body</span>
        </button>
        <button 
          className={\`nav-item \${currentTab === 'targets' ? 'active' : ''}\`}
          onClick={() => setCurrentTab('targets')}
        >
          <Target size={24} />
          <span>Targets</span>
        </button>
        <button 
          className={\`nav-item \${currentTab === 'log' ? 'active' : ''}\`}
          onClick={() => setCurrentTab('log')}
        >
          <Calendar size={24} />
          <span>Log</span>
        </button>
      </nav>
    </div>
  );
}

// Workout Tab Component
function WorkoutTab({ workouts, setWorkouts, muscleRecovery, onGenerateWorkout, active }) {
  const todayWorkout = workouts.find(w => {
    const workoutDate = new Date(w.date).toDateString();
    const today = new Date().toDateString();
    return workoutDate === today;
  });

  if (!active) return null;

  return (
    <div className="tab-content">
      <header className="header">
        <h1>Today's Workout</h1>
        <div className="header-badge">
          <span className="badge-emoji">💪</span>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
      </header>

      {todayWorkout ? (
        <WorkoutCard workout={todayWorkout} />
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🏋️</div>
          <h2>No Workout Scheduled</h2>
          <p>Generate an AI-powered workout based on your recovery</p>
          <button className="btn-primary" onClick={onGenerateWorkout}>
            <Plus size={20} />
            Generate Workout
          </button>
        </div>
      )}

      <button className="fab" onClick={onGenerateWorkout}>
        <Plus size={28} />
      </button>
    </div>
  );
}

// Workout Card Component
function WorkoutCard({ workout }) {
  return (
    <motion.div 
      className="workout-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="workout-header">
        <div>
          <h2>{workout.name}</h2>
          <p className="workout-meta">{workout.duration} min • {workout.exercises.length} exercises</p>
        </div>
        <div className="workout-badge">{workout.category}</div>
      </div>

      <div className="exercises-list">
        {workout.exercises.map((exercise, index) => (
          <div key={index} className="exercise-item">
            <div className="exercise-info">
              <span className="exercise-name">{exercise.name}</span>
              <span className="exercise-details">
                {exercise.sets} sets × {exercise.reps} reps
                {exercise.weight > 0 && \` • \${exercise.weight} lb\`}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-start-workout">
        <Check size={20} />
        Start Workout
      </button>
    </motion.div>
  );
}

// AI Workout Generator Modal
function AIWorkoutGenerator({ onGenerate, onClose, generating, freshMuscles }) {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const workoutTypes = [
    { id: 'push', name: 'Push Day', emoji: '💪', prompt: 'Generate a push day workout focusing on chest, shoulders, and triceps' },
    { id: 'pull', name: 'Pull Day', emoji: '🔙', prompt: 'Generate a pull day workout focusing on back and biceps' },
    { id: 'legs', name: 'Leg Day', emoji: '🦵', prompt: 'Generate a leg day workout focusing on quads, hamstrings, and calves' },
    { id: 'upper', name: 'Upper Body', emoji: '💪', prompt: 'Generate an upper body workout' },
    { id: 'full', name: 'Full Body', emoji: '🏋️', prompt: 'Generate a full body workout' },
    { id: 'custom', name: 'Custom', emoji: '✨', prompt: '' }
  ];

  const handleQuickSelect = (type) => {
    setSelectedType(type.id);
    if (type.id !== 'custom') {
      onGenerate(type.prompt);
    }
  };

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="modal-content"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Generate Workout</h2>
          <button onClick={onClose} className="btn-close">
            <X size={24} />
          </button>
        </div>

        <div className="fresh-muscles-indicator">
          <span className="indicator-label">Fresh Muscles Ready:</span>
          <span className="indicator-value">{freshMuscles.length}/12</span>
        </div>

        <div className="workout-type-grid">
          {workoutTypes.map(type => (
            <button
              key={type.id}
              className={\`workout-type-btn \${selectedType === type.id ? 'selected' : ''}\`}
              onClick={() => handleQuickSelect(type)}
              disabled={generating}
            >
              <span className="workout-type-emoji">{type.emoji}</span>
              <span className="workout-type-name">{type.name}</span>
            </button>
          ))}
        </div>

        {selectedType === 'custom' && (
          <div className="custom-prompt">
            <textarea
              placeholder="Describe your ideal workout... (e.g., 'Upper body with focus on arms')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
            <button 
              className="btn-primary"
              onClick={() => onGenerate(prompt)}
              disabled={generating || !prompt.trim()}
            >
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        )}

        {generating && (
          <div className="generating-indicator">
            <div className="spinner"></div>
            <p>Creating your perfect workout...</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Body Tab Component
function BodyTab({ muscleRecovery, freshMuscleCount, active }) {
  if (!active) return null;

  const muscleGroups = [
    { name: 'Chest', key: 'chest', color: '#ff2d55' },
    { name: 'Back', key: 'back', color: '#ff2d55' },
    { name: 'Shoulders', key: 'shoulders', color: '#ff9500' },
    { name: 'Biceps', key: 'biceps', color: '#ff2d55' },
    { name: 'Triceps', key: 'triceps', color: '#ff2d55' },
    { name: 'Forearms', key: 'forearms', color: '#ffd60a' },
    { name: 'Abs', key: 'abs', color: '#30d158' },
    { name: 'Obliques', key: 'obliques', color: '#30d158' },
    { name: 'Lower Back', key: 'lowerback', color: '#64d2ff' },
    { name: 'Quads', key: 'quads', color: '#0a84ff' },
    { name: 'Hamstrings', key: 'hamstrings', color: '#0a84ff' },
    { name: 'Calves', key: 'calves', color: '#5e5ce6' }
  ];

  const daysSinceLastWorkout = workouts.length > 0 
    ? Math.floor((Date.now() - new Date(workouts[0].date)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="tab-content">
      <header className="header">
        <h1>Recovery</h1>
      </header>

      <div className="recovery-summary">
        <div className="recovery-stat">
          <div className="stat-value">{daysSinceLastWorkout}</div>
          <div className="stat-label">Days Since Last Workout</div>
        </div>
        <div className="recovery-stat">
          <div className="stat-value">{freshMuscleCount}</div>
          <div className="stat-label">Fresh Muscle Groups</div>
        </div>
      </div>

      <div className="muscle-groups-list">
        {muscleGroups.map(muscle => {
          const days = muscleRecovery[muscle.key] || 0;
          const isFresh = days >= 3;

          return (
            <div key={muscle.key} className="muscle-group-item">
              <div className="muscle-info">
                <span className="muscle-name">{muscle.name}</span>
                <span className={\`muscle-status \${isFresh ? 'fresh' : 'recovering'}\`}>
                  {isFresh ? '✓ Fresh' : \`\${days}d recovery\`}
                </span>
              </div>
              <div className="muscle-bar">
                <div 
                  className="muscle-bar-fill"
                  style={{ 
                    width: \`\${Math.min(days / 3 * 100, 100)}%\`,
                    backgroundColor: isFresh ? '#30d158' : muscle.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Targets Tab Component
function TargetsTab({ weeklyTargets, workouts, active }) {
  if (!active) return null;

  const calculateProgress = () => {
    const total = Object.values(weeklyTargets).reduce((sum, t) => sum + t.target, 0);
    const current = Object.values(weeklyTargets).reduce((sum, t) => sum + t.current, 0);
    return Math.round((current / total) * 100);
  };

  return (
    <div className="tab-content">
      <header className="header">
        <h1>Weekly Targets</h1>
      </header>

      <div className="progress-hexagon">
        <svg viewBox="0 0 100 100" className="hexagon-svg">
          <polygon
            points="50 1 93 25 93 75 50 99 7 75 7 25"
            className="hexagon-bg"
          />
          <text x="50" y="55" textAnchor="middle" className="progress-text">
            {calculateProgress()}%
          </text>
        </svg>
      </div>

      <div className="targets-list">
        {Object.entries(weeklyTargets).map(([key, target]) => (
          <div key={key} className="target-item">
            <div className="target-info">
              <span className="target-name">{target.name}</span>
              <span className="target-progress">
                {target.current} / {target.target} Sets
              </span>
            </div>
            <div className="target-bar">
              <div 
                className="target-bar-fill"
                style={{ width: \`\${Math.min((target.current / target.target) * 100, 100)}%\` }}
              />
            </div>
            <span className="target-remaining">
              {Math.max(target.target - target.current, 0)} to go
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Log Tab Component
function LogTab({ workouts, active }) {
  if (!active) return null;

  return (
    <div className="tab-content">
      <header className="header">
        <h1>Workout Log</h1>
      </header>

      {workouts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>No Workouts Yet</h2>
          <p>Start tracking your fitness journey</p>
        </div>
      ) : (
        <div className="workouts-history">
          {workouts.map(workout => (
            <div key={workout.id} className="history-item">
              <div className="history-date">
                {new Date(workout.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="history-content">
                <h3>{workout.name}</h3>
                <div className="history-meta">
                  <span>{workout.exercises.length} exercises</span>
                  <span>{workout.duration} min</span>
                  <span>
                    {workout.exercises.reduce((sum, ex) => sum + (ex.sets * ex.weight || 0), 0)} lb volume
                  </span>
                </div>
              </div>
              <ChevronRight size={20} className="history-arrow" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
