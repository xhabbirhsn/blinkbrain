import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
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

  const handleAddCodeBlock = () => {
    if (!code.trim()) return;

    const newCodeBlock: CodeBlock = {
      id: generateUUID(),
      language,
      code: code.trim(),
      addedAt: Date.now(),
    };

    onAddCodeBlock(newCodeBlock);
    setCode('');
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
              <ScrollView horizontal style={styles.codeScrollView}>
                <Text style={styles.codeText}>{block.code}</Text>
              </ScrollView>
            </View>
          ))}
        </View>
      )}

      <GlassModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Add Code Block"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalLabel}>Language</Text>
          <ScrollView horizontal style={styles.languageSelector}>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang}
                onPress={() => setLanguage(lang)}
                style={[
                  styles.languageChip,
                  language === lang && styles.languageChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.languageChipText,
                    language === lang && styles.languageChipTextSelected,
                  ]}
                >
                  {lang}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <GlassInput
            label="Code"
            value={code}
            onChangeText={setCode}
            placeholder="Paste your code here..."
            multiline
            numberOfLines={10}
            containerStyle={styles.codeInput}
          />

          <View style={styles.modalActions}>
            <GlassButton
              onPress={() => setIsModalVisible(false)}
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
    maxHeight: 200,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.sizes.sm * 1.5,
  },
  modalContent: {
    minHeight: 400,
  },
  modalLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.sm,
  },
  languageSelector: {
    marginBottom: theme.spacing.md,
  },
  languageChip: {
    backgroundColor: theme.colors.glass.secondary,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  languageChipSelected: {
    backgroundColor: theme.colors.accent.primary,
    borderColor: theme.colors.accent.primary,
  },
  languageChipText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.sm,
  },
  languageChipTextSelected: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weights.semibold,
  },
  codeInput: {
    marginBottom: theme.spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
