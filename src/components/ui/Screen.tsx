import { SafeAreaView, ScrollView, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/tokens';

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  style?: ViewStyle;
  right?: React.ReactNode;
  dark?: boolean;
};

export function Screen({
  children,
  title,
  subtitle,
  scroll = true,
  style,
  right,
  dark,
}: Props) {
  const content = (
    <View style={[styles.inner, style]}>
      {(title || right) && (
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            {title ? (
              <Text style={[styles.title, dark && { color: '#fff' }]}>{title}</Text>
            ) : null}
            {subtitle ? (
              <Text style={[styles.subtitle, dark && { color: '#BBF7D0' }]}>{subtitle}</Text>
            ) : null}
          </View>
          {right}
        </View>
      )}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, dark && { backgroundColor: '#14532D' }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 40,
  },
  inner: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: colors.text,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
});
