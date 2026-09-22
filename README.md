# MyPortfolio

Portfolio of a UI/UX engineer passionate about crafting intuitive digital experiences — an immersive 3D workspace you explore by scrolling.

Built with **Next.js 16**, **React Three Fiber**, **GSAP** (ScrollTrigger, SplitText, ScrambleText) and **Lenis**, exported as a static site for GitHub Pages.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Edit content

All text lives in [`src/data/content.ts`](src/data/content.ts): profile, experience, education, achievements, skills, projects (including the full case-study copy) and certificates.

| To add | Put the file in | Then set |
| --- | --- | --- |
| Resume PDF | `public/resume.pdf` | nothing — the Resume button already points there |
| Hero portrait (transparent PNG/WebP works best) | `public/images/hero/portrait.webp` | nothing, or change `profile.heroImage` |
| 3D model of you (`.glb`) | `public/models/amandi.glb` | nothing — it replaces the placeholder figure automatically |
| Project cover / screenshots | `public/images/projects/…` | `cover` / `gallery` on the project |
| Certificate image | `public/images/certificates/…` | `image` on the certificate |

## How it works

- **3D room** — `src/components/three/`: a procedurally built cyberpunk workspace (desk, monitors, research wall, skills hologram, project + certificate walls, night city through the window). No 3D model files to download.
- **Camera** — `CameraRig.tsx` flies between one pose per section as you scroll; case-study pages park it at the monitors.
- **Sound** — `src/lib/sound.ts` synthesizes every sound live with the Web Audio API (no audio files).
- **Performance** — quality auto-detects per device (LOW / MED / HIGH, switchable bottom-left) and drops automatically if the frame rate falls. Phones get a lighter scene without post-processing.

## Deploy to GitHub Pages

1. In the repo on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and publishes the site.

The site is served at `https://<user>.github.io/<repo-name>/` — the base path is set automatically from the repository name (a `<user>.github.io` repo is served from the root).
