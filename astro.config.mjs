import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";

import { sidebar } from "./src/generated/docs-sidebar.mjs";
import { rehypeBaseLinks } from "./src/lib/rehype-base-links.mjs";

const rawBase = process.env.BASE_PATH ?? "/";
const base = rawBase === "/" ? "/" : `/${rawBase.replace(/^\/|\/$/g, "")}`;
const site = (process.env.SITE_URL ?? "https://www.vizier.rs").replace(/\/$/, "");
const origin = new URL(site).origin;
const ogImage = `${origin}${base === "/" ? "" : base}/og.png`;

export default defineConfig({
  site,
  base,
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "Vizier",
      description: "A digital steward for Your Majesty.",
      favicon: "/favicon.svg",
      components: {
        SiteTitle: "./src/components/site/DocsSiteTitle.astro",
        // Dark only: no stored or system theme, and no picker.
        ThemeProvider: "./src/components/site/DocsNoTheme.astro",
        ThemeSelect: "./src/components/site/DocsNoTheme.astro",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/vizier-lab/vizier",
        },
      ],
      sidebar,
      customCss: ["./src/styles/docs.css"],
      editLink: {
        baseUrl: "https://github.com/vizier-lab/vizier/edit/master/docs/src/",
      },
      lastUpdated: false,
      credits: false,
      disable404Route: true,
      head: [
        {
          tag: "meta",
          attrs: { property: "og:image", content: ogImage },
        },
        {
          tag: "meta",
          attrs: { name: "twitter:card", content: "summary_large_image" },
        },
        {
          tag: "meta",
          attrs: { name: "twitter:image", content: ogImage },
        },
      ],
    }),
    react(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: { theme: "github-dark" },
    processor: unified({
      rehypePlugins: [[rehypeBaseLinks, { base }]],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ["react", "react-dom", "motion"],
    },
    // The design package is linked from the vizier checkout and resolves its
    // own React through lucide-react. Bundle both so `dedupe` above applies in
    // dev as well: an externalised copy renders the server shell with one React
    // and hydrates with another, which reads as "useContext of null".
    ssr: {
      noExternal: ["@vizier/design", "lucide-react"],
    },
    server: {
      fs: { allow: [".."] },
    },
  },
});
