import {
  PregnancyGuidance,
  ProductRiskLevel,
  type AdditiveDetails,
} from '@/features/additives/contracts';

export const ADDITIVE_CATALOG: readonly AdditiveDetails[] = [
  {
    code: 'E-202',
    name: 'Sorbato de potasio',
    category: 'Conservante',
    riskLevel: ProductRiskLevel.CAUTION,
    pregnancyGuidance: PregnancyGuidance.CAUTION,
    description: 'Conservante utilizado para limitar el crecimiento de mohos y levaduras.',
    uses: 'Panadería, quesos, bebidas y productos vegetales preparados.',
    healthImpact: 'La evidencia disponible respalda límites de ingesta regulados.',
    lowDoseEffects: 'No se esperan efectos adversos dentro de los límites autorizados.',
    highDoseEffects: 'Puede causar irritación o molestias digestivas en personas sensibles.',
    pregnancyNotes: 'Consulta con un profesional si necesitas una recomendación personalizada.',
    sources: ['EFSA', 'Reglamento (CE) 1333/2008'],
    lastReviewedAt: '2026-08-20',
  },
  {
    code: 'E-330',
    name: 'Ácido cítrico',
    category: 'Regulador de acidez',
    riskLevel: ProductRiskLevel.LOW,
    pregnancyGuidance: PregnancyGuidance.SUITABLE,
    description: 'Ácido orgánico presente de forma natural en frutas cítricas.',
    uses: 'Bebidas, conservas, dulces y alimentos procesados.',
    healthImpact: 'Se considera de baja preocupación en los usos alimentarios autorizados.',
    lowDoseEffects: 'No se esperan efectos adversos en el consumo alimentario habitual.',
    highDoseEffects: 'Una exposición concentrada puede irritar la boca o el estómago.',
    pregnancyNotes: 'No se han identificado restricciones específicas en usos alimentarios.',
    sources: ['EFSA', 'JECFA'],
    lastReviewedAt: '2026-07-14',
  },
  {
    code: 'E-250',
    name: 'Nitrito de sodio',
    category: 'Conservante',
    riskLevel: ProductRiskLevel.HIGH,
    pregnancyGuidance: PregnancyGuidance.AVOID,
    description: 'Conservante empleado principalmente en carnes curadas.',
    uses: 'Embutidos y productos cárnicos curados.',
    healthImpact: 'Su evaluación depende de la dosis, la frecuencia y el contexto dietético.',
    lowDoseEffects: 'Los límites legales reducen el riesgo, pero conviene moderar el consumo.',
    highDoseEffects: 'Una exposición elevada puede afectar al transporte de oxígeno en sangre.',
    pregnancyNotes: 'Ingredia aplica una presentación más estricta durante el embarazo.',
    sources: ['EFSA', 'OMS'],
    lastReviewedAt: '2026-08-02',
  },
];

export function findAdditive(code: string): AdditiveDetails | undefined {
  return ADDITIVE_CATALOG.find((additive) => additive.code.toLowerCase() === code.toLowerCase());
}
