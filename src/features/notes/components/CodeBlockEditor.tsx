import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassButton, GlassInput, GlassModal } from '../../../shared/components';
import { CodeBlock } from '../../../domain/models/Note';
import { theme } from '../../../shared/theme/tokens';
import { generateUUID } from '../../../shared/utils/uuid';

interface CodeBlockEditorProps {
  codeBlocks: CodeBlock[];
  onAddCodeBlock: (codeBlock: CodeBlock) => void;
  onRemoveCodeBlock: (codeBlockId: string) => void;
}

const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'html',
  'css',
  'sql',
  'bash',
  'json',
  'markdown',
];

export const CodeBlockEditor: React.FC<CodeBlockEditorProps> = ({
  codeBlocks,
  onAddCodeBlock,
  onRemoveCodeBlock,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const handleAddCodeBlock = () => {
    if (!code.trim()) return;

    const newCodeBlock: CodeBlock = {
      id: generateUUID(),
      language,
      code: code,
      addedAt: Date.now(),
    };

    onAddCodeBlock(newCodeBlock);
    setCode('');
    setLanguage('javascript');
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Code Blocks</Text>
        <GlassButton
          onPress={() => setIsModalVisible(true)}
          variant="secondary"
          size="sm"
        >
          {'</>'} Add Code
        </GlassButton>
      </View>

      {codeBlocks.length > 0 && (
        <View style={styles.codeBlocksList}>
          {codeBlocks.map((block) => (
            <View key={block.id} style={styles.codeBlockItem}>
              <View style={styles.codeBlockHeader}>
                <Text style={styles.languageLabel}>{block.language}</Text>
                <Pressable
                  onPress={() => onRemoveCodeBlock(block.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </Pressable>
              </View>
              <ScrollView style={styles.codeScrollView} nestedScrollEnabled showsVerticalScrollIndicator={true}>
                <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={true}>
                  <Text style={styles.codeText}>{block.code}</Text>
                </ScrollView>
              </ScrollView>
            </View>
          ))}
        </View>
      )}

      <GlassModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setCode('');
          setLanguage('javascript');
        }}
        title="Add Code Block"
      >
        <ScrollView 
          style={styles.modalScrollView}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Language</Text>
            
            <Pressable
              onPress={() => {
                console.log('Dropdown clicked, current state:', showLanguagePicker);
                setShowLanguagePicker(!showLanguagePicker);
              }}
              style={styles.languageDropdown}
            >
              <View style={styles.dropdownInner}>
                <Text style={styles.selectedLanguage}>{language}</Text>
                <Text style={styles.dropdownArrow}>{showLanguagePicker ? '▲' : '▼'}</Text>
              </View>
            </Pressable>

            {showLanguagePicker && (
              <View style={styles.languagePickerContainer}>
                <ScrollView 
                  style={styles.languagePicker} 
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="always"
                >
                  {LANGUAGES.map((lang) => (
                    <Pressable
                      key={lang}
                      onPress={() => {
                        console.log('Language selected:', lang);
                        setLanguage(lang);
                        setShowLanguagePicker(false);
                      }}
                      style={[
                        styles.languageOption,
                        language === lang && styles.languageOptionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.languageOptionText,
                          language === lang && styles.languageOptionTextSelected,
                        ]}
                      >
                        {lang}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={[styles.modalLabel, { marginTop: theme.spacing.md }]}>Code</Text>
            
            <View style={styles.codeInputContainer}>
              <ScrollView 
                style={styles.codeScrollContainer}
                nestedScrollEnabled
                keyboardShouldPersistTaps="always"
              >
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="Paste or type your code here..."
                  placeholderTextColor={theme.colors.text.tertiary}
                  multiline
                  style={styles.codeInputField}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  textAlignVertical="top"
                  scrollEnabled={false}
                />
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <GlassButton
                onPress={() => {
                  setIsModalVisible(false);
                  setCode('');
                  setLanguage('javascript');
                }}
                variant="outline"
                style={styles.modalButton}
              >
                Cancel
              </GlassButton>
              <GlassButton
                onPress={handleAddCodeBlock}
                variant="primary"
                style={styles.modalButton}
              >
                Add
              </GlassButton>
            </View>
          </View>
        </ScrollView>
      </GlassModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  codeBlocksList: {
    gap: theme.spacing.md,
  },
  codeBlockItem: {
    backgroundColor: theme.colors.glass.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  codeBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  languageLabel: {
    color: theme.colors.accent.info,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    textTransform: 'uppercase',
  },
  removeButton: {
    padding: theme.spacing.xs,
  },
  removeButtonText: {
    color: theme.colors.accent.error,
    fontSize: theme.typography.sizes.md,
  },
  codeScrollView: {
    maxHeight: 300,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.sizes.sm * 1.5,
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    paddingBottom: theme.spacing.xl,
  },
  modalLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.sm,
  },
  languageDropdown: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.glass.primary,
  },
  dropdownInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
  },
  selectedLanguage: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    textTransform: 'capitalize',
  },
  dropdownArrow: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.sm,
  },
  languagePickerContainer: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginBottom: theme.spacing.md,
    maxHeight: 200,
    backgroundColor: theme.colors.glass.secondary,
  },
  languagePicker: {
    maxHeight: 200,
  },
  languageOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  languageOptionSelected: {
    backgroundColor: theme.colors.accent.primary + '20',
  },
  languageOptionText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.md,
    textTransform: 'capitalize',
  },
  languageOptionTextSelected: {
    color: theme.colors.accent.primary,
    fontWeight: theme.typography.weights.semibold,
  },
  codeInputContainer: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.glass.primary,
    height: 500,
  },
  codeScrollContainer: {
    flex: 1,
  },
  codeInputField: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.sizes.sm * 1.6,
    padding: theme.spacing.md,
    minHeight: 500,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
