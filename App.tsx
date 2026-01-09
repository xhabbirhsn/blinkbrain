import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { NotesListScreen } from './src/features/notes/screens/NotesListScreen';
import { configureNativeNotifications, NotificationService } from './src/features/reminders/services/notificationService';
import { FlashMessageProvider, useFlashMessage } from './src/shared/components/FlashMessage';

function NotificationBridge() {
  const { show } = useFlashMessage();
  const subRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await configureNativeNotifications();
      await NotificationService.requestPermissions();
      try {
        const Notifications = await import('expo-notifications');
        // Remove any prior
        if (subRef.current) {
          subRef.current.remove();
          subRef.current = null;
        }
        const sub = Notifications.addNotificationReceivedListener((event) => {
          const title = event.request.content.title ?? 'Reminder';
          const body = event.request.content.body ?? 'Reminder received';
          const data = event.request.content.data || {};
          const countdownDuration = data.countdownDuration || 60;
          
          // Parse attachments and code blocks from notification data
          let attachments = [];
          let codeBlocks = [];
          try {
            if (data.attachments && typeof data.attachments === 'string') {
              attachments = JSON.parse(data.attachments);
            }
            if (data.codeBlocks && typeof data.codeBlocks === 'string') {
              codeBlocks = JSON.parse(data.codeBlocks);
            }
          } catch (e) {
            console.error('Failed to parse attachments/codeBlocks', e);
          }
          
          // Show full-screen flash for reminders with note title, content, countdown, attachments, and code blocks
          show({ 
            title, 
            message: body, 
            type: 'info', 
            fullScreen: true,
            countdown: countdownDuration,
            attachments,
            codeBlocks,
          });
        });
        if (mounted) subRef.current = { remove: () => sub.remove() };
      } catch (e) {
        console.error('Failed to attach notification listener', e);
      }
    })();
    return () => {
      mounted = false;
      if (subRef.current) {
        subRef.current.remove();
        subRef.current = null;
      }
    };
  }, [show]);

  return null;
}

export default function App() {
  return (
    <FlashMessageProvider>
      <NotificationBridge />
      <NotesListScreen />
      <StatusBar style="dark" />
    </FlashMessageProvider>
  );
}
