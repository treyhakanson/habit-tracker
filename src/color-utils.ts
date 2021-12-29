interface ColorBands {
  p25: string;
  p50: string;
  p75: string;
}

function percentilesForColor(channel: Array<number>): [number, number, number] {
  const quarter = Math.floor(channel.length / 4);
  const r25 =
    channel.slice(0, quarter + 1).reduce((x, y) => x + y, 0) / quarter;
  const r50 =
    channel.slice(quarter, quarter * 3 + 1).reduce((x, y) => x + y, 0) /
    (quarter * 2);
  const r75 =
    channel.slice(quarter * 3, channel.length).reduce((x, y) => x + y, 0) /
    quarter;
  return [Math.round(r25), Math.round(r50), Math.round(r75)];
}

export function colorBandsForEmoji(emoji: string): ColorBands {
  const canvas = document.createElement("canvas");
  canvas.width = 80;
  canvas.height = 80;
  const context = canvas.getContext("2d");
  if (context === null) {
    const defaultColor = "rgba(255,255,255,255)";
    return { p25: defaultColor, p50: defaultColor, p75: defaultColor };
  }

  context.font = "50px serif";
  context.fillText(emoji, 10, 50);
  const data = context.getImageData(0, 0, 80, 80).data;

  let rChannel = [];
  let bChannel = [];
  let gChannel = [];
  let aChannel = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (r === 0 && g === 0 && b === 0 && a === 0) {
      continue;
    }

    rChannel.push(data[i]);
    gChannel.push(data[i + 1]);
    bChannel.push(data[i + 2]);
    aChannel.push(data[i + 3]);
  }

  rChannel.sort();
  gChannel.sort();
  bChannel.sort();
  aChannel.sort();

  const [r25, r50, r75] = percentilesForColor(rChannel);
  const [g25, g50, g75] = percentilesForColor(gChannel);
  const [b25, b50, b75] = percentilesForColor(bChannel);
  const [a25, a50, a75] = percentilesForColor(aChannel);

  return {
    p25: `rgba(${r25},${g25},${b25},${a25 / 255})`,
    p50: `rgba(${r50},${g50},${b50},${a50 / 255})`,
    p75: `rgba(${r75},${g75},${b75},${a75 / 255})`,
  };
}
