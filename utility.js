/* validate input for a valide hexcode */
export function isValidHex(input) {
  const hex = input.startsWith("#") ? input.slice(1) : input
  /* return true or false */
  return /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)
}

/* =================== CONVERTER-Functions ===================  */

/* convert a 3-digits hexcode into a 6-digit hexcode */
export function convertToSixDigitHex(input) {
  let hex = input.startsWith("#") ? input.slice(1) : input

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("")
  }

  return "#" + hex
}

/* convert hex to rgb */
export function hexToRgb(input) {
  let hex = input.startsWith("#") ? input.slice(1) : input

  // parse the r, g, b value
  const bigint = parseInt(hex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return { r, g, b }
}

/* convert rgb to hex */
export function rgbToHex(r, g, b) {
  const red = r.toString(16).padStart(2, "0")
  const green = g.toString(16).padStart(2, "0")
  const blue = b.toString(16).padStart(2, "0")

  return "#" + red + green + blue
}

/* convert rgb to cmyk */
export function rgbToCmyk(r, g, b) {
  let c = 1 - r / 255
  let m = 1 - g / 255
  let y = 1 - b / 255
  let k = Math.min(c, Math.min(m, y))

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 } // 100% for black
  }

  c = ((c - k) / (1 - k)) * 100
  m = ((m - k) / (1 - k)) * 100
  y = ((y - k) / (1 - k)) * 100
  k = k * 100

  return {
    c: Math.round(c),
    m: Math.round(m),
    y: Math.round(y),
    k: Math.round(k),
  }
}

/* convert rgb to hsl */
export function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h,
    s,
    l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const delta = max - min
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / delta + 2
        break
      case b:
        h = (r - g) / delta + 4
        break
    }
    h /= 6
  }

  // Rounding for cleaner output
  h = Math.round(h * 360)
  s = Math.round(s * 100)
  l = Math.round(l * 100)

  return { h, s, l }
}

// Function to convert RGB to Hex - this might already be in your utilities
export function rgbStringToHex(rgbString) {
  // This will convert an 'rgb(r, g, b)' string into a hex code
  const parts = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  delete parts[0]
  for (var i = 1; i <= 3; ++i) {
    parts[i] = parseInt(parts[i]).toString(16)
    if (parts[i].length == 1) parts[i] = "0" + parts[i]
  }
  return "#" + parts.join("")
}

/* =================== GENERATOR-Functions ===================  */

/* Generate a random hex color */
export function randomHexColor() {
  const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min)
  const toHex = (num) => num.toString(16).padStart(2, "0")

  const r = randomInt(0, 255)
  const g = randomInt(0, 255)
  const b = randomInt(0, 255)

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/* Calculate shades based on original RGB and percentage */
export function generateShade(rgb, percentage) {
  const shadeClr = (color) =>
    Math.max(0, Math.min(255, Math.round(color * (1 - percentage / 100))))
  return {
    r: shadeClr(rgb.r),
    g: shadeClr(rgb.g),
    b: shadeClr(rgb.b),
  }
}

/* Calculate tones based on original RGB and percentage */
export function generateTone(rgb, percentage) {
  const toneClr = (color) =>
    Math.round(color + (127.5 - color) * (percentage / 100)) // 127.5 is the midpoint of 255, representing gray
  return {
    r: toneClr(rgb.r),
    g: toneClr(rgb.g),
    b: toneClr(rgb.b),
  }
}

/* Calculate tints based on original RGB and percentage */
export function generateTint(rgb, percentage) {
  const tintClr = (color) =>
    Math.max(
      0,
      Math.min(255, Math.round(color + (255 - color) * (percentage / 100)))
    )
  return {
    r: tintClr(rgb.r),
    g: tintClr(rgb.g),
    b: tintClr(rgb.b),
  }
}
