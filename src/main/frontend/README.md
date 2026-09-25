# Sarinah Talent Pool UI

Source React/Vite untuk Candidate Portal dan Back Office.

## Development

Pastikan Spring Boot berjalan di port 8004, lalu:

```bash
cd src/main/frontend
npm install
npm run dev
```

Buka:

```text
http://localhost:5173/sarinah-talent-pool/
```

Request API dan image dengan prefix `/sarinah-talent-pool` diproxy oleh Vite ke Spring Boot port 8004.

## Production build

```bash
npm run build
```

Output Vite langsung ditulis ke:

```text
src/main/resources/static/
```

sehingga frontend ikut di dalam JAR Spring Boot.
