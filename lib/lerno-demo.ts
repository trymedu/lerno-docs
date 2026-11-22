import { defineDocument } from '@medu/lerno';

/** Dokümantasyonda canlı gömülen örnek içerik belgesi. */
export const demoDocument = defineDocument({
  id: 'lerno-demo',
  type: 'lesson',
  metadata: {
    title: 'Lerno Örnek Dersi',
    description: 'Fonksiyon, soru, bilgi ve dallanan akış içeren doğrusal akış.',
    subject: 'Matematik',
    grade: 10,
  },
  scoring: { mode: 'sum', passingRatio: 0.5 },
  nodes: [
    {
      id: 'intro',
      type: 'slide',
      title: 'Fonksiyonun Grafiği',
      blocks: [
        { type: 'text', markdown: 'f(x) = x² fonksiyonunu adım adım çizelim.' },
        { type: 'heading', text: 'Parabol', level: 2 },
        { type: 'callout', tone: 'info', body: 'Katsayı a pozitifse kollar yukarı açılır; tepe noktası orjinindedir.' },
      ],
    },
    {
      id: 'q1',
      type: 'question',
      item: {
        kind: 'multiple-choice',
        prompt: 'f(x) = x² için f(2) kaçtır?',
        choices: [
          { id: 'a', label: '2', misconception: 'Kare alma unutuldu' },
          { id: 'b', label: '4' },
          { id: 'c', label: '8' },
        ],
        correct: ['b'],
      },
      feedback: { correct: 'Doğru! 2² = 4', incorrect: 'Kare almayı unutma.' },
    },
    {
      id: 'summary',
      type: 'info',
      title: 'Özet',
      panels: [
        { title: 'Karesel fonksiyon', body: 'f(x) = x² her zaman negatif olmayan değer üretir; grafiği paraboldür.' },
        { title: 'Simetri', body: 'Grafik y eksenine göre simetriktir.' },
      ],
      next: 'fork',
    },
    {
      id: 'fork',
      type: 'branch',
      prompt: 'Hangi konuya geçmek istersin?',
      choices: [
        { id: 'phys', label: 'Fizik: Eğik atış', target: 'physics' },
        { id: 'chem', label: 'Kimya: Molekül', target: 'chemistry' },
      ],
    },
    {
      id: 'physics',
      type: 'slide',
      title: 'Eğik Atış',
      blocks: [
        { type: 'text', markdown: 'Aynı menzile farklı açılarla ulaşılabilir.' },
        { type: 'callout', tone: 'warning', body: 'Menzil, hızın karesi ile orantılıdır: v² sin(2θ) / g.' },
      ],
    },
    {
      id: 'chemistry',
      type: 'slide',
      title: 'Molekül Geometrisi',
      blocks: [
        { type: 'heading', text: 'Karbon dioksit — doğrusal', level: 2 },
        { type: 'text', markdown: 'Merkezde karbon, iki çift bağlı oksijen; bağ açısı 180° ile doğrusal bir dizilir.' },
      ],
    },
    {
      id: 'q2',
      type: 'question',
      item: {
        kind: 'fill-blanks',
        prompt: 'Boşlukları doldur.',
        text: 'x² ifadesinin türevi {{0}}x, integrali ise x³/{{1}} olur.',
        blanks: [
          { accepted: ['2'], caseSensitive: false },
          { accepted: ['3'], caseSensitive: false },
        ],
      },
    },
    {
      id: 'cards',
      type: 'cards',
      mode: 'flip',
      title: 'Hızlı tekrar',
      cards: [
        { id: 'c1', front: 'f(x) = x² türevi', back: '2x' },
        { id: 'c2', front: 'sin²x + cos²x', back: '1' },
        { id: 'c3', front: 'π radyan', back: '180°' },
      ],
    },
  ],
});
