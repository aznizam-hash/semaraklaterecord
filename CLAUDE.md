# CLAUDE.md

Panduan untuk Claude setiap kali menulis atau menukar kod dalam projek ini.

## 1. Tujuan sistem dan pengguna

Sistem rekod kelewatan pelajar untuk **SMK Mengkarak (SEMARAK)**. Tujuannya supaya proses rekod pelajar lewat di pintu pagar lebih pantas dan kemas berbanding buku log manual.

Pengguna:

| Peranan | Apa yang dibuat |
|---|---|
| Pengawas | Rekod pelajar lewat semasa bertugas di pintu pagar |
| Guru bertugas | Rekod pelajar lewat dan semak senarai pada hari bertugas |
| Guru disiplin | Lihat semua rekod, tindakan susulan, dan laporan |
| Admin (guru yang dilantik) | Urus senarai pelajar dan akaun pengguna |

Ibu bapa **tidak** menggunakan sistem ini. Tiada notifikasi kepada ibu bapa.

Peranti: telefon dan tablet. Semua skrin mesti boleh digunakan dengan satu tangan pada telefon.

Data yang disimpan: nama pelajar, tingkatan, nama kelas, dan no pendaftaran. **Jangan simpan nombor IC, alamat, atau nombor telefon.**

## 2. Teknologi dan sebab

| Lapisan | Pilihan | Sebab |
|---|---|---|
| Frontend | HTML, CSS, JavaScript (vanilla), PWA | Tiada build step. Boleh di-install pada telefon dan tablet dari browser. Mudah diselenggara oleh guru. |
| Backend | Google Apps Script (Web App) | Percuma, sudah ada dalam akaun Google sekolah, dan tiada server untuk diurus. |
| Database | Google Sheets | Guru boleh semak data terus dalam Sheets. Tiada kos tambahan. |
| Deployment kod | `clasp` | Tulis kod Apps Script dalam editor tempatan dan push ke Google. |

Kekangan yang perlu diingat:
- Apps Script tidak boleh daftar service worker dari halaman yang diserve oleh `HtmlService`. Frontend PWA dihoskan secara berasingan (contohnya GitHub Pages), dan Apps Script hanya jadi API.
- Apps Script ada had kuota harian dan masa larian maksimum 6 minit bagi setiap panggilan. Jangan buat loop berat atau baca seluruh sheet untuk satu rekod.
- Google Sheets bukan database transaksi. Elakkan dua pengguna tulis baris yang sama serentak. Guna `LockService` untuk operasi tulis.

## 3. Struktur folder

```
/home/user
├── CLAUDE.md
├── README.md
├── apps-script/          # Kod backend (push guna clasp)
│   ├── .clasp.json       # Jangan commit scriptId sebenar
│   ├── appsscript.json
│   ├── Code.gs           # Entry point doGet / doPost, routing
│   ├── Auth.gs           # Semak identiti dan peranan pengguna
│   ├── Students.gs       # CRUD senarai pelajar
│   ├── Lateness.gs       # Rekod kelewatan
│   ├── Reports.gs        # Laporan dan eksport
│   └── Utils.gs          # Fungsi bantuan (tarikh, validasi)
├── web/                  # Frontend PWA (dihoskan berasingan)
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── sw.js
│   ├── css/
│   ├── js/
│   └── icons/
└── docs/                 # Dokumen reka bentuk dan panduan guru
```

## 4. Peraturan wajib setiap kali tulis kod

### Keselamatan dan data (PDPA 2010)
1. Sheet mesti kekal **private**. Jangan sekali-kali guna "Publish to web" untuk sebarang sheet yang ada data pelajar.
2. Semua semakan kebenaran dibuat di **server** (Apps Script), bukan di frontend sahaja. Setiap endpoint mesti semak peranan pengguna dahulu.
3. Pengesahan pengguna guna akaun Google. Jangan buat sistem login sendiri dengan kata laluan yang disimpan dalam sheet.
4. Sahkan dan bersihkan semua input dari pengguna. Halang formula injection: jika teks bermula dengan `=`, `+`, `-`, atau `@`, tambah `'` di depan sebelum tulis ke sheet.
5. Jangan log data pelajar ke `console.log` atau `Logger.log` kecuali untuk debugging sementara, dan buang sebelum commit.
6. Jangan hardcode `spreadsheetId`, `scriptId`, atau sebarang rahsia dalam kod. Guna `PropertiesService.getScriptProperties()`.

### Kod backend (Apps Script)
7. Setiap tulisan ke sheet guna `LockService.getScriptLock()` dengan timeout.
8. Akses sheet guna `getDataRange().getValues()` sekali, kemudian proses dalam memori. Jangan panggil `getRange()` dalam loop.
9. Tarikh dan masa guna zon `Asia/Kuala_Lumpur`. Paparan tarikh format `DD/MM/YYYY`.
10. Respons API dalam format JSON yang sama: `{ ok: true, data }` atau `{ ok: false, error: "mesej" }`.

### Frontend (PWA)
11. **Mobile first.** Reka untuk skrin 360px dahulu, kemudian tablet.
12. Saiz sasaran sentuhan minimum 44px x 44px.
13. Side gutter 16px. Tiada scroll mendatar pada mana-mana halaman.
14. Teks UI dalam **Bahasa Melayu**. Istilah teknikal kekal dalam English jika memang digunakan begitu (contoh: `dashboard`, `export`).
15. Fungsi rekod kelewatan mesti berfungsi walaupun sambungan internet terputus seketika. Jika belum dilaksanakan, tandakan sebagai TODO dan nyatakan dalam PR.
16. Jangan guna library besar. Utamakan vanilla JS dan CSS biasa.

### Kualiti kod dan proses
17. Ikut gaya kod yang sedia ada. Jika folder kosong, guna nama fungsi `camelCase` dan nama fail mengikut struktur di atas.
18. Komen dalam Bahasa Melayu ringkas, hanya bila logik tidak jelas.
19. Setiap perubahan logik kritikal (kelewatan, kebenaran, eksport) perlu ada ujian atau langkah uji manual yang ditulis dalam `docs/`.
20. Jangan ubah struktur sheet (susunan lajur) tanpa mengemaskini dokumentasi dan skrip migrasi.

## 5. Perkara yang belum diputuskan

Perkara ini mesti disahkan dengan pengguna sebelum kod untuk bahagian berkaitan ditulis:

- **Kaedah login:** Adakah sekolah ada domain Google Workspace (contoh: `@moe-dl.edu.my`)? Jika tiada, pilihan lain perlu dinilai.
- **Hosting frontend:** GitHub Pages atau tempat lain? Siapa yang ada akses untuk deploy?
- **Penyelenggaraan senarai pelajar:** Import dari CSV atau masukkan manual?
- **Laporan:** Format apa yang diperlukan (PDF, Sheets, atau cetakan)?
- **Tempoh simpan data:** Berapa lama rekod kelewatan perlu disimpan sebelum dipadam?

## 6. Andaian semasa

- Satu sekolah sahaja (SMK Mengkarak). Tiada multi-tenant.
- Internet di pintu pagar stabil. Mod offline dijadikan keutamaan kedua.
- Sistem ini hanya untuk rekod kelewatan, bukan kehadiran penuh atau disiplin umum.
