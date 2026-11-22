import {
  branchingScenario,
  cardsDeck,
  coursePresentation,
  hotspotImage,
  infoPage,
  interactiveBook,
  interactiveVideo,
  questionSet,
  virtualLab,
  type LernoDocument,
  type QuestionItemInput,
} from '@medu/lerno';

/**
 * Docs onizlemelerinde kullanilan tek bir gorsel tanimi.
 * Hazır, gruplanmış bir katalog tutulmaz; her görsel düz bir kayıttır.
 */
export interface VisualDemoSpec {
  /** Onizlemede gorunecek gorselin kimligi. */
  id: string;
  /** Belge başlığında görünen ad. */
  label: string;
  /** Gorselin calistirilacagi parametreler. */
  params: Record<string, unknown>;
}

/**
 * Docs örnek sayfalarındaki görsel gömülerinin tek kaynağı.
 *
 * Her kayıt bir `VisualDemoSpec`'tir; disiplin adı, özet veya hiyerarşi
 * tutulmaz. Sayfa düzeni ve gruplama meta.json üzerinden sağlanır.
 */
export const visualSpecs: VisualDemoSpec[] = [
    { id: 'function-graph', label: 'Fonksiyon grafiği', params: { preset: 'cubic', durationMs: 1600, samples: 120 } },
    { id: 'triangle', label: 'Dinamik üçgen', params: { sideA: 3, sideB: 4, angleDeg: 90 } },
    { id: 'unit-circle', label: 'Birim çember', params: { angleDeg: 135 } },
    { id: 'solid', label: '3B cisim', params: { shape: 'cube', size: 1, spin: true, durationMs: 6000 } },
    { id: 'distribution', label: 'Normal dağılım', params: { mean: 0, stdDev: 1, xMin: -4, xMax: 4 } },
    { id: 'chart', label: 'Veri grafiği', params: { kind: 'bar', labels: ['Mat', 'Fiz', 'Kim', 'Biy'], values: [78, 65, 82, 70], durationMs: 1400 } },
    { id: 'sorting', label: 'Sıralama algoritması', params: { algorithm: 'bubble', values: [5, 2, 9, 1, 6, 3], durationMs: 2400 } },
    { id: 'projectile', label: 'Eğik atış', params: { v0: 30, angleDeg: 45, g: 9.8, h0: 0 } },
    { id: 'pendulum', label: 'Sarkaç', params: { length: 1.5, gravity: 9.8, initialAngleDeg: 30, damping: 0.2, durationMs: 2400 } },
    { id: 'wave', label: 'İlerleyen dalga', params: { amplitude: 1, wavelength: Math.PI, frequency: 1, samples: 160, durationMs: 2000 } },
    {
      id: 'orbit',
      label: 'Yörünge',
      params: {
        star: 'Güneş',
        durationMs: 8000,
        bodies: [
          { name: 'Merkür', radius: 1.4, color: '#94A3B8' },
          { name: 'Venüs', radius: 2.0, color: '#F59E0B' },
          { name: 'Dünya', radius: 2.7, color: '#3B82F6' },
          { name: 'Mars', radius: 3.4, color: '#EF4444' },
        ],
      },
    },
    { id: 'molecule', label: 'Molekül geometrisi', params: { preset: 'methane' } },
    { id: 'bohr-atom', label: 'Bohr atom modeli', params: { atomicNumber: 11 } },
    { id: 'dna', label: 'DNA çift sarmalı', params: { pairs: 12, radius: 70, spacing: 26, durationMs: 2400 } },
    { id: 'punnett', label: 'Punnett karesi', params: { parent1: 'Aa', parent2: 'Aa' } },
    { id: 'cell', label: 'Hücre modeli', params: { kind: 'plant' } },
    { id: 'climograph', label: 'İklim grafiği', params: { city: 'Akdeniz', durationMs: 1400 } },
    {
      id: 'map-coordinates',
      label: 'Koordinat haritası',
      params: {
        durationMs: 1600,
        markers: [
          { name: 'İstanbul', lat: 41, lon: 29, color: '#3B82F6' },
          { name: 'Ankara', lat: 39.9, lon: 32.9, color: '#10B981' },
          { name: 'Londra', lat: 51.5, lon: -0.1, color: '#F59E0B' },
        ],
      },
    },
    { id: 'water-cycle', label: 'Su döngüsü', params: { durationMs: 3200 } },
    {
      id: 'morphology',
      label: 'Morfoloji',
      params: {
        word: 'evlerimizden',
        meaning: 'ev → çoğul → iyelik → ayrılma',
        parts: [
          { text: 'ev', type: 'root' },
          { text: 'ler', type: 'derivation' },
          { text: 'imiz', type: 'inflection' },
          { text: 'den', type: 'inflection' },
        ],
      },
    },
    {
      id: 'syntax-tree',
      label: 'Sözdizim ağacı',
      params: {
        sentence: 'Ali kitabı okudu.',
        nodes: [
          { id: 's', label: 'Cümle', parent: null },
          { id: 'np', label: 'Özne', parent: 's', role: 'özne' },
          { id: 'ali', label: 'Ali', parent: 'np' },
          { id: 'vp', label: 'Yüklem grubu', parent: 's' },
          { id: 'obj', label: 'Nesne', parent: 'vp', role: 'belirtili nesne' },
          { id: 'kitab', label: 'kitabı', parent: 'obj' },
          { id: 'v', label: 'okudu', parent: 'vp', role: 'yüklem' },
        ],
      },
    },
];

/**
 * Görsel kimliği → tek görseli içeren canlı belge.
 *
 * Docs'taki gömüler bu kayıtları okur; `VisualDemo` bunları `engine`
 * bloğu olarak oynatır.
 */

