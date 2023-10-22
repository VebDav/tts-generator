import { rgbToHex } from "./utility.js"
/*
 * Calculate the relative luminance of a color
 * The relative luminance is calculated using the RGB values of a color.
 */
function getLuminance(r, g, b) {
  let RsRGB = r / 255
  let GsRGB = g / 255
  let BsRGB = b / 255

  let R =
    RsRGB <= 0.03928 ? RsRGB / 12.92 : Math.pow((RsRGB + 0.055) / 1.055, 2.4)
  let G =
    GsRGB <= 0.03928 ? GsRGB / 12.92 : Math.pow((GsRGB + 0.055) / 1.055, 2.4)
  let B =
    BsRGB <= 0.03928 ? BsRGB / 12.92 : Math.pow((BsRGB + 0.055) / 1.055, 2.4)

  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

/*
 * Calculate the contrast ratio
 * The contrast ratio is calculated using the relative luminance of the two colors being compared.
 */
function getContrastRatio(lum1, lum2) {
  let L1 = Math.max(lum1, lum2)
  let L2 = Math.min(lum1, lum2)
  return (L1 + 0.05) / (L2 + 0.05)
}

export function getOptimalTextColor(r, g, b) {
  const bgColorLuminance = getLuminance(r, g, b)

  // Determine if the background color is light or dark
  const isLightBackground = bgColorLuminance > 0.5

  let optimalColor
  if (isLightBackground) {
    // If the background is light, start with black and lighten the color if necessary
    optimalColor = { r: 0, g: 0, b: 0 }
  } else {
    // If the background is dark, start with white and darken the color if necessary
    optimalColor = { r: 255, g: 255, b: 255 }
  }

  let contrastRatio = getContrastRatio(
    bgColorLuminance,
    getLuminance(optimalColor.r, optimalColor.g, optimalColor.b)
  )

  // Adjust the text color lightness until we achieve the desired contrast ratio
  while (contrastRatio < 4.5) {
    if (isLightBackground) {
      optimalColor.r += 10
      optimalColor.g += 10
      optimalColor.b += 10
    } else {
      optimalColor.r -= 10
      optimalColor.g -= 10
      optimalColor.b -= 10
    }

    // Recalculate the contrast ratio after the adjustment
    contrastRatio = getContrastRatio(
      bgColorLuminance,
      getLuminance(optimalColor.r, optimalColor.g, optimalColor.b)
    )
  }

  // Convert the RGB object to a hex color string
  return rgbToHex(optimalColor.r, optimalColor.g, optimalColor.b)
}
