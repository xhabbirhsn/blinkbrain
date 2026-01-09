import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View, Dimensions, Image, ScrollView } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type FlashType = 'info' | 'success' | 'warning' | 'error';

interface NoteAttachment {
  id: string;
  type: 'image' | 'file';
  uri: string;
  fileName?: string;
}

interface CodeBlock {
  id: string;
  language: string;
  code: string;
}

interface FlashOptions {
  title?: string;
  message: string;
  type?: FlashType;
  durationMs?: number;
  countdown?: number; // Countdown in seconds
  attachments?: NoteAttachment[];
  codeBlocks?: CodeBlock[];
}

interface FlashContextValue {
  show: (options: FlashOptions) => void;
  isVisible: boolean;
}

const FlashMessageContext = createContext<FlashContextValue | undefined>(undefined);

export function FlashMessageProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<FlashType>('info');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [countdown, setCountdown] = useState<number | undefined>(undefined);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [triggerTime, setTriggerTime] = useState<Date | undefined>(undefined);
  const [attachments, setAttachments] = useState<NoteAttachment[]>([]);
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const colors = useMemo(() => ({
    info: '#2f80ed',
    success: '#27ae60',
    warning: '#f2994a',
    error: '#eb5757',
  }), []);

  const hide = useCallback(() => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, [opacity, scale]);

  const show = useCallback((opts: FlashOptions & { fullScreen?: boolean }) => {
    const { title: t, message: m, type: ty = 'info', durationMs = 2500, fullScreen = false, countdown: cd, attachments: att = [], codeBlocks: cb = [] } = opts;
    setTitle(t);
    setMessage(m);
    setType(ty);
    setIsFullScreen(fullScreen);
    setCountdown(cd);
    setRemainingSeconds(cd || 0);
    setTriggerTime(new Date());
    setAttachments(att);
    setCodeBlocks(cb);
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    
    // Animate in
    opacity.setValue(0);
    scale.setValue(0.9);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 400,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        useNativeDriver: true,
      }),
    ]).start();
    
    // Start countdown if provided
    if (cd && cd > 0) {
      countdownInterval.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            if (countdownInterval.current) {
              clearInterval(countdownInterval.current);
              countdownInterval.current = null;
            }
            // Hide after countdown completes
            setTimeout(() => hide(), 500);
          }
          return Math.max(0, next);
        });
      }, 1000);
    } else {
      // Use durationMs for auto-hide if no countdown
      hideTimer.current = setTimeout(() => hide(), durationMs);
    }
  }, [hide, opacity, scale]);

  const value = useMemo(() => ({ show, isVisible: visible }), [show, visible]);

  return (
    <FlashMessageContext.Provider value={value}>
      {children}
      {visible ? (
        isFullScreen ? (
          <Animated.View 
            pointerEvents="box-none" 
            style={[
              styles.fullScreenOverlay,
              {
                opacity,
                transform: [{ scale }],
              }
            ]}
          >
            <Pressable 
              style={styles.backdrop}
              onPress={() => hide()}
            />

            <View style={styles.fullScreenContent} pointerEvents="auto">
              <View style={styles.cardWrapper}>
                <ScrollView 
                  style={styles.cardScrollView}
                  contentContainerStyle={styles.cardScrollContent}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled
                >
                  <View style={styles.card}>
                    {countdown && countdown > 0 && (
                      <View style={styles.countdownBadge}>
                        <Text style={styles.countdownValue}>{remainingSeconds}</Text>
                      </View>
                    )}
                    
                    <Text style={styles.fullScreenEmoji}>⏰</Text>
                    <Text style={styles.fullScreenTitle}>{title || 'Reminder'}</Text>
                    <Text style={styles.fullScreenMessage}>{message}</Text>
                    
                    {/* Attachments */}
                    {attachments && attachments.length > 0 && (
                      <View style={styles.attachmentsSection}>
                        <Text style={styles.sectionTitle}>Attachments</Text>
                        {attachments.map((att) => (
                          att.type === 'image' ? (
                            <Image
                              key={att.id}
                              source={{ uri: att.uri }}
                              style={styles.attachmentImage}
                              resizeMode="contain"
                            />
                          ) : (
                            <View key={att.id} style={styles.fileAttachment}>
                              <Text style={styles.fileName}>📎 {att.fileName || 'File'}</Text>
                            </View>
                          )
                        ))}
                      </View>
                    )}
                    
                    {/* Code Blocks */}
                    {codeBlocks && codeBlocks.length > 0 && (
                      <View style={styles.codeBlocksSection}>
                        <Text style={styles.sectionTitle}>Code</Text>
                        {codeBlocks.map((block) => (
                          <View key={block.id} style={styles.codeBlockContainer}>
                            <Text style={styles.codeLanguage}>{block.language}</Text>
                            <ScrollView 
                              style={styles.codeScrollView} 
                              nestedScrollEnabled
                              showsVerticalScrollIndicator={true}
                            >
                              <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={true}>
                                <Text style={styles.codeText}>{block.code}</Text>
                              </ScrollView>
                            </ScrollView>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    <View style={styles.dismissHint}>
                      <Text style={styles.dismissText}>Tap anywhere to dismiss</Text>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Animated.View>
        ) : (
          <View pointerEvents="none" style={styles.overlay}>
            <Animated.View
              style={[
                styles.container,
                { transform: [{ translateY }], backgroundColor: colors[type] },
              ]}
            >
              {title ? <Text style={styles.title}>{title}</Text> : null}
              <Text style={styles.text}>{message}</Text>
            </Animated.View>
          </View>
        )
      ) : null}
    </FlashMessageContext.Provider>
  );
}

export function useFlashMessage(): FlashContextValue {
  const ctx = useContext(FlashMessageContext);
  if (!ctx) throw new Error('useFlashMessage must be used within FlashMessageProvider');
  return ctx;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // Leave space for status bar on Android
    paddingTop: Platform.OS === 'android' ? 28 : 16,
    zIndex: 1000,
  },
  container: {
    marginHorizontal: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  text: {
    color: '#fff',
    fontSize: 14,
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  fullScreenContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  cardWrapper: {
    position: 'relative',
    width: SCREEN_WIDTH - 48,
    maxWidth: 420,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  cardScrollView: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  cardScrollContent: {
    flexGrow: 1,
  },
  card: {
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    paddingHorizontal: 32,
    paddingVertical: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 32,
    elevation: 12,
  },
  fullScreenEmoji: {
    fontSize: 40,
    marginBottom: 20,
  },
  fullScreenTitle: {
    color: '#1a1a1a',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  timeText: {
    color: '#999',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  fullScreenMessage: {
    color: '#555',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  dismissHint: {
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  dismissText: {
    color: '#999',
    fontSize: 13,
    fontWeight: '500',
  },
  countdownBadge: {
    position: 'absolute',
    top: 16,
    right: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  countdownValue: {
    color: '#999',
    fontSize: 20,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  countdownLabel: {
    color: '#999',
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countdownContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  attachmentsSection: {
    width: '100%',
    marginTop: 24,
  },
  sectionTitle: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'left',
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
  },
  fileAttachment: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    color: '#555',
    fontSize: 14,
  },
  codeBlocksSection: {
    width: '100%',
    marginTop: 24,
  },
  codeBlockContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  codeLanguage: {
    color: '#4ec9b0',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  codeScrollView: {
    maxHeight: 400,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#d4d4d4',
    fontSize: 13,
    lineHeight: 20,
  },
});

export default FlashMessageProvider;
