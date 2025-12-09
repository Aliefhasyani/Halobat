



**Halobat** adalah platform E-Commerce Farmasi dan Telemedisin cerdas yang mengintegrasikan AI untuk memudahkan manajemen data obat, diagnosa pengguna, serta rekomendasi pengobatan.

Proyek ini menggunakan arsitektur *Headless*, memisahkan **Backend API**  dan **Frontend** .

##  Teknologi yang Digunakan



##  Instalasi & Konfigurasi

Proyek ini terdiri dari dua bagian utama: `Halobat` (Backend) dan `Frontend`.


## 1. Setup Laravel

Masuk ke direktori backend:
```bash
cd Halobat
````

1.  **Instal Dependensi PHP:**

    ```bash
    composer install
    ```

2.  **Konfigurasi Environment:**
    Salin file contoh `.env` dan sesuaikan konfigurasi database:

    ```bash
    cp .env.example .env
    ```

   

3.  **Generate Key & JWT Secret:**

    ```bash
    php artisan key:generate
    php artisan jwt:secret
    ```

4.  **Migrasi & Seeding Database:**

    ```bash
    php artisan migrate --seed
    ```

5.  **Jalankan Localhost API:**

    ```bash
    php artisan serve
    ```

    

### 2\. Setup Frontend 

Buka terminal baru dan masuk ke direktori frontend:

```bash
cd Frontend
```

1.  **Instal Dependensi Node:**

    ```bash
    npm install
    ```

2.  **Konfigurasi Environment:**
    Buat file `.env.local` 

    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000/api
    ```

3.  **Jalankan Server Development:**

    ```bash
    npm run dev
    ```

   

-----

##  Dokumentasi API Endpoint

Berikut adalah ringkasan endpoint utama yang tersedia di `routes/api.php`.

### Autentikasi (JWT)

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/register` | Mendaftar pengguna baru |
| `POST` | `/api/login` | Login dan mendapatkan Token JWT |
| `POST` | `/api/logout` | Logout (Invalidasi Token) |

### Fitur Utama

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | Chat dengan AI Assistant |
| `POST` | `/api/upload-image` | Upload gambar (Obat/Resep) |
| `GET`  | `/api/profile` | Mendapatkan profil user login |
| `PUT`  | `/api/profile` | Update profil user |

### Manajemen Obat (Resource)

Endpoint berikut mendukung operasi CRUD standar (`index`, `store`, `show`, `update`, `destroy`):

  - **Drugs**: `/api/drugs` (Data Obat utama)
  - **Manufacturers**: `/api/manufacturers` (Pabrik Obat)
  - **Dosage Forms**: `/api/dosage-forms` (Bentuk Sediaan: Tablet, Sirup, dll)
  - **Active Ingredients**: `/api/active-ingredients` (Bahan Aktif)
  - **Brands**: `/api/brands` (Merek Dagang)

### Administrasi

  - **Users**: `/api/users` (Manajemen Pengguna)
  - **Roles**: `/api/roles` (Manajemen Hak Akses)

-----

##  Struktur Database

Berdasarkan rancangan ERD, sistem ini mengelola entitas berikut:

  - **Users & Roles**: Sistem pengguna dengan role (Admin, User, dll).
  - **Diagnoses**: Riwayat diagnosa dan gejala pengguna.
  - **Drugs Catalog**:
      - `Drugs`: Tabel utama obat.
      - `Brands`: Merek obat.
      - `Manufacturers`: Produsen.
      - `Active Ingredients`: Kandungan obat (Relasi *Many-to-Many* dengan Drugs).
      - `Dosage Forms`: Bentuk obat.
  - **Recommended Drugs**: Obat yang disarankan berdasarkan diagnosa.



