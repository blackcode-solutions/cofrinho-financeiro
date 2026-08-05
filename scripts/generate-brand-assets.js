const sharp = require('sharp');

const W = 1284;
const H = 2778;
const pigPath = 'assets/images/pig/splash-pig-transparent.png';
const bg = '#16A34A';

async function main() {
  const pigSize = 520;
  const pig = await sharp(pigPath)
    .resize(pigSize, pigSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const svg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bg}"/>
    <text x="50%" y="62%" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="92" fill="#FFFFFF">Cofrinho</text>
    <text x="50%" y="66.5%" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="400" font-size="42" fill="#FFFFFF" opacity="0.95">Economize sem sofrimento</text>
  </svg>`);

  const pigTop = Math.round(H * 0.32 - pigSize / 2);
  const pigLeft = Math.round((W - pigSize) / 2);

  await sharp(svg)
    .composite([{ input: pig, top: pigTop, left: pigLeft }])
    .png()
    .toFile('assets/images/splash.png');

  const iconPig = await sharp(pigPath)
    .resize(720, 720, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 22, g: 163, b: 74, alpha: 1 },
    },
  })
    .composite([{ input: iconPig, top: 152, left: 152 }])
    .png()
    .toFile('assets/images/icon.png');

  await sharp('assets/images/icon.png').resize(1024, 1024).toFile('assets/images/adaptive-icon.png');

  await sharp(pigPath).resize(96, 96).png().toFile('assets/images/favicon.png');

  const splashPig = await sharp(pigPath)
    .resize(420, 420, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: splashPig, top: 46, left: 46 }])
    .png()
    .toFile('assets/images/splash-icon.png');

  console.log('assets generated');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
