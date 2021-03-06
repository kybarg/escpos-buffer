import { Filter } from '.'
import { PNG } from 'pngjs'

export default class FloydSteinberg implements Filter {
  process(image: PNG): PNG {
    const width = image.width
    const height = image.height
    const new_data = image.data.slice()
    const pixel = new Map<string, number>()
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = image.data.readUIntBE(y * width * 4 + x * 4, 4)
        const red = (color >> 16) & 0xFF
        const green = (color >> 8) & 0xFF
        const blue = color & 0xFF
        let gray = Math.trunc(red * 0.3 + green * 0.59 + blue * 0.11)
        // Add errors to color if there are
        if (pixel.has(`${x}_${y}`)) {
            gray += pixel.get(`${x}_${y}`)
        }
        const new_color = gray > 127 ? 0xFF : 0
        new_data[y * width * 4 + x * 4 + 0] = 0         // alpha
        new_data[y * width * 4 + x * 4 + 1] = new_color // red
        new_data[y * width * 4 + x * 4 + 2] = new_color // green
        new_data[y * width * 4 + x * 4 + 3] = new_color // blue
        const error = gray - (new_color & 0xFF)
        if (x + 1 < width) {
          const prev = pixel.has(`${x + 1}_${y}`) ? pixel.get(`${x + 1}_${y}`) : 0
          const value = prev + (error * 7 >> 4)
          pixel.set(`${x + 1}_${y}`, value)
        }
        // if we are in the last line
        if (y == height - 1) {
            continue
        }
        if (x > 0) {
          const prev = pixel.get(`${x - 1}_${y + 1}`)
          pixel.set(`${x - 1}_${y + 1}`, prev + (error * 3 >> 4))
        }
        const prev = pixel.has(`${x}_${y + 1}`) ? pixel.get(`${x}_${y + 1}`) : 0
        pixel.set(`${x}_${y + 1}`, prev + (error * 5 >> 4))
        if (x < width - 1) {
          pixel.set(`${x + 1}_${y + 1}`, 0 + (error * 1 >> 4))
        }
      }
    }
    image.data = new_data
    return image
  }
}
