# BlinkBrain 🧠

A production-ready note and reminder application with a beautiful **modern pastel UI**, built with React Native for Android and Web.

> **New Design!** BlinkBrain now features a vibrant, colorful interface inspired by Apple's iOS design language, Material You, and Notion Mobile. See [UI Design Guide](./UI_DESIGN_GUIDE.md) for details.

## Features

### Core Functionality
- ✨ **Smart Notes** - Create rich notes with title, content, images, and code blocks
- 🔔 **Flexible Reminders** - Advanced scheduling (one-time, daily, hourly, specific time, weekly, alternate-day)
- 📌 **Pin Notes** - Keep important notes at the top
- 🔍 **Search & Filter** - Full-text search across titles and content
- 🎨 **Rich Content** - Attach images and add code blocks with monospaced fonts
- 🔕 **Soft Disable** - Pause reminders without deleting notes
- 🗑️ **Soft Delete** - Recover accidentally deleted notes

### Design & UX
- 🎨 **Modern Pastel UI** - Vibrant card-based design with 6 beautiful pastel colors
- 📝 **Large Typography** - iOS-inspired large titles for better hierarchy
- 🎭 **Smooth Animations** - Micro-interactions with reduced-motion support
- ♿ **Accessibility** - High-contrast typography and WCAG AA compliant
- 📱 **Responsive** - Works seamlessly on Android and Web
- 🌈 **Colorful Cards** - Each note gets a unique pastel background (purple, yellow, green, peach, blue, pink)

### Technical Excellence
- 📴 **Offline-First** - Works without internet connection
- 🔋 **Battery-Efficient** - OS-native scheduling mechanisms
- 🏗️ **Clean Architecture** - Feature-based organization
- 💾 **Platform-Agnostic Storage** - AsyncStorage (Android) + IndexedDB (Web)
- 🔐 **Local-First** - All data stored locally, no cloud dependency

## Architecture

```
src/
├── domain/
│   ├── models/          # Data models (Note, Reminder)
│   └── interfaces/      # Storage interfaces
├── features/
│   ├── notes/
│   │   ├── components/  # NoteCard, NoteEditor
│   │   ├── screens/     # NotesListScreen
│   │   └── store/       # Zustand store
│   └── reminders/
│       ├── services/    # Scheduling engine, notifications
│       └── store/       # Reminders store
├── shared/
│   ├── components/      # GlassCard, GlassButton, GlassInput, GlassModal
│   ├── theme/           # Design tokens (colors, blur, spacing)
│   ├── storage/         # Platform-agnostic storage layer
│   ├── hooks/           # useReducedMotion
│   └── utils/           # UUID, date formatting
└── types/               # TypeScript type exports
```

## Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Storage**: AsyncStorage (Android) + IndexedDB (Web)
- **UI**: Custom glassmorphism components with expo-blur
- **Notifications**: Expo Notifications (Android) + Web Notifications API
- **Styling**: React Native StyleSheet

## Getting Started

### Prerequisites
- Node.js >= 20.19.4 (current version has warnings but works)
- npm or yarn
- For Android: Android Studio + Android SDK
- For Web: Modern browser with IndexedDB support

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm start

# Run on Android
npm run android

# Run on Web
npm run web
```

### Development

The project uses Expo's managed workflow for simplified development:

- Hot reload enabled for fast iteration
- Platform-specific code handled via `Platform.OS`
- Expo modules for blur effects, notifications, and image picker

## Storage

### Android
- Uses `@react-native-async-storage/async-storage`
- Persistent key-value storage
- Survives app restarts

### Web
- Primary: IndexedDB via `idb-keyval`
- Fallback: localStorage
- Automatic detection and graceful degradation

## Notifications

### Android
- Expo Notifications with foreground service support
- Heads-up notifications for reminders
- Full-screen intent capability (when permitted)
- Battery-optimized scheduling

### Web
- Browser Notifications API
- Service Worker ready (to be implemented for production)
- Graceful fallback when browser is inactive
- Permission management

## Reminder Scheduling

The scheduling engine supports:

1. **One-time** - Specific date and time
2. **Hourly** - Every N hours
3. **Daily** - Same time every day
4. **Specific Time** - One-time at specific time
5. **Weekly** - Specific days of week
6. **Alternate Day** - Every other day from start date

Multiple schedules can be added to a single note with priority handling.

## Theme System

Glassmorphism design tokens:
- **Colors**: Glass surfaces, gradients, accents
- **Blur**: Subtle to intense blur values
- **Spacing**: Consistent spacing scale
- **Shadows**: Elevation with glow effects
- **Typography**: Size, weight, and line height scales
- **Animations**: Duration and easing curves

## Accessibility

- Reduced motion support via `AccessibilityInfo`
- High-contrast text colors (WCAG AA compliant)
- Keyboard navigation ready
- Screen reader friendly (ARIA labels to be added)

## Future Enhancements

- [ ] Image cropping and compression
- [ ] Syntax highlighting for code blocks
- [ ] Export notes (Markdown, PDF)
- [ ] Categories and tags
- [ ] Dark/light theme toggle
- [ ] Cloud sync (optional)
- [ ] Collaboration features
- [ ] Voice notes
- [ ] OCR for images

## Known Issues

- Node version warnings (React Native 0.81.5 requires >= 20.19.4, current is 20.9.0) - works but recommend upgrade
- Peer dependency conflicts resolved with `--legacy-peer-deps`

## License

MIT

## Contributing

Contributions welcome! Please follow the clean architecture patterns and maintain accessibility standards.

---

Built with ❤️ using React Native, TypeScript, and Glassmorphism design principles.
