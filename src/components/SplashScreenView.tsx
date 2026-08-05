import { View, Text, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const SPLASH_GREEN = '#16A34A';

type Props = {
  /** Keep visible a bit longer for branded feel */
  showTagline?: boolean;
};

export function SplashScreenView({ showTagline = true }: Props) {
  return (
    <View style={styles.container} accessibilityLabel="Tela inicial do Cofrinho">
      <StatusBar style="light" />
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/pig/splash-pig-transparent.png')}
          style={styles.pig}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <Text style={styles.brand}>Cofrinho</Text>
        {showTagline ? (
          <Text style={styles.tagline}>Economize sem sofrimento</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: -24,
  },
  pig: {
    width: 196,
    height: 196,
  },
  brand: {
    marginTop: 28,
    fontFamily: 'Inter_700Bold',
    fontSize: 40,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  tagline: {
    marginTop: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.95,
  },
});
