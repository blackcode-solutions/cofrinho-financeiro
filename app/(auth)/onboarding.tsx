import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import { Button, PigCard } from '@/src/components/ui';
import { storage } from '@/src/services/storage';
import { useUiStore } from '@/src/store';
import { colors } from '@/src/theme/tokens';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Guarde dinheiro antes de gastar.',
    body: 'Pague a si mesmo primeiro. O Cofrinho te lembra no dia do salário.',
    visual: 'save' as const,
  },
  {
    key: '2',
    title: 'Evite compras por impulso.',
    body: 'Espere 24 horas antes de comprar. Seu futuro eu agradece.',
    visual: 'wait' as const,
  },
  {
    key: '3',
    title: 'Alcance seus sonhos.',
    body: 'Construa riqueza aos poucos. Cada depósito faz sua cidade crescer.',
    visual: 'goal' as const,
  },
];

export default function OnboardingScreen() {
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const setOnboardingSeen = useUiStore((s) => s.setOnboardingSeen);

  const finish = () => {
    storage.set('onboarding_seen', '1');
    setOnboardingSeen(true);
    router.replace('/(auth)/sign-up');
  };

  const next = () => {
    if (index >= slides.length - 1) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.visual}>
              {item.visual === 'save' && <PigCard stage="baby" size={140} />}
              {item.visual === 'wait' && <Text style={styles.emoji}>🛍️⏱️</Text>}
              {item.visual === 'goal' && <Text style={styles.emoji}>🏝️🏠</Text>}
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Button title={index === slides.length - 1 ? 'Começar' : 'Continuar'} onPress={next} />
        <Button title="Já tenho conta" variant="ghost" onPress={() => {
          storage.set('onboarding_seen', '1');
          setOnboardingSeen(true);
          router.replace('/(auth)/sign-in');
        }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingBottom: 24 },
  slide: {
    paddingHorizontal: 28,
    paddingTop: 80,
    alignItems: 'center',
    gap: 16,
  },
  visual: {
    height: 220,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: { fontSize: 72 },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 34,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
});
