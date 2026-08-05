import { storage } from '@/src/services/storage';
import { useUiStore } from '@/src/store';
import { colors } from '@/src/theme/tokens';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Slide = {
  key: string;
  titlePlain: string;
  titleAccent: string;
  body: string;
  image: ImageSourcePropType;
};

const slides: Slide[] = [
  {
    key: '1',
    titlePlain: 'Guarde dinheiro',
    titleAccent: 'antes de gastar.',
    body: 'Separe uma parte do seu\n salário e veja seu dinheiro \n render ao longo do tempo.',
    image: require('../../assets/images/onboarding/save.png'),
  },
  {
    key: '2',
    titlePlain: 'Evite compras',
    titleAccent: 'por impulso.',
    body: 'Pense melhor, espere 24h\n e faça escolhas que realmente\n valem a pena.',
    image: require('../../assets/images/onboarding/wait.png'),
  },
  {
    key: '3',
    titlePlain: 'Alcance seus',
    titleAccent: 'sonhos.',
    body: 'Pequenas decisões hoje\n criam grandes conquistas\n amanhã.',
    image: require('../../assets/images/onboarding/goal.png'),
  },
];

const SWIPE_DISTANCE = 56;
const SWIPE_VELOCITY = 500;

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const setOnboardingSeen = useUiStore((s) => s.setOnboardingSeen);

  const item = slides[index];
  const illustrationSize = Math.min(300, Math.round(width * 0.72));
  const isLast = index >= slides.length - 1;

  const finish = useCallback(() => {
    storage.set('onboarding_seen_v2', '1');
    setOnboardingSeen(true);
    router.replace('/(auth)/sign-up');
  }, [setOnboardingSeen]);

  const goNext = useCallback(() => {
    setIndex((current) => Math.min(current + 1, slides.length - 1));
  }, []);

  const goPrev = useCallback(() => {
    setIndex((current) => Math.max(current - 1, 0));
  }, []);

  const next = () => {
    if (isLast) {
      finish();
      return;
    }
    goNext();
  };

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-20, 20])
        .failOffsetY([-25, 25])
        .onEnd((event) => {
          'worklet';
          const wentLeft =
            event.translationX < -SWIPE_DISTANCE || event.velocityX < -SWIPE_VELOCITY;
          const wentRight =
            event.translationX > SWIPE_DISTANCE || event.velocityX > SWIPE_VELOCITY;

          if (wentLeft) {
            runOnJS(goNext)();
          } else if (wentRight) {
            runOnJS(goPrev)();
          }
        }),
    [goNext, goPrev],
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: insets.top + 40,
        paddingBottom: Math.max(insets.bottom, 16) + 28,
      }}
    >
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={{
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 0,
          }}
        >
          <View style={{ paddingHorizontal: 32, alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 30,
                lineHeight: 38,
                color: colors.text,
                textAlign: 'center',
              }}
            >
              {item.titlePlain}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 30,
                lineHeight: 38,
                color: '#16A34A',
                textAlign: 'center',
              }}
            >
              {item.titleAccent}
            </Text>
          </View>

          <View
            style={{
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: 0,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 32,
            }}
          >
            <Image
              source={item.image}
              style={{ width: illustrationSize, height: illustrationSize }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 16,
                lineHeight: 24,
                color: colors.muted,
                textAlign: 'center',
                paddingHorizontal: 4,
                marginTop: 12,
              }}
            >
              {item.body}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>

      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          {slides.map((slide, i) => (
            <View
              key={slide.key}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                marginHorizontal: 4,
                backgroundColor: i === index ? '#16A34A' : '#D1D5DB',
              }}
            />
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={next}
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Começar' : 'Avançar'}
          style={{
            backgroundColor: '#16A34A',
            height: 56,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontFamily: 'Inter_600SemiBold',
            }}
          >
            {isLast ? 'Começar' : 'Avançar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
