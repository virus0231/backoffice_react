import { chartColors, areaGradientIds } from '@/components/charts/configs/areaChartConfig';

describe('Chart config', () => {
  it('defines required gradient ids', () => {
    expect(areaGradientIds.primary).toBeTruthy();
    expect(areaGradientIds.comparison).toBeTruthy();
    expect(areaGradientIds.primary).not.toEqual(areaGradientIds.comparison);
  });

  it('uses expected color palette', () => {
    expect(chartColors.primary.stroke).toMatch(/^#/);
    expect(chartColors.comparison.stroke).toMatch(/^#/);
    expect(chartColors.primary.fillFrom).toContain('rgba');
    expect(chartColors.primary.fillTo).toContain('rgba');
  });
});

