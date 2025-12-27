/**
 * Help System Component - Contextual help for HostelPulse
 * Provides tooltips, keyboard shortcuts, and guided help
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { HelpCircle, Keyboard, X, Search, BookOpen } from 'lucide-react';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  shortcuts?: string[];
  relatedTopics?: string[];
}

interface HelpSystemProps {
  className?: string;
  showKeyboardShortcuts?: boolean;
  context?: string;
}

const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'check-in',
    title: 'Guest Check-in',
    description:
      'Process guest arrivals, assign rooms, and generate SEF reports for Portuguese compliance.',
    shortcuts: ['Ctrl+K', 'Cmd+K'],
    relatedTopics: ['check-out', 'bookings'],
  },
  {
    id: 'check-out',
    title: 'Guest Check-out',
    description:
      'Complete guest stays, generate invoices via Moloni, and handle tourist tax.',
    shortcuts: ['Ctrl+Shift+K', 'Cmd+Shift+K'],
    relatedTopics: ['check-in', 'invoices'],
  },
  {
    id: 'moloni-invoicing',
    title: 'Moloni Integration',
    description:
      'Portuguese invoicing compliance with automated tax calculation and email delivery.',
    shortcuts: ['?'],
    relatedTopics: ['check-out', 'settings'],
  },
  {
    id: 'sef-reporting',
    title: 'SEF Reporting',
    description:
      'Automatic generation of guest accommodation reports for Portuguese immigration compliance.',
    shortcuts: ['Ctrl+Alt+S', 'Cmd+Alt+S'],
    relatedTopics: ['check-in', 'check-out'],
  },
  {
    id: 'room-management',
    title: 'Room Management',
    description:
      'Configure room types, bed assignments, pricing, and availability.',
    shortcuts: ['Ctrl+R', 'Cmd+R'],
    relatedTopics: ['bookings', 'pricing'],
  },
];

export default function HelpSystem({
  className = '',
  showKeyboardShortcuts = true,
  context,
}: HelpSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<HelpTopic | null>(null);

  // Filter topics based on context
  const filteredTopics = HELP_TOPICS.filter(
    (topic) =>
      !context ||
      topic.id.includes(context) ||
      topic.relatedTopics?.includes(context)
  );

  // Filter topics based on search
  const searchResults = searchQuery
    ? filteredTopics.filter(
        (topic) =>
          topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredTopics;

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === '?' || (e.ctrlKey && e.key === 'h')) {
      e.preventDefault();
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (showKeyboardShortcuts) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, showKeyboardShortcuts]);

  const handleTopicClick = (topic: HelpTopic) => {
    setActiveTopic(topic);
    if (window.innerWidth < 768) {
      // On mobile, close after selecting
      setTimeout(() => setIsOpen(false), 2000);
    }
  };

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
        title="Press '?' for help"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[80vh] w-full mx-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">
                  HostelPulse Help Center
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {searchQuery === '' && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    Quick Access
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredTopics.slice(0, 4).map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => handleTopicClick(topic)}
                        className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-medium mb-1">{topic.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {topic.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results or All Topics */}
              <div className="space-y-4">
                {searchResults.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => handleTopicClick(topic)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{topic.title}</h4>
                        <p className="text-gray-700 mb-3">
                          {topic.description}
                        </p>

                        {/* Keyboard Shortcuts */}
                        {topic.shortcuts && showKeyboardShortcuts && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Keyboard className="h-4 w-4" />
                            <div className="flex gap-2">
                              {topic.shortcuts.map((shortcut, index) => (
                                <span
                                  key={index}
                                  className="bg-gray-100 px-2 py-1 rounded font-mono"
                                >
                                  {shortcut}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Related Topics */}
                        {topic.relatedTopics &&
                          topic.relatedTopics.length > 0 && (
                            <div className="text-sm">
                              <span className="text-gray-600">Related: </span>
                              {topic.relatedTopics.map((related, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    const relatedTopic = HELP_TOPICS.find(
                                      (t) => t.id === related
                                    );
                                    if (relatedTopic)
                                      setActiveTopic(relatedTopic);
                                  }}
                                  className="text-blue-600 hover:underline mx-1"
                                >
                                  {related}
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="text-center text-sm text-gray-600">
                <p>
                  Press <kbd className="bg-white px-2 py-1 rounded">?</kbd>{' '}
                  anytime for help
                </p>
                <p className="mt-2">
                  Need more support?{' '}
                  <a
                    href="mailto:support@hostelpulse.com"
                    className="text-blue-600 hover:underline"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Export help topics for programmatic access
export { HELP_TOPICS };
export type { HelpTopic };
