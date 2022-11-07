import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteCommonjs, esbuildCommonjs } from "@originjs/vite-plugin-commonjs";

// https://github.com/vitejs/vite/issues/5308#issuecomment-1010652389
export default defineConfig({
  plugins: [viteCommonjs(), react()],
});
