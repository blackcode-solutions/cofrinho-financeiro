import { useEffect, useState } from 'react';
import { Text, StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';

type Props = {
  endsAt: string | Date;
  onComplete?: () => void;
  large?: boolean;
  showUnits?: boolean;
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function CountdownTimer({ endsAt, onComplete, large, showUnits }: Props) {
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

  const digitStyle: StyleProp<TextStyle> = [styles.timer, large && styles.large];

  if (!showUnits) {
    return (
      <Text style={digitStyle}>
        {pad(h)}:{pad(m)}:{pad(s)}
      </Text>
    );
  }

  return (
    <View style={styles.row}>
      <UnitBlock value={pad(h)} label="horas" digitStyle={digitStyle} />
      <Text style={digitStyle}>:</Text>
      <UnitBlock value={pad(m)} label="minutos" digitStyle={digitStyle} />
      <Text style={digitStyle}>:</Text>
      <UnitBlock value={pad(s)} label="segundos" digitStyle={digitStyle} />
    </View>
  );
}

function UnitBlock({
  value,
  label,
  digitStyle,
}: {
  value: string;
  label: string;
  digitStyle: StyleProp<TextStyle>;
}) {
  return (
    <View style={styles.unit}>
      <Text style={digitStyle}>{value}</Text>
      <Text style={styles.unitLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  unit: {
    alignItems: 'center',
  },
  unitLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
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
