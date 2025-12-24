# 🏋️ AI Workout Tracker

**AI-powered workout generator using ChatGPT** with muscle recovery tracking, progressive overload, and weekly set targets. Built for mobile (iOS optimized) but works great on desktop too!

![Workout Tracker](https://img.shields.io/badge/React-18.2-blue) ![Vite](https://img.shields.io/badge/Vite-4.4-purple) ![OpenAI](https://img.shields.io/badge/ChatGPT-API-green)

## ✨ Features

### 🧠 AI-Powered Workouts
- **ChatGPT Integration**: Generates personalized workouts using GPT-4o-mini
- **Smart Muscle Prioritization**: Focuses on fresh muscles (>70% recovery)
- **Progressive Overload**: Automatically increases volume/intensity by 5-10%
- **Exercise Variety**: Avoids repeating recent exercises
- **Equipment Matching**: Only suggests exercises for your available equipment

### 📊 Recovery Tracking
- **12 Muscle Groups**: Chest, back, shoulders, biceps, triceps, forearms, quads, hamstrings, glutes, calves, core, traps
- **Visual Muscle Map**: Front/back view showing recovery status
- **Soreness-Based Recovery**: Rate soreness after each workout (1-10 scale)
- **Automatic Recovery**: Muscles heal 10%/day, soreness decreases 1 point/day
- **Days Since Trained**: Track rest periods for each muscle group

### 🎯 Weekly Set Targets
- **Hexagon Progress Visualization**: Beautiful animated progress indicator
- **3 Muscle Categories**: Push (chest/shoulders/triceps), Pull (back/biceps), Legs (quads/hams/glutes/calves)
- **Historical Tracking**: See past weeks' completion rates
- **Auto-Updated**: Targets increase automatically as you complete them

### 📱 Complete Workout Logger
- **Workout History**: Track all past sessions with dates
- **Exercise Details**: Sets, reps, weight, duration, muscles worked
- **Total Stats**: Lifetime workout count, total training time
- **Calendar View**: See which days you trained

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Kyletho2020/Workout_App.git
cd Workout_App
```

2. **Install dependencies**
```bash
npm install
```

3. **Add your OpenAI API key**

Open `src/App.jsx` and replace line 13:
```javascript
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE';
```

With your actual key:
```javascript
const OPENAI_API_KEY = 'sk-proj-...your-key-here';
```

4. **Run the app**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

### For bolt.new Testing

1. **Upload all files** to bolt.new
2. **Edit `src/App.jsx`** and add your OpenAI API key
3. **Click "Run"** to start the development server
4. **Test on mobile** using the preview URL

## 📖 Usage Guide

### First Workout

1. **Tap "Generate AI Workout"** on the home screen
2. **Wait 3-5 seconds** for ChatGPT to generate your personalized workout
3. **Review the exercises**: 6 exercises with sets, reps, weight, and form cues
4. **Complete your workout**
5. **Rate muscle soreness** (1-10 for each muscle group worked)

### Viewing Recovery

1. **Tap "Body"** in the bottom navigation
2. **Toggle Front/Back** view to see all muscle groups
3. **Check freshness levels**:
   - 🟢 **Green (80-100%)**: Fresh, ready to train
   - 🟡 **Yellow (50-79%)**: Recovering
   - 🔴 **Red (0-49%)**: Needs rest
4. **Plan next workout** around recovered muscles

### Tracking Progress

1. **Tap "Targets"** to see weekly set goals
2. **View hexagon progress** (overall completion %)
3. **Check individual muscle groups**:
   - Push: 27 sets/week
   - Pull: 15 sets/week  
   - Legs: 21 sets/week
4. **See historical performance** (past 4 weeks)

### Workout Log

1. **Tap "Log"** to see all past workouts
2. **View total stats**: Workout count, total training time
3. **Tap any workout** to see exercise details
4. **Filter by date** (coming soon)

## 🔧 Customization

### Change AI Model

In `src/App.jsx`, line 38:
```javascript
model: 'gpt-4o-mini', // or 'gpt-4' for better results (higher cost)
```

### Adjust Progressive Overload

In `src/App.jsx`, the prompt (lines 19-60), modify:
```javascript
2. Apply progressive overload (increase reps/weight by 5-10% from recent workouts)
```

To:
```javascript
2. Apply progressive overload (increase reps/weight by 3-5% from recent workouts) // More conservative
// or
2. Apply progressive overload (increase reps/weight by 10-15% from recent workouts) // More aggressive
```

### Add Custom Equipment

In `src/App.jsx`, update `profile.equipment` (line 119):
```javascript
equipment: ['dumbbells', 'bench', 'barbell', 'cables', 'resistance bands']
```

### Change Weekly Targets

In `src/App.jsx`, update `weeklyTargets` (line 139):
```javascript
weeklyTargets: {
  pushSets: { current: 0, target: 30 }, // Increase from 27
  pullSets: { current: 0, target: 20 }, // Increase from 15
  legSets: { current: 0, target: 25 }   // Increase from 21
}
```

## 🎨 Mobile Optimization

### iOS Features
- **Safe Area Support**: Respects iPhone notch and home indicator
- **Standalone Mode**: Add to home screen for app-like experience
- **Touch Optimized**: Large tap targets, no accidental taps
- **Smooth Animations**: Hardware-accelerated transitions
- **Responsive Layout**: Adapts to all screen sizes

### Android Features
- **Material Design**: Follows Android design principles
- **Back Button Support**: Native back navigation
- **PWA Ready**: Installable from Chrome

## 💰 API Costs

### OpenAI Pricing (as of Dec 2024)

**GPT-4o-mini** (recommended):
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens
- **Per workout**: ~$0.001 (0.1 cents)
- **Monthly cost (16 workouts)**: ~$0.02

**GPT-4o** (premium):
- Input: $2.50 / 1M tokens
- Output: $10.00 / 1M tokens  
- **Per workout**: ~$0.015 (1.5 cents)
- **Monthly cost (16 workouts)**: ~$0.24

### Cost Optimization Tips

1. **Use GPT-4o-mini**: 15x cheaper, great for most users
2. **Cache workouts**: Store generated workouts locally
3. **Batch requests**: Generate multiple days at once
4. **Fallback workouts**: Use pre-built workouts when API fails

## 🐛 Troubleshooting

### "API Error" when generating workout

**Solution**:
1. Check your API key is correct in `src/App.jsx`
2. Verify you have OpenAI credits: https://platform.openai.com/usage
3. Check browser console for specific error
4. Try using the fallback workout (automatically triggers on API failure)

### Workout is too easy/hard

**Solution**:
1. Rate soreness accurately after workouts (AI learns from this)
2. Change experience level in profile (Beginner/Intermediate/Advanced)
3. Manually adjust progressive overload rate in the prompt

### Recovery not updating

**Solution**:
1. Check `localStorage` is enabled in browser settings
2. Try clearing app data: `localStorage.clear()`
3. Manually rate soreness after each workout (triggers recovery updates)

### App not saving data

**Solution**:
1. Enable cookies and site data in browser
2. Check storage quota: Chrome DevTools > Application > Storage
3. Try in private/incognito mode to test
4. Consider implementing cloud backup (Firebase, Supabase)

## 🔮 Future Features

- [ ] **Exercise Library**: Video demonstrations and form tips
- [ ] **Nutrition Tracking**: Calorie/macro logging
- [ ] **Social Features**: Share workouts, leaderboards
- [ ] **Wearable Integration**: Apple Watch, Fitbit sync
- [ ] **Advanced Analytics**: 1RM calculators, volume landmarks
- [ ] **Cloud Sync**: Multi-device support
- [ ] **Injury Prevention**: Form analysis, deload weeks

## 🤝 Contributing

Pull requests welcome! For major changes:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

MIT License - feel free to use, modify, and distribute!

## 🙏 Credits

- **AI**: OpenAI ChatGPT (GPT-4o-mini)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)

---

**Built with ❤️ for fitness enthusiasts**

Questions? Open an issue or reach out!

🐛 Report bugs: [GitHub Issues](https://github.com/Kyletho2020/Workout_App/issues)  
💬 Discussions: [GitHub Discussions](https://github.com/Kyletho2020/Workout_App/discussions)
