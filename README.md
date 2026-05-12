# Pour Down - Yayın Hazırlık Paketi

Bu klasörde Google Play'e yüklemek için gereken eksik dosyalar var.

---

## Dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `manifest.json` | PWA tanım dosyası (oyun adı, ikonlar, renkler). HTML'de zaten referansı vardı, eksikti. |
| `service-worker.js` | Offline çalışma + Google Play'e PWA olarak yüklemek için **şart**. |
| `icon-192.png` | Normal kullanım için 192x192 ikon. |
| `icon-512.png` | Normal kullanım için 512x512 ikon (Play Store da bunu istiyor). |
| `icon-192-maskable.png` | Android adaptif ikon (192). |
| `icon-512-maskable.png` | Android adaptif ikon (512). |

---

## ADIM 1 — Dosyaları aynı klasöre topla

Bilgisayarında bir klasör oluştur (örn: `Masaüstü/pourdown`) ve şunları içine at:

- `pourdown_v1_perf_fix_1.html` (senin oyun dosyan)
- `manifest.json` (buradan)
- `service-worker.js` (buradan)
- 4 adet PNG ikon (buradan)

**ÖNEMLİ:** Tüm dosyalar AYNI klasörde olmalı. Alt klasör yok.

---

## ADIM 2 — HTML'e tek satır ekle (service worker kaydı)

Oyun dosyanı (`pourdown_v1_perf_fix_1.html`) bir metin editöründe aç (Notepad, VS Code, ne kullanıyorsan).

`</body>` etiketinden HEMEN ÖNCE şu kodu yapıştır:

```html
<script>
    // Service Worker kaydı - offline çalışma ve PWA için
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('./service-worker.js')
                .then(function(reg) { console.log('[SW] Kayıt başarılı:', reg.scope); })
                .catch(function(err) { console.warn('[SW] Kayıt başarısız:', err); });
        });
    }
</script>
```

Bu kadar. Oyunun mantığına dokunmuyor, sadece SW'yi kaydediyor.

---

## ADIM 3 — Yerel olarak test et

HTML'i çift tıklayıp açarsan service worker çalışmaz (file:// protokolü desteklemez).
Mutlaka bir HTTP sunucu gerekir. En kolay yol:

**Python ile (Python kuruluysa):**
```bash
cd Masaüstü/pourdown
python -m http.server 8000
```
Sonra tarayıcıda: `http://localhost:8000/pourdown_v1_perf_fix_1.html`

**Veya VS Code "Live Server" eklentisi** — sağ tık → "Open with Live Server".

Tarayıcıda F12 → Console'a bak: `[SW] Kayıt başarılı` yazıyorsa tamam.

---

## ADIM 4 — Web'de yayınla (Google Play öncesi ZORUNLU)

Google Play'e PWA yüklemek için oyun önce **HTTPS bir web adresinde** yayında olmalı.
En ucuz/kolay seçenekler:

### A) GitHub Pages (ücretsiz, önerim)
1. github.com'da hesap aç.
2. Yeni repo oluştur: `pourdown` adında, **Public**.
3. Yukarıdaki tüm dosyaları repo'ya yükle.
4. Repo → Settings → Pages → Source: `main` branch, klasör: `/ (root)` → Save.
5. 1-2 dakika sonra `https://KULLANICI-ADIN.github.io/pourdown/pourdown_v1_perf_fix_1.html` adresinde yayında olur.

### B) Netlify (ücretsiz, drag-drop)
1. netlify.com → hesap aç.
2. "Add new site" → "Deploy manually" → klasörü sürükle-bırak.
3. Anında HTTPS URL verir.

**Bu adımdan sonra oyun web'de yayında olur. Telefonundan açıp test et.**

---

## ADIM 5 — Google Play için APK üret (Bubblewrap ile)

Bu kısım biraz teknik. Web yayını test ettikten sonra birlikte yapacağız.
Özet: Bubblewrap denen ücretsiz Google aracı, web URL'inden APK üretir.
Tek seferlik 25$ Play Console kayıt ücreti var, başka masraf yok.

**Şu an buraya henüz geçme.** Önce ADIM 1-4'ü bitir, çalıştığından emin ol, sonra geri dön.

---

## Reklam (AdMob) hakkında

Mevcut HTML'deki AdMob kodu **placeholder** (sahte, sadece console.log).
PWA olarak Google Play'e yüklediğinde AdMob doğrudan çalışmaz — JavaScript bridge gerekir.
Bu konuyu APK aşamasına geldiğimizde halledeceğiz. **Şimdi dokunma.**

Web sürümünde gelir istiyorsan Google AdSense kullanılabilir ama oyun siteleri için
onay almak zor. itch.io'da "Bağış al" butonu daha gerçekçi bir başlangıç.

---

## Sorun olursa

- Service worker kaydedilmiyor → `http://` veya `https://` üzerinden mi açıyorsun kontrol et. `file://` çalışmaz.
- Manifest hatası → Tarayıcı F12 → Application → Manifest sekmesine bak.
- İkon görünmüyor → Dosya adları tam olarak `icon-192.png`, `icon-512.png` mi? (büyük/küçük harf önemli)
