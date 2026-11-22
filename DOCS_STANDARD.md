# Lerno Dokümantasyon Standardı

Bu dosya, `apps/lerno-docs` içeriğinin yazım kuralıdır. Bağlayıcıdır: bir sayfa ile bu dosya
çeliştiğinde sayfa düzeltilir. Yeni bir terim veya biçim kararı gerekirse önce buraya eklenir, sonra
sayfa yazılır.

Yapı doğrulaması: `lib/i18n.ts` içinde `parser` belirtilmemiştir, yani varsayılan `dot` geçerlidir.
İngilizce varsayılan dildir (`defaultLanguage: 'en'`) ve bu nedenle İngilizce dosyalar uzantısız
(`page.mdx`, `/docs/...`), Türkçe dosyalar `.tr.mdx` uzantılıdır (`/tr/docs/...`). `source.config.ts`
yoktur; frontmatter şeması `lib/source.ts` içindeki `defineDocs({ docs: { schema: pageSchema } })` ile
gelir.

## 1. Dil Kaydı

Metin, bir teknik referanstır. Nesnel ve tanımlayıcıdır; öznel değerlendirme taşımaz. Kavramsal
paragraflarda kişisel hitap kullanılmaz, üçüncü şahıs veya edilgen yapı tercih edilir. Doğrudan talimat
içeren prosedürel adımlarda hitap şekli kullanılır.

Yasak:
- Ünlem işareti.
- Küçümseyici zarflar: "kolayca", "basitçe", "sadece".
- Gündelik bağlaçlar: "yani", "işte", "aslında".
- Uzun çizgi (`—`). Yerine iki nokta, nokta veya virgül kullanılır; tire yalnızca bileşik
  sözcüklerde ve aralıklarda (`2018-2026`) bulunur.
- Pekiştireç: "gerçekten", "kesinlikle", "çok".
- Retorik soru başlıkları.
- Emoji.

Zorunlu:
- Neden-sonuç ilişkisi açık bağlaçla kurulur: "bu nedenle", "dolayısıyla", "aksi hâlde".
- Kod bloğundan önce bağlam cümlesi bulunur; kod doğrudan başlamaz.
- Bir paragraf tek bir fikri işler.

## 2. Hitap Şekli

**Seçim: "siz".**

- Prosedürel adımlarda `-iniz/-ınız` emir eki kullanılır: "Aşağıdaki komutu çalıştırınız."
- Kavramsal ve tanımlayıcı paragraflarda hitap kullanılmaz: "Yetkilendirme katmanı gelen isteği bir
  belirteç üzerinden doğrular."
- Aynı belgede kısa emir formu ("çalıştırın") ile uzun form ("çalıştırınız") karıştırılmaz.

İngilizce metinde aynı ayrım geçerlidir: prosedürde "Run the following command.", kavramda "The model
does not know the view."

## 3. Terminoloji

### 3.1 Çevrilmeyen terimler

`endpoint`, `middleware`, `hook`, `props`, `build`, `commit`, `push`, `pull request`, `renderer`,
`runtime`, `kernel`, `widget`, `token`, `layout`, `morphology`, `syntax tree`.

### 3.2 Çevrilen terimler

| İngilizce | Türkçe |
| --- | --- |
| installation | Kurulum |
| getting started | Başlarken |
| configuration | Yapılandırma |
| authentication | Kimlik Doğrulama |
| authorization | Yetkilendirme |
| deployment | Dağıtım |
| environment variable | Ortam Değişkeni |
| request / response | İstek / Yanıt |
| scene graph | Sahne Grafiği |
| render tree | Render Ağacı |
| content type | İçerik Tipi |

### 3.3 Çelişkili çiftler — seçim

| Çift | Seçilen |
| --- | --- |
| kurulum / yükleme | kurulum |
| ayar / yapılandırma / konfigürasyon | yapılandırma |
| çağırmak / invoke etmek | çağırmak |
| düğüm / node | Sahne grafiği öğesi için "düğüm"; belge öğesi (`LernoNodeSchema`) için "node" |
| kip / mod | mod |

