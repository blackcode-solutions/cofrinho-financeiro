import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Rect, Ellipse, Path, G } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Screen, Card, ProgressBar, Button, StatCard } from '@/src/components/ui';
import { useAuthStore } from '@/src/store';
import { api } from '@/src/services/api';
import { colors } from '@/src/theme/tokens';

const W = Dimensions.get('window').width - 40;

function CityScene({
  trees,
  houses,
  lakes,
  plazas,
  buildings,
  monuments,
}: {
  trees: number;
  houses: number;
  lakes: number;
  plazas: number;
  buildings: number;
  monuments: number;
}) {
  const H = 220;
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Rect x={0} y={0} width={W} height={H} rx={20} fill="#E0F2FE" />
      <Ellipse cx={W * 0.5} cy={H * 0.82} rx={W * 0.42} ry={36} fill="#86EFAC" />
      <Ellipse cx={W * 0.5} cy={H * 0.88} rx={W * 0.38} ry={22} fill="#4ADE80" />

      {Array.from({ length: Math.min(lakes, 2) }).map((_, i) => (
        <Ellipse
          key={`lake-${i}`}
          cx={W * (0.28 + i * 0.4)}
          cy={H * 0.72}
          rx={28}
          ry={12}
          fill="#38BDF8"
          opacity={0.85}
        />
      ))}

      {Array.from({ length: Math.min(trees, 8) }).map((_, i) => {
        const x = 30 + i * ((W - 60) / 8);
        return (
          <G key={`tree-${i}`}>
            <Rect x={x + 6} y={H * 0.62} width={6} height={18} fill="#92400E" />
            <Circle cx={x + 9} cy={H * 0.58} r={12} fill="#16A34A" />
          </G>
        );
      })}

      {Array.from({ length: Math.min(houses, 6) }).map((_, i) => {
        const x = 40 + i * 48;
        const y = H * 0.48;
        return (
          <G key={`house-${i}`}>
            <Rect x={x} y={y} width={34} height={28} rx={4} fill="#FFF7ED" />
            <Path d={`M${x - 4} ${y} L${x + 17} ${y - 16} L${x + 38} ${y} Z`} fill="#F97316" />
            <Rect x={x + 12} y={y + 12} width={10} height={16} fill="#92400E" />
          </G>
        );
      })}

      {Array.from({ length: Math.min(plazas, 3) }).map((_, i) => (
        <Circle
          key={`plaza-${i}`}
          cx={W * (0.35 + i * 0.15)}
          cy={H * 0.7}
          r={10}
          fill="#FDE68A"
        />
      ))}

      {Array.from({ length: Math.min(buildings, 4) }).map((_, i) => {
        const x = W * 0.55 + i * 28;
        const h = 40 + i * 10;
        return (
          <Rect
            key={`b-${i}`}
            x={x}
            y={H * 0.7 - h}
            width={22}
            height={h}
            rx={3}
            fill="#64748B"
          />
        );
      })}

      {monuments > 0 ? (
        <G>
          <Rect x={W * 0.48} y={H * 0.35} width={14} height={50} fill="#F59E0B" />
          <Circle cx={W * 0.48 + 7} cy={H * 0.33} r={10} fill="#FBBF24" />
        </G>
      ) : null}
    </Svg>
  );
}

export default function CidadeScreen() {
  const profile = useAuthStore((s) => s.profile);

  const { data: city } = useQuery({
    queryKey: ['city', profile?.id],
    queryFn: () => api.getCity(profile!.id),
    enabled: !!profile,
  });

  if (!profile) return null;

  const c = city ?? {
    trees: 0,
    houses: 0,
    lakes: 0,
    plazas: 0,
    buildings: 0,
    monuments: 0,
    next_build_progress: 0,
  };

  const inhabitants = c.houses * 3 + c.buildings * 8 + c.monuments * 20;

  return (
    <Screen title="Minha Cidade" subtitle="Cada meta concluída constrói um pedaço.">
      <Card padded={false}>
        <CityScene {...c} />
      </Card>

      <View style={styles.row}>
        <StatCard label="Casas" value={String(c.houses)} />
        <StatCard label="Árvores" value={String(c.trees)} />
      </View>
      <View style={styles.row}>
        <StatCard label="Habitantes" value={String(inhabitants)} />
        <StatCard label="Monumentos" value={String(c.monuments)} />
      </View>

      <Card>
        <Text style={styles.next}>Próxima construção</Text>
        <ProgressBar progress={c.next_build_progress} />
        <Text style={styles.hint}>
          Guarde dinheiro e evite impulsos para desbloquear árvores, casas, lagos e prédios.
        </Text>
      </Card>

      <Button title="Voltar" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  next: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.text,
    marginBottom: 10,
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
    marginTop: 10,
    lineHeight: 20,
  },
});
