import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });
mkdirSync("dist/assets", { recursive: true });
copyFileSync("index.html", "dist/index.html");
copyFileSync("assets/profile-portrait.png", "dist/assets/profile-portrait.png");
