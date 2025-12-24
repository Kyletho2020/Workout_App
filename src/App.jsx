import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, User, Target, Calendar, TrendingUp, ChevronRight, 
  Plus, CheckCircle, Clock, Flame, Activity, BarChart, 
  Settings, X, RefreshCw, Loader
} from 'lucide-react';

// ======================
// CHATGPT API INTEGRATION
// ======================
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE'; // Replace with your key
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function generateWorkoutWithChatGPT(profile, muscleRecovery, recentWorkouts) {
  const prompt = `You are a professional strength coach. Generate a personalized workout based on:

USER PROFILE:
- Goal: ${profile.goal}
- Experience: ${profile.experience}
- Duration: ${profile.duration} minutes
- Equipment: ${profile.equipment.join(', ')}
- Training Split: ${profile.split}

MUSCLE RECOVERY STATE (freshness 0-100%, higher = fresher):
${Object.entries(muscleRecovery).map(([muscle, data]) => 
  `- ${muscle}: ${data.freshness}% fresh, ${data.daysSince} days since last trained, soreness ${data.soreness}/10`
).join('\n')}

RECENT WORKOUTS (avoid repeating exercises):
${recentWorkouts.map(w => w.name).join(', ')}

REQUIREMENTS:
1. Create 6 varied exercises prioritizing muscles with freshness > 70%
2. Apply progressive overload (increase reps/weight by 5-10% from recent workouts)
3. Balance compound & isolation movements
4. Match available equipment only
5. Return ONLY valid JSON, no markdown:

{
  "workout_name": "Descriptive Name",
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "reps": 10,
      "weight": "30 lb",
      "muscles": ["chest", "shoulders"],
      "notes": "Form cue"
    }
  ],
  "estimated_duration": 45,
  "focus_muscles": ["chest", "back"]
}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // or 'gpt-4' for better results
        messages: [
          { role: 'system', content: 'You are a professional strength coach. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let workoutText = data.choices[0].message.content;

    // Clean JSON response
    workoutText = workoutText.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    const workout = JSON.parse(workoutText);

    return workout;
  } catch (error) {
    console.error('ChatGPT API Error:', error);
    return getFallbackWorkout(profile);
  }
}

function getFallbackWorkout(profile) {
  const workouts = {
    'Beginner': {
      workout_name: 'Beginner Full Body',
      exercises: [
        { name: 'Goblet Squat', sets: 2, reps: 12, weight: '15 lb', muscles: ['legs'], notes: 'Focus on form' },
        { name: 'Push-ups', sets: 2, reps: 10, weight: 'bodyweight', muscles: ['chest'], notes: 'Knees down OK' },
        { name: 'Dumbbell Row', sets: 2, reps: 10, weight: '15 lb', muscles: ['back'], notes: 'Pull to hip' },
        { name: 'Shoulder Press', sets: 2, reps: 8, weight: '10 lb', muscles: ['shoulders'], notes: 'Controlled' },
        { name: 'Plank', sets: 2, reps: 30, weight: 'bodyweight', muscles: ['core'], notes: 'Hold steady' }
      ],
      estimated_duration: 30,
      focus_muscles: ['legs', 'chest', 'back']
    },
    'Intermediate': {
      workout_name: 'Full Body Strength',
      exercises: [
        { name: 'Dumbbell Romanian Deadlift', sets: 3, reps: 10, weight: '35 lb', muscles: ['hamstrings', 'back'], notes: 'Hip hinge' },
        { name: 'Dumbbell Bench Press', sets: 3, reps: 10, weight: '30 lb', muscles: ['chest'], notes: 'Control descent' },
        { name: 'Bulgarian Split Squat', sets: 3, reps: 10, weight: '25 lb', muscles: ['legs'], notes: 'Balance' },
        { name: 'Bent Over Row', sets: 3, reps: 10, weight: '30 lb', muscles: ['back'], notes: 'Squeeze' },
        { name: 'Overhead Press', sets: 3, reps: 8, weight: '25 lb', muscles: ['shoulders'], notes: 'Core tight' },
        { name: 'Hammer Curl', sets: 3, reps: 12, weight: '20 lb', muscles: ['arms'], notes: 'No swing' }
      ],
      estimated_duration: 45,
      focus_muscles: ['legs', 'chest', 'back']
    },
    'Advanced': {
      workout_name: 'Advanced Power',
      exercises: [
        { name: 'Dumbbell Front Squat', sets: 4, reps: 8, weight: '45 lb', muscles: ['legs'], notes: 'Chest up' },
        { name: 'Incline Dumbbell Press', sets: 4, reps: 10, weight: '40 lb', muscles: ['chest'], notes: 'Explosive' },
        { name: 'Weighted Pull-ups', sets: 4, reps: 8, weight: '25 lb', muscles: ['back'], notes: 'Full ROM' },
        { name: 'Walking Lunges', sets: 3, reps: 12, weight: '35 lb', muscles: ['legs'], notes: 'Control' },
        { name: 'Arnold Press', sets: 3, reps: 10, weight: '30 lb', muscles: ['shoulders'], notes: 'Rotate' },
        { name: 'Dips', sets: 3, reps: 12, weight: 'bodyweight', muscles: ['chest', 'triceps'], notes: 'Lean forward' }
      ],
      estimated_duration: 60,
      focus_muscles: ['legs', 'chest', 'back', 'shoulders']
    }
  };

  return workouts[profile.experience] || workouts['Intermediate'];
}

// ======================
// MAIN APP COMPONENT
// ======================
export default function WorkoutTracker() {
  // Navigation state
  const [activeTab, setActiveTab] = useState('workout'); // workout, body, targets, log

  // User profile
  const [profile, setProfile] = useState({
    goal: 'Build Muscle',
    experience: 'Intermediate',
    duration: 45,
    workoutsPerWeek: 4,
    equipment: ['dumbbells', 'bench', 'barbell'],
    split: 'Full Body'
  });

  // Muscle recovery (12 muscle groups)
  const [muscleRecovery, setMuscleRecovery] = useState({
    chest: { freshness: 100, soreness: 0, daysSince: 3 },
    back: { freshness: 100, soreness: 0, daysSince: 3 },
    shoulders: { freshness: 100, soreness: 0, daysSince: 4 },
    biceps: { freshness: 100, soreness: 0, daysSince: 4 },
    triceps: { freshness: 100, soreness: 0, daysSince: 4 },
    forearms: { freshness: 100, soreness: 0, daysSince: 5 },
    quadriceps: { freshness: 100, soreness: 0, daysSince: 2 },
    hamstrings: { freshness: 100, soreness: 0, daysSince: 2 },
    glutes: { freshness: 100, soreness: 0, daysSince: 2 },
    calves: { freshness: 100, soreness: 0, daysSince: 5 },
    core: { freshness: 100, soreness: 0, daysSince: 3 },
    traps: { freshness: 100, soreness: 0, daysSince: 4 }
  });

  // Current workout
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Workout history
  const [workoutHistory, setWorkoutHistory] = useState([]);

  // Weekly targets
  const [weeklyTargets, setWeeklyTargets] = useState({
    pushSets: { current: 9.5, target: 27 },
    pullSets: { current: 10.5, target: 15 },
    legSets: { current: 17.5, target: 21 }
  });
  // ======================
  // CORE FUNCTIONS
  // ======================

  const generateNewWorkout = async () => {
    setIsGenerating(true);
    try {
      const recentWorkouts = workoutHistory.slice(0, 2);
      const workout = await generateWorkoutWithChatGPT(profile, muscleRecovery, recentWorkouts);
      setCurrentWorkout({
        ...workout,
        date: new Date().toISOString(),
        id: Date.now()
      });
    } catch (error) {
      alert('Failed to generate workout. Using fallback.');
    } finally {
      setIsGenerating(false);
    }
  };

  const completeWorkout = (sorenessRatings) => {
    if (!currentWorkout) return;

    // Update muscle recovery
    const updated = { ...muscleRecovery };
    currentWorkout.focus_muscles.forEach(muscle => {
      const soreness = sorenessRatings[muscle] || 5;
      updated[muscle] = {
        freshness: Math.max(0, 100 - soreness * 10),
        soreness: soreness,
        daysSince: 0
      };
    });
    setMuscleRecovery(updated);

    // Add to history
    setWorkoutHistory([
      {
        ...currentWorkout,
        completedAt: new Date().toISOString(),
        sorenessRatings
      },
      ...workoutHistory
    ]);

    // Update weekly targets
    const pushCount = currentWorkout.exercises.filter(e => 
      e.muscles.some(m => ['chest', 'shoulders', 'triceps'].includes(m))
    ).reduce((sum, e) => sum + e.sets, 0);

    const pullCount = currentWorkout.exercises.filter(e =>
      e.muscles.some(m => ['back', 'biceps'].includes(m))
    ).reduce((sum, e) => sum + e.sets, 0);

    const legCount = currentWorkout.exercises.filter(e =>
      e.muscles.some(m => ['quadriceps', 'hamstrings', 'glutes', 'calves'].includes(m))
    ).reduce((sum, e) => sum + e.sets, 0);

    setWeeklyTargets({
      pushSets: { ...weeklyTargets.pushSets, current: weeklyTargets.pushSets.current + pushCount },
      pullSets: { ...weeklyTargets.pullSets, current: weeklyTargets.pullSets.current + pullCount },
      legSets: { ...weeklyTargets.legSets, current: weeklyTargets.legSets.current + legCount }
    });

    setCurrentWorkout(null);
  };

  // Recovery updates (run daily)
  useEffect(() => {
    const interval = setInterval(() => {
      setMuscleRecovery(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(muscle => {
          updated[muscle] = {
            ...updated[muscle],
            freshness: Math.min(100, updated[muscle].freshness + 10),
            soreness: Math.max(0, updated[muscle].soreness - 1),
            daysSince: updated[muscle].daysSince + 1
          };
        });
        return updated;
      });
    }, 24 * 60 * 60 * 1000); // 24 hours

    return () => clearInterval(interval);
  }, []);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('workoutData');
    if (saved) {
      const data = JSON.parse(saved);
      setProfile(data.profile || profile);
      setMuscleRecovery(data.muscleRecovery || muscleRecovery);
      setWorkoutHistory(data.workoutHistory || []);
      setWeeklyTargets(data.weeklyTargets || weeklyTargets);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('workoutData', JSON.stringify({
      profile,
      muscleRecovery,
      workoutHistory,
      weeklyTargets
    }));
  }, [profile, muscleRecovery, workoutHistory, weeklyTargets]);

  // ======================
  // UI COMPONENTS
  // ======================

  const MuscleMap = ({ recovery, view }) => {
    const getMuscleColor = (freshness) => {
      if (freshness >= 80) return 'rgba(16, 185, 129, 0.8)'; // green
      if (freshness >= 50) return 'rgba(251, 191, 36, 0.8)'; // yellow
      return 'rgba(239, 68, 68, 0.8)'; // red
    };

    if (view === 'back') {
      return (
        <svg viewBox="0 0 300 600" className="w-full max-w-[200px] mx-auto">
          {/* Back view muscles */}
          <ellipse cx="150" cy="80" rx="70" ry="50" fill={getMuscleColor(recovery.traps?.freshness || 100)} opacity="0.8"/>
          <ellipse cx="90" cy="150" rx="60" ry="80" fill={getMuscleColor(recovery.back?.freshness || 100)} opacity="0.8"/>
          <ellipse cx="210" cy="150" rx="60" ry="80" fill={getMuscleColor(recovery.back?.freshness || 100)} opacity="0.8"/>
          <ellipse cx="150" cy="300" rx="50" ry="40" fill={getMuscleColor(recovery.glutes?.freshness || 100)} opacity="0.8"/>
          <ellipse cx="100" cy="420" rx="40" ry="90" fill={getMuscleColor(recovery.hamstrings?.freshness || 100)} opacity="0.8"/>
          <ellipse cx="200" cy="420" rx="40" ry="90" fill={getMuscleColor(recovery.hamstrings?.freshness || 100)} opacity="0.8"/>
          <ellipse cx="100" cy="540" rx="25" ry="40" fill={getMuscleColor(recovery.calves?.freshness || 100)} opacity="0.8"/>
          <ellipse cx="200" cy="540" rx="25" ry="40" fill={getMuscleColor(recovery.calves?.freshness || 100)} opacity="0.8"/>
        </svg>
      );
    }

    // Front view
    return (
      <svg viewBox="0 0 300 600" className="w-full max-w-[200px] mx-auto">
        <ellipse cx="90" cy="80" rx="35" ry="30" fill={getMuscleColor(recovery.shoulders?.freshness || 100)} opacity="0.8"/>
        <ellipse cx="210" cy="80" rx="35" ry="30" fill={getMuscleColor(recovery.shoulders?.freshness || 100)} opacity="0.8"/>
        <rect x="100" y="110" width="100" height="80" rx="10" fill={getMuscleColor(recovery.chest?.freshness || 100)} opacity="0.8"/>
        <ellipse cx="70" cy="120" rx="25" ry="50" fill={getMuscleColor(recovery.biceps?.freshness || 100)} opacity="0.8"/>
        <ellipse cx="230" cy="120" rx="25" ry="50" fill={getMuscleColor(recovery.biceps?.freshness || 100)} opacity="0.8"/>
        <rect x="120" y="200" width="60" height="80" rx="10" fill={getMuscleColor(recovery.core?.freshness || 100)} opacity="0.8"/>
        <ellipse cx="100" cy="380" rx="45" ry="100" fill={getMuscleColor(recovery.quadriceps?.freshness || 100)} opacity="0.8"/>
        <ellipse cx="200" cy="380" rx="45" ry="100" fill={getMuscleColor(recovery.quadriceps?.freshness || 100)} opacity="0.8"/>
      </svg>
    );
  };

  const HexagonProgress = ({ percent }) => {
    const radius = 50;
    const angle = (percent / 100) * 360;

    return (
      <svg viewBox="0 0 120 120" className="w-32 h-32">
        <defs>
          <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <polygon
          points="60,10 95,30 95,70 60,90 25,70 25,30"
          fill="none"
          stroke="#333"
          strokeWidth="2"
        />
        <polygon
          points="60,10 95,30 95,70 60,90 25,70 25,30"
          fill="url(#hexGrad)"
          opacity={percent / 100}
        />
        <text x="60" y="65" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">
          {Math.round(percent)}%
        </text>
      </svg>
    );
  };
  // ======================
  // TAB SCREENS
  // ======================

  const WorkoutTab = () => (
    <div className="p-4 pb-24 safe-area">
      {!currentWorkout ? (
        <div className="animate-fadeIn">
          <h1 className="text-3xl font-bold mb-6">Ready to Train?</h1>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-pink-500">{workoutHistory.length}</div>
              <div className="text-xs text-gray-400">Workouts</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-cyan-500">
                {Math.round((weeklyTargets.pushSets.current + weeklyTargets.pullSets.current + weeklyTargets.legSets.current) / 
                (weeklyTargets.pushSets.target + weeklyTargets.pullSets.target + weeklyTargets.legSets.target) * 100)}%
              </div>
              <div className="text-xs text-gray-400">Weekly Goal</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-green-500">
                {Object.values(muscleRecovery).filter(m => m.freshness > 80).length}
              </div>
              <div className="text-xs text-gray-400">Fresh Muscles</div>
            </div>
          </div>

          {/* Generate Workout Button */}
          <button
            onClick={generateNewWorkout}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl p-6 font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="animate-spin" />
                Generating Workout...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Dumbbell />
                Generate AI Workout
              </div>
            )}
          </button>

          {/* Recent Workout */}
          {workoutHistory.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-400 mb-3">Last Workout</h2>
              <div className="bg-gray-800 rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{workoutHistory[0].workout_name}</h3>
                  <span className="text-xs text-gray-400">
                    {new Date(workoutHistory[0].completedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Activity size={16} />
                    {workoutHistory[0].exercises.length} exercises
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    {workoutHistory[0].estimated_duration}m
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{currentWorkout.workout_name}</h1>
            <button
              onClick={() => setCurrentWorkout(null)}
              className="p-2 bg-gray-800 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-3 mb-6 text-sm">
            <div className="flex items-center gap-1 text-gray-400">
              <Clock size={16} />
              {currentWorkout.estimated_duration}m
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Activity size={16} />
              {currentWorkout.exercises.length} exercises
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Target size={16} />
              {currentWorkout.focus_muscles.join(', ')}
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-4 mb-6">
            {currentWorkout.exercises.map((exercise, idx) => (
              <div key={idx} className="bg-gray-800 rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{exercise.name}</h3>
                  <span className="text-xs px-2 py-1 bg-pink-500 rounded-full">
                    {exercise.muscles.join(', ')}
                  </span>
                </div>
                <div className="flex gap-4 text-sm mb-2">
                  <span>{exercise.sets} sets</span>
                  <span>{exercise.reps} reps</span>
                  <span className="text-cyan-500">{exercise.weight}</span>
                </div>
                {exercise.notes && (
                  <p className="text-xs text-gray-400">{exercise.notes}</p>
                )}
              </div>
            ))}
          </div>

          {/* Complete Workout */}
          <button
            onClick={() => {
              const ratings = {};
              currentWorkout.focus_muscles.forEach(m => {
                ratings[m] = parseInt(prompt(`Rate ${m} soreness (1-10):`) || '5');
              });
              completeWorkout(ratings);
            }}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-4 font-bold shadow-lg active:scale-95 transition-transform"
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle />
              Complete Workout
            </div>
          </button>
        </div>
      )}
    </div>
  );

  const BodyTab = () => {
    const [view, setView] = useState('front');

    return (
      <div className="p-4 pb-24 safe-area">
        <h1 className="text-2xl font-bold mb-6">Recovery Status</h1>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('front')}
            className={`flex-1 py-2 rounded-xl ${view === 'front' ? 'bg-pink-500' : 'bg-gray-800'}`}
          >
            Front
          </button>
          <button
            onClick={() => setView('back')}
            className={`flex-1 py-2 rounded-xl ${view === 'back' ? 'bg-pink-500' : 'bg-gray-800'}`}
          >
            Back
          </button>
        </div>

        {/* Muscle Map */}
        <div className="mb-6">
          <MuscleMap recovery={muscleRecovery} view={view} />
        </div>

        {/* Muscle Details */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 mb-3">Muscle Groups</h2>
          {Object.entries(muscleRecovery).map(([muscle, data]) => (
            <div key={muscle} className="bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold capitalize">{muscle}</span>
                <span className={`text-sm ${
                  data.freshness >= 80 ? 'text-green-500' : 
                  data.freshness >= 50 ? 'text-yellow-500' : 
                  'text-red-500'
                }`}>
                  {data.freshness}% Fresh
                </span>
              </div>
              <div className="flex gap-4 text-xs text-gray-400">
                <span>Soreness: {data.soreness}/10</span>
                <span>Last trained: {data.daysSince}d ago</span>
              </div>
              <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
                  style={{ width: `${data.freshness}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const TargetsTab = () => {
    const totalProgress = Math.round(
      ((weeklyTargets.pushSets.current / weeklyTargets.pushSets.target) +
       (weeklyTargets.pullSets.current / weeklyTargets.pullSets.target) +
       (weeklyTargets.legSets.current / weeklyTargets.legSets.target)) / 3 * 100
    );

    return (
      <div className="p-4 pb-24 safe-area">
        <h1 className="text-2xl font-bold mb-6">Weekly Targets</h1>

        {/* Overall Progress */}
        <div className="flex justify-center mb-8">
          <HexagonProgress percent={totalProgress} />
        </div>

        {/* Muscle Group Progress */}
        <div className="space-y-4">
          {[
            { name: 'Push Muscles', data: weeklyTargets.pushSets, color: 'from-yellow-500 to-orange-500' },
            { name: 'Pull Muscles', data: weeklyTargets.pullSets, color: 'from-pink-500 to-red-500' },
            { name: 'Leg Muscles', data: weeklyTargets.legSets, color: 'from-cyan-500 to-blue-500' }
          ].map((target) => (
            <div key={target.name} className="bg-gray-800 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold">{target.name}</span>
                <span className="text-2xl font-bold">
                  {target.data.current} / {target.data.target}
                </span>
              </div>
              <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${target.color} transition-all`}
                  style={{ width: `${Math.min(100, (target.data.current / target.data.target) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {target.data.target - target.data.current > 0 
                  ? `${target.data.target - target.data.current} sets to go` 
                  : 'Target reached! 🎉'}
              </div>
            </div>
          ))}
        </div>

        {/* History placeholder */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-400 mb-3">Past Weeks</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[59, 46, 80, 46].map((percent, idx) => (
              <div key={idx} className="flex-shrink-0 text-center">
                <div className="w-16 h-16 mb-2">
                  <svg viewBox="0 0 100 100">
                    <polygon
                      points="50,5 85,25 85,65 50,85 15,65 15,25"
                      fill={`rgba(236, 72, 153, ${percent / 100})`}
                      stroke="#333"
                      strokeWidth="2"
                    />
                    <text x="50" y="55" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
                      {percent}%
                    </text>
                  </svg>
                </div>
                <div className="text-xs text-gray-500">
                  Week {4 - idx}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const LogTab = () => (
    <div className="p-4 pb-24 safe-area">
      <h1 className="text-2xl font-bold mb-6">Workout Log</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-2xl p-4">
          <div className="text-3xl font-bold text-pink-500 mb-1">{workoutHistory.length}</div>
          <div className="text-sm text-gray-400">Total Workouts</div>
        </div>
        <div className="bg-gray-800 rounded-2xl p-4">
          <div className="text-3xl font-bold text-cyan-500 mb-1">
            {Math.round(workoutHistory.reduce((sum, w) => sum + (w.estimated_duration || 45), 0) / 60)}h
          </div>
          <div className="text-sm text-gray-400">Total Time</div>
        </div>
      </div>

      {/* Workout History */}
      {workoutHistory.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Dumbbell size={48} className="mx-auto mb-4 opacity-50" />
          <p>No workouts yet. Start training!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workoutHistory.map((workout, idx) => (
            <div key={workout.id || idx} className="bg-gray-800 rounded-2xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold mb-1">{workout.workout_name}</h3>
                  <div className="text-xs text-gray-400">
                    {new Date(workout.completedAt).toLocaleDateString('en-US', { 
                      month: 'short', day: 'numeric', year: 'numeric' 
                    })}
                  </div>
                </div>
                <ChevronRight className="text-gray-500" />
              </div>
              <div className="flex gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Activity size={14} />
                  {workout.exercises.length} exercises
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  {workout.estimated_duration}m
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ======================
  // MAIN RENDER
  // ======================
  return (
    <div className="min-h-screen bg-[#0f0f1e] text-white">
      {/* Content */}
      <div className="max-w-md mx-auto">
        {activeTab === 'workout' && <WorkoutTab />}
        {activeTab === 'body' && <BodyTab />}
        {activeTab === 'targets' && <TargetsTab />}
        {activeTab === 'log' && <LogTab />}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a2e] border-t border-gray-800 safe-area">
        <div className="max-w-md mx-auto flex justify-around py-2">
          {[
            { id: 'workout', icon: Dumbbell, label: 'Workout' },
            { id: 'body', icon: Activity, label: 'Body' },
            { id: 'targets', icon: Target, label: 'Targets' },
            { id: 'log', icon: Calendar, label: 'Log' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id ? 'text-pink-500' : 'text-gray-400'
              }`}
            >
              <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}