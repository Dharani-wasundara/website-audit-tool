import fs from "fs";
import https from "https";

const url = "https://reactbits.dev/r/PixelBlast-JS-CSS.json";

const data = await new Promise((resolve, reject) => {
  https
    .get(url, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(d));
      res.on("error", reject);
    })
    .on("error", reject);
});

const j = JSON.parse(data);
fs.mkdirSync("components/PixelBlast", { recursive: true });

for (const f of j.files) {
  if (f.path.endsWith(".css")) {
    fs.writeFileSync("components/PixelBlast/PixelBlast.css", f.content);
    continue;
  }
  if (!f.path.endsWith(".jsx")) continue;

  let c = f.content;
  c = `'use client';\n${c}`;
  c = c.replace(
    /^import \{ useEffect, useRef \} from 'react';/m,
    "import { useEffect, useRef, type CSSProperties } from 'react';"
  );

  c = c.replace(
    /const PixelBlast = \(\{/,
    `export type PixelBlastProps = {
  variant?: 'square' | 'circle' | 'triangle' | 'diamond';
  pixelSize?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
  antialias?: boolean;
  patternScale?: number;
  patternDensity?: number;
  liquid?: boolean;
  liquidStrength?: number;
  liquidRadius?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleIntensityScale?: number;
  rippleThickness?: number;
  rippleSpeed?: number;
  liquidWobbleSpeed?: number;
  autoPauseOffscreen?: boolean;
  speed?: number;
  transparent?: boolean;
  edgeFade?: number;
  noiseAmount?: number;
};

const PixelBlast = ({`
  );

  c = c.replace(
    /noiseAmount = 0\n\}\) => \{/,
    "noiseAmount = 0\n}: PixelBlastProps) => {"
  );

  fs.writeFileSync("components/PixelBlast/PixelBlast.tsx", c);
}

console.log("Wrote components/PixelBlast/PixelBlast.css and PixelBlast.tsx");
