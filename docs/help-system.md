# HostelPulse Help System Documentation

## 🎯 Overview

Comprehensive help system with contextual assistance, keyboard shortcuts, and searchable documentation.

## 🚀 Features Implemented

### 1. Contextual Help

- **Smart filtering** based on current page/context
- **Related topics** for seamless navigation
- **Quick access** with floating help button

### 2. Keyboard Shortcuts

- **`?`** - Open help modal
- **`Ctrl+K`** - Quick guest check-in
- **`Ctrl+Shift+K`** - Quick guest check-out
- **`Ctrl+R`** - Room management
- **`Ctrl+Alt+S`** - SEF reporting
- **Mac equivalents** with `Cmd` key

### 3. Search Functionality

- **Real-time search** of help topics
- **Fuzzy matching** for topic titles and descriptions
- **Mobile responsive** with automatic modal close

## 🛠️ Installation & Setup

### Dependencies

```bash
pnpm add @gits-ui/react-dialog @gits-ui/react-icons @headlessui/react
```

### Integration Example

```tsx
import HelpSystem, {
  HelpTopic,
  HELP_TOPICS,
} from '@/components/help/help-system';

// In your layout component:
<HelpSystem
  context="check-in"
  showKeyboardShortcuts={true}
  className="help-button-class"
/>;
```

## 📚 Help Topics Structure

Each topic includes:

- **ID**: Unique identifier
- **Title**: Display name
- **Description**: Detailed explanation
- **Shortcuts**: Key combinations
- **Related Topics**: Cross-references

### Current Topics

1. **Guest Check-in** - Arrival processing and SEF compliance
2. **Guest Check-out** - Departure handling and invoice generation
3. **Moloni Integration** - Portuguese invoicing API setup
4. **SEF Reporting** - Immigration compliance automation
5. **Room Management** - Configuration and availability

## 🎨 Styling & UI

### Component Structure

- **Floating Button**: Fixed position, accessible
- **Modal Overlay**: Full-screen responsive design
- **Search Interface**: Icon input with real-time filtering
- **Topic Cards**: Clickable help entries with metadata

### Design System

- **Tailwind CSS** for consistent styling
- **Lucide Icons** for visual clarity
- **Responsive Grid**: Adapts to screen size
- **Transitions**: Smooth animations

## 🔧 Configuration Options

### Props Interface

```tsx
interface HelpSystemProps {
  className?: string; // Custom CSS classes
  showKeyboardShortcuts?: boolean; // Enable/disable shortcuts display
  context?: string; // Filter topics by context
}
```

## 📱 Mobile Experience

- **Optimized modal** for small screens
- **Auto-close** after topic selection
- **Touch-friendly** button sizing
- **Scrollable content** for long topics

## 🔍 Search Implementation

- **Debounced input** for performance
- **Case-insensitive** matching
- **Multi-field search** (title + description)
- **Result highlighting** for found terms

## 🚀 Future Enhancements

### Planned Features

1. **Video Tutorials** - Embedded walkthrough videos
2. **Interactive Guides** - Step-by-step wizards
3. **Analytics** - Track help usage patterns
4. **AI Chat** - Context-aware assistance bot
5. **Documentation Sync** - Pull from external docs

### Integration Ideas

```tsx
// Context-aware help based on route
const context = pathname.includes('check-in')
  ? 'check-in'
  : pathname.includes('moloni')
    ? 'moloni'
    : 'general';

<HelpSystem context={context} />;
```

## 🔧 Development Notes

### File Locations

- `components/help/help-system.tsx` - Main component
- Export `HELP_TOPICS` for programmatic access
- Type-safe interfaces for all props

### Performance Considerations

- **Memoized search** results
- **Event listener cleanup** on unmount
- **Lazy loading** of help content

### Accessibility

- **Keyboard navigation** support
- **ARIA labels** on interactive elements
- **High contrast** design compatibility
- **Screen reader** friendly structure

## 🎯 Usage Metrics

### Trackable Events

```javascript
// Example tracking implementation
analytics.track('help_topic_viewed', {
  topic: topic.id,
  context: context,
  source: 'search', // 'browse', 'related'
});
```

### Popular Topics (Expected)

1. Moloni integration setup
2. Guest check-in workflow
3. SEF reporting requirements
4. Portuguese compliance rules

---

**Last Updated**: December 27, 2025  
**Version**: 1.0.0  
**Framework**: React 19 + TypeScript + Tailwind CSS
