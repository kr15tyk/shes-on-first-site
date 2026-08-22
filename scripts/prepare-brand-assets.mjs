import sharp from 'sharp';

const source = new URL(
  '../assets/brand/shes-on-first-logo-transparent.png',
  import.meta.url,
).pathname;
const logoOutput = new URL('../public/sof-logo.png', import.meta.url).pathname;
const faviconOutput = new URL('../public/favicon.png', import.meta.url).pathname;

const logo = await sharp(source)
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({
    top: 24,
    right: 24,
    bottom: 24,
    left: 24,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .resize({ width: 1600, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toBuffer();

await sharp(logo).toFile(logoOutput);
await sharp(logo)
  .resize(256, 256, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png({ compressionLevel: 9 })
  .toFile(faviconOutput);

console.log(`Prepared ${logoOutput} and ${faviconOutput}`);
