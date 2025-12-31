# Personal Site (Next.js + TypeScript)\r
\r
Local photos + MDX blog with interactive React tools.\r
\r
## Quick start\r
\r
```bash\r
npm install\r
npm run dev\r
```\r
\r
Open http://localhost:3000\r
\r
## Authoring\r
\r
- Photos (albums)\r
  - Put images under `public/photos/<album>/`\r
  - Optional: `public/photos/<album>/captions.json` mapping filename -> caption\r
  - Generate manifest:\r
    ```bash\r
    npm run generate:albums\r
    ```\r
  - Optional curation: `content/photos/albums.json` to set title/description/order/cover\r
\r
- Blog (MDX)\r
  - Create folder `content/blog/<slug>/index.mdx`\r
  - Frontmatter:\r
    ```md\r
    ---\r
    title: Post title\r
    date: 2025-11-13\r
    summary: Optional summary\r
    tags: [tag1, tag2]\r
    draft: false\r
    ---\r
    ```\r
  - Embed React tools directly: `<DemoCounter />`\r
\r
## Commands\r
\r
- `npm run dev` — Start dev server\r
- `npm run build` — Production build\r
- `npm start` — Start production server\r
- `npm run generate:albums` — Build photo manifest\r
\r
## Environment\r
\r
Optionally set `NEXT_PUBLIC_SITE_URL` (e.g. in Vercel) for correct sitemap/OG URLs.\r
\r
## Deploy\r
\r
See `docs/DEPLOY.md`.\r
\r
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