### 3.4 Kısaltmalar

API, JSON, URL, SDK, SVG, WebGL orijinal yazımıyla korunur. İlk geçişte açık hâli verilir
("Uygulama Programlama Arayüzü (API)"), sonraki geçişlerde kısaltma kullanılır. Çoğul ek kesme
işaretiyle ayrılır: "API'ler".

## 4. Başlık Biçimi

- Başlıklar isim tamlamasıdır: "Kurulum", "Kimlik Doğrulama Akışı".
- Soru cümlesi başlık kullanılmaz.
- Emir kipi başlık kullanılmaz. Bölüm başlığı "Sıfırdan Kurulum" olur, "Sıfırdan Yapın" olmaz.
- Yalnızca ilk harf büyük yazılır; İngilizce'de Title Case kullanılmaz.
- Belirsiz başlık ("Ek Bilgiler", "Diğer") kullanılmaz.

## 5. Kod ve Yorumlar

- Kod blokları iki dilde birebir aynıdır; bu nedenle yorumlar tek bir dilde, İngilizce yazılır.
- Yorumlar nesnel ve kısa tutulur; gündelik ifade kullanılmaz.
- Değişken ve tip adları çevrilmez.
- Örnek gömülerinde (embed) gezinme şeridi gösterilmez. `LernoPlayer` yalnızca belge birden çok node
  içerdiğinde ilerleme çubuğunu ve Geri/İleri düğmelerini çizer; tek node'lu örnekler sade çizilir.

## 6. Bilgi Mimarisi

Sayfa ağacı tümdengelimlidir. Üst düzey başlıklar sırayla şunlardır: Başlarken, Felsefe, Temel Kavramlar,
Kernel'ler, İçerik Tipleri, Değerlendirme, 3B Sahne, Extension Sistemi. Arayüz iki layout sekmesinden
oluşur: **Lerno** (bu bölümler) ve **Lerno React** (`root: true` klasör, kendi sidebar'ı).

- Kök dizin sayfası bulunmaz. `/docs` adresi Başlarken sayfasına yönlendirilir (`next.config.mjs`
  `redirects`); dokümantasyon ilk sayfadan başlar.
- Sekmeler `app/[lang]/docs/layout.tsx` içinde `tabs` dizisiyle tanımlanır ve fumadocs'un layout-tab
açılır menüsü olarak çizilir. `tabMode: 'top'` kullanılmaz: bu sürümde üst bar `<main>` ile aynı grid
  hücresine düşer ve içeriği örter.
- Her bölüm ayrı bir üst düzey başlıktır. Birden çok bölümü tek bir üst klasörde toplamak yasaktır
  (ör. "Lerno Çekirdeği" gibi bir sarmalayıcı açılmaz).
- URL'de bölüm öneki bulunmaz: sayfa `/docs/kernels/...` yolundadır, `/docs/lerno/kernels/...` değildir.
- Sidebar derinliği için üst sınır yoktur; gruplama okunabilirliğe göre yapılır.
- Tek sayfalık klasör açılmaz; klasör en az iki sayfa içerir.
- Önkoşul zinciri olan sayfalar `meta.json` içinde elle sıralanır.
- Her klasörün `index.mdx` dosyası en az bir kavramsal paragraf içerir; salt bağlantı listesi olamaz.
- Türkçe ve İngilizce `meta.json` aynı sırayı ve aynı slug kümesini taşır.

## 7. Değişiklik Kontrol Listesi

- [ ] Başlık isim tamlaması mı, soru veya emir değil mi?
- [ ] Kavramsal paragraflarda hitap yok mu?
- [ ] Prosedürel adımlarda "siz" çekimi tutarlı mı?
- [ ] Yasaklı sözcük (kolayca, sadece, yani, gerçekten, ünlem) yok mu?
- [ ] Kod bloğundan önce bağlam cümlesi var mı?
- [ ] Terimler §3 tablosuna uygun mu?
- [ ] İki dildeki karşılık da güncellendi mi?
- [ ] `meta.json` (tr ve en) sıralaması aynı mı?
