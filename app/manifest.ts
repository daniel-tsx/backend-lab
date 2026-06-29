import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Backend Architecture Lab",
    short_name: "Backend Lab",
    description:
      "A personal backend architecture learning cockpit — concepts, labs, system design, and spaced review.",
    start_url: "/",
    display: "standalone",
    background_color: "#14161e",
    theme_color: "#14161e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
