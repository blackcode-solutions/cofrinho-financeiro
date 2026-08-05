import type { Insight, Purchase, Saving } from '@/src/types';
import { formatCurrency } from './finance';

export function generateInsights(
  purchases: Purchase[],
  savings: Saving[],
  streak: number,
): Insight[] {
  const insights: Insight[] = [];

  const deliveryFri = purchases.filter((p) => {
    const d = new Date(p.created_at);
    return p.category === 'Delivery' && d.getDay() === 5;
  });
  if (deliveryFri.length >= 2) {
    const avg =
      deliveryFri.reduce((s, p) => s + Number(p.amount), 0) / deliveryFri.length;
    insights.push({
      id: 'delivery-friday',
      title: 'Delivery nas sextas',
      body: `Você costuma pedir delivery toda sexta. Se cozinhar hoje, economiza cerca de ${formatCurrency(avg)}.`,
      type: 'tip',
    });
  }

  const avoided = purchases.filter((p) => p.status === 'avoided');
  const avoidedSum = avoided.reduce((s, p) => s + Number(p.amount), 0);
  if (avoidedSum > 0) {
    insights.push({
      id: 'avoided-total',
      title: 'Impulsos evitados',
      body: `Você já economizou ${formatCurrency(avoidedSum)} deixando de comprar por impulso.`,
      type: 'celebration',
    });
  }

  const savedSum = savings.reduce((s, p) => s + Number(p.amount), 0);
  if (savedSum > 0) {
    insights.push({
      id: 'saved-total',
      title: 'Dinheiro guardado',
      body: `Seu cofrinho já tem ${formatCurrency(savedSum)}. Continue assim.`,
      type: 'celebration',
    });
  }

  if (streak >= 3) {
    insights.push({
      id: 'streak',
      title: `${streak} dias de sequência`,
      body: 'Abrir o app todo dia fortalece o hábito. Não quebre a corrente.',
      type: 'tip',
    });
  } else if (streak === 0) {
    insights.push({
      id: 'streak-risk',
      title: 'Volte amanhã',
      body: 'Uma visita rápida mantém sua sequência e seu cofrinho feliz.',
      type: 'warning',
    });
  }

  const impulse = purchases.filter((p) => p.decision === 'impulse' && p.status === 'bought');
  if (impulse.length >= 3) {
    insights.push({
      id: 'impulse-warn',
      title: 'Modo Tentação',
      body: 'Antes da próxima compra grande, use o Modo Tentação e veja o custo em horas de trabalho.',
      type: 'warning',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'welcome',
      title: 'Comece guardando',
      body: 'Registre seu primeiro depósito e o Cofrinho começa a evoluir com você.',
      type: 'tip',
    });
  }

  return insights;
}
