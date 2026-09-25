# Sarinah Talent Pool UI — Angular

Frontend Talent Pool menggunakan Angular dan tetap dibundel ke dalam Spring Boot.

## Struktur

```text
src/main/frontend/
├── angular.json
├── package.json
├── proxy.conf.json
├── tsconfig.json
├── tsconfig.app.json
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.css
    └── app/
        ├── app.component.ts
        ├── app.config.ts
        ├── app.routes.ts
        ├── core/
        │   ├── guard/
        │   ├── interceptor/
        │   ├── models/
        │   └── service/api/
        └── features/
            ├── auth/
            ├── public/
            ├── candidate/
            └── backoffice/
```

## Development

Jalankan backend Spring Boot di port 8004, lalu:

```bash
cd src/main/frontend
npm install
npm start
```

Buka:

```text
http://localhost:4200/sarinah-talent-pool/
```

Angular dev server mem-proxy request `/sarinah-talent-pool/api/**` ke Spring Boot port 8004.

## Production build

```bash
npm run build
```

Output Angular langsung ditulis ke:

```text
src/main/resources/static/
```

Folder static existing seperti `images/` dipertahankan.

## Build satu JAR

Dari root project:

```bash
mvn clean package
```

Maven menjalankan Node/npm + Angular build sebelum Spring Boot membuat JAR.
