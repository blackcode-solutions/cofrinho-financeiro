import { Link, Stack } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { Screen } from '@/src/components/ui';
import { colors } from '@/src/theme/tokens';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Screen title="Página não encontrada">
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Voltar ao início</Text>
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  link: { marginTop: 12 },
  linkText: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },
});
