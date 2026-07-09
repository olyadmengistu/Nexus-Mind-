import { useEffect, useCallback } from 'react';
import { useDeviceInfo } from './deviceDetection';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const deviceInfo = useDeviceInfo();

  useEffect(() => {
    // Only enable on desktop/tablet
    if (deviceInfo.type === 'mobile') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey;
        const metaMatch = shortcut.metaKey ? event.metaKey : !event.metaKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, deviceInfo.type]);
};

// Common keyboard shortcuts for NexusMind
export const createCommonShortcuts = (actions: {
  navigateHome: () => void;
  navigateSearch: () => void;
  navigateMessages: () => void;
  navigateNotifications: () => void;
  navigateProfile: () => void;
  navigateSettings: () => void;
  createPost: () => void;
  openHelp: () => void;
}): KeyboardShortcut[] => {
  return [
    {
      key: 'h',
      description: 'Go to Home',
      action: actions.navigateHome,
    },
    {
      key: '/',
      description: 'Search',
      action: actions.navigateSearch,
    },
    {
      key: 'm',
      description: 'Messages',
      action: actions.navigateMessages,
    },
    {
      key: 'n',
      description: 'Notifications',
      action: actions.navigateNotifications,
    },
    {
      key: 'p',
      description: 'Profile',
      action: actions.navigateProfile,
    },
    {
      key: 's',
      description: 'Settings',
      action: actions.navigateSettings,
    },
    {
      key: 'c',
      ctrlKey: true,
      description: 'Create new post',
      action: actions.createPost,
    },
    {
      key: '?',
      description: 'Help',
      action: actions.openHelp,
    },
  ];
};

// Keyboard shortcut help component
export const KeyboardShortcutsHelp = () => {
  const deviceInfo = useDeviceInfo();
  
  if (deviceInfo.type === 'mobile') return null;

  const shortcuts = [
    { key: 'H', description: 'Go to Home' },
    { key: '/', description: 'Search' },
    { key: 'M', description: 'Messages' },
    { key: 'N', description: 'Notifications' },
    { key: 'P', description: 'Profile' },
    { key: 'S', description: 'Settings' },
    { key: 'Ctrl + C', description: 'Create new post' },
    { key: '?', description: 'Help' },
  ];

  return (
    <div className="fixed bottom-4 right-4 bg-white text-gray-900 p-4 rounded-lg shadow-lg z-50 max-w-sm border border-gray-200">
      <h3 className="font-bold mb-3 text-sm">Keyboard Shortcuts</h3>
      <div className="space-y-2 text-xs">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex justify-between items-center">
            <kbd className="bg-gray-100 px-2 py-1 rounded text-xs font-mono border border-gray-300">
              {shortcut.key}
            </kbd>
            <span className="text-gray-600">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
