import { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '@/src/theme/tokens';

type Props = {
  endsAt: string | Date;
  onComplete?: () => void;
  large?: boolean;
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function CountdownTimer({ endsAt, onComplete, large }: Props) {
  const end = typeof endsAt === 'string' ? new Date(endsAt).getTime() : endsAt.getTime();
  const [left, setLeft] = useState(Math.max(0, end - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      const next = Math.max(0, end - Date.now());
      setLeft(next);
      if (next <= 0) {
        clearInterval(id);
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [end, onComplete]);

  const totalSec = Math.floor(left / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  return (
    <Text style={[styles.timer, large && styles.large]}>
      {pad(h)}:{pad(m)}:{pad(s)}
    </Text>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    color: '#fff',
    letterSpacing: 2,
  },
  large: {
    fontSize: 48,
  },
});
