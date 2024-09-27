import { fileURLToPath } from "node:url";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: ["avegacms"],
  alias: {
    "#module/blog": fileURLToPath(new URL("./", import.meta.url)),
  },
  components: [
    {
      path: "#module/blog/components",
      pathPrefix: false,
    },
  ],
});
