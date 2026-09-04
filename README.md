# PetPal

PetPal is a pet-care management web application that helps users manage their pets and access pet-care features such as daily care, medicine tracking, pet profiles and a gallery.

## Technology
- HTML5
- CSS3
- JavaScript
- Node.js
- GitHub Actions
- Jenkins
- Docker

## Project structure

```text
PetPal/
├── pages/
│   ├── Chaitanya/     # Main dashboard and pet-management pages
│   ├── atulya/        # Medicine tracker
│   └── bhumika/       # Daily care module
├── tests/              # Automated tests
├── .github/workflows/  # GitHub Actions CI
├── Dockerfile
├── Jenkinsfile
├── package.json
└── server.js
```

## Run locally

Requirements: Node.js 18+.

```bash
npm test
node server.js
```

Then open `http://localhost:3000`.

## CI

GitHub Actions runs automatically on every push and pull request. The CI workflow installs Node.js and runs the automated test suite with `npm test`.

## Docker

Build and run the application:

```bash
docker build -t petpal .
docker run --rm -p 3000:3000 petpal
```

Open `http://localhost:3000`.

## Jenkins

The `Jenkinsfile` defines a pipeline with Checkout, Test and Docker Build stages.