const mc = (prompt: string): QuestionItemInput => ({
  kind: 'multiple-choice',
  prompt,
  choices: [
    { id: 'a', label: 'x²', misconception: 'Kare alma karıştırıldı' },
    { id: 'b', label: '2x' },
    { id: 'c', label: 'x/2' },
  ],
  correct: ['b'],
});

const MAP_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420"><rect width="800" height="420" fill="#1E293B"/><path d="M120 300 L300 120 L520 180 L700 320 L520 360 Z" fill="#334155" stroke="#475569"/><text x="40" y="60" fill="#94A3B8" font-size="24">Anadolu Haritası</text></svg>',
)}`;

/** İçerik tipi galerisi — her preset için bir belge. */
export const contentTypeDemos: Record<string, LernoDocument> = {
  'question-set': questionSet('ct-question-set', { title: 'Soru Seti' }, [mc('f(x) = x² türevi nedir?'), { kind: 'true-false', prompt: 'Türev eğimi verir.', correct: true }]),
  'course-presentation': coursePresentation('ct-course', { title: 'Slayt Sunumu' }, [
    { title: 'Giriş', blocks: [{ type: 'heading', text: 'Türev', level: 2 }, { type: 'text', markdown: 'Anlık değişim oranı.' }] },
    { title: 'Kural', blocks: [{ type: 'callout', tone: 'info', body: 'x^n türevi n·x^(n−1)' }] },
  ]),
  'interactive-book': interactiveBook('ct-book', { title: 'Bölümlü Okuma' }, [
    { title: 'Bölüm 1', blocks: [{ type: 'text', markdown: 'Limit kavramı.' }] },
    { title: 'Bölüm 2', blocks: [{ type: 'text', markdown: 'Süreklilik.' }] },
  ]),
  'interactive-video': interactiveVideo(
    'ct-video',
    { title: 'Zaman Damgalı Video' },
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    [
      { id: 'va1', atMs: 3000, kind: 'info', label: 'Alev cephesi', body: 'Bu noktada video durur ve kısa bir bilgi gösterir; devam düğmesiyle sürer.' },
      { id: 'va2', atMs: 7000, kind: 'question', label: 'Dur ve cevapla', item: { kind: 'true-false', prompt: 'Video bu noktada duraklatıldı.', correct: true } },
      { id: 'va3', atMs: 11000, kind: 'pause', label: 'Duraklatma', body: 'Üçüncü anchor bir duraklatma noktasıdır.' },
    ],
  ),
  'branching-scenario': branchingScenario('ct-branch', { title: 'Dallanan Senaryo' }, [
    { id: 'start', type: 'info', panels: [{ title: 'Başlangıç', body: 'Bir yol seç.' }], next: 'fork' },
    {
      id: 'fork',
      type: 'branch',
      prompt: 'Hangi yolu seçersin?',
      choices: [
        { id: 'good', label: 'Doğru yol', target: 'end-good' },
        { id: 'bad', label: 'Zor yol', target: 'end-bad', tag: 'zor' },
      ],
    },
    { id: 'end-good', type: 'slide', title: 'Doğru yol', blocks: [{ type: 'text', markdown: 'Tebrikler.' }] },
    { id: 'end-bad', type: 'slide', title: 'Zor yol', blocks: [{ type: 'text', markdown: 'Tekrar dene.' }] },
  ]),
  cards: cardsDeck('ct-cards', { title: 'Kartlar' }, [
    { front: 'Türev', back: 'Anlık değişim oranı' },
    { front: 'İntegral', back: 'Birikim / alan' },
    { front: 'Limit', back: 'Yaklaşma değeri' },
    { front: 'Süreklilik', back: 'Tanım kümesinde kopma olmaması' },
    { front: 'Teğet', back: 'Bir noktadaki yerel eğim' },
    { front: 'Kritik nokta', back: 'Türevin sıfır olduğu yer' },
  ], 'flip'),
  hotspot: hotspotImage(
    'ct-hotspot',
    { title: 'Görsel Hotspot' },
    'map',
    [
      { id: 'h1', x: 0.32, y: 0.34, label: 'Ankara', body: 'İç Anadolu', correct: true },
      { id: 'h2', x: 0.55, y: 0.55, label: 'Tuz Gölü', body: 'Kapalı havza gölü', correct: true },
      { id: 'h3', x: 0.2, y: 0.62, label: 'Ege kıyısı', body: 'Kıyı ovaları', correct: true },
      { id: 'h4', x: 0.78, y: 0.3, label: 'Doğu dağları', body: 'Yüksek plato', correct: true },
      { id: 'h5', x: 0.6, y: 0.2, label: 'Karadeniz kıyısı', body: 'Yağışlı kuşak', correct: false },
    ],
    'find',
    { assets: [{ id: 'map', kind: 'image', src: MAP_SVG }] },
  ),
  'info-page': infoPage('ct-info', { title: 'Bilgi Sayfası' }, [
    { title: 'Kural', body: 'x^n türevi n·x^(n−1)' },
    { title: 'Örnek', body: 'x³ türevi 3x²' },
  ]),
  'virtual-lab': virtualLab('ct-lab', { title: 'Sanal Laboratuvar' }, {
    setup: 'Sarkaç: L = 1.5 m, g = 9.8 m/s², başlangıç açısı 30°.',
    steps: [
      { instruction: 'Uzunluğu yarıya indirip periyodu gözlemleyin.', question: { kind: 'equation', prompt: 'Periyot formülünü yazın.', accepted: ['2*pi*sqrt(L/g)'] } },
      { instruction: 'Sönümlemeyi artırıp genliği izleyin.' },
    ],
  }),
};
