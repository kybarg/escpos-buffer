import Epson from './Epson'
import { Drawer, Style, Cut } from '../Printer'

export default class Elgin extends Epson {

  cutter(mode: Cut): void {
    if (mode == Cut.Full) {
      this.connection.write(Buffer.from('\x1Bw', 'ascii'))
      return
    }
    super.cutter(mode)
  }

  buzzer(): void {
    this.connection.write(Buffer.from('\x1B(A\x04\x00\x01\xFF\x00\xFF', 'ascii'))
  }

  drawer(number: Drawer, on_time: number, _: number): void {
    const index = {
      [Drawer.First]: 'v',
      [Drawer.Second]: 'v',
    }
    const on_time_char = String.fromCharCode(Math.max(Math.min(on_time, 200), 50))
    this.connection.write(Buffer.from('\x1B' + index[number] + on_time_char, 'ascii'))
  }

  protected setStyle(style: Style, enable: boolean): void {
    if (enable) {
      // enable styles
      if (Style.Bold == style) {
        this.connection.write(Buffer.from('\x1BE', 'ascii'))
        return
      }
    } else {
      // disable styles
      if (Style.Bold == style) {
        this.connection.write(Buffer.from('\x1BF', 'ascii'))
        return
      }
    }
    return super.setStyle(style, enable)
  }

  protected setMode(mode: number, enable: boolean): void {
    if (enable) {
      if (mode & Style.DoubleWidth) {
        this.connection.write(Buffer.from('\x1BW\x01', 'ascii'))
      }
      if (mode & Style.DoubleHeight) {
        this.connection.write(Buffer.from('\x1Bd\x01', 'ascii'))
      }
    } else {
      if (mode & Style.DoubleHeight) {
        this.connection.write(Buffer.from('\x1Bd\x00', 'ascii'))
      }
      if (mode & Style.DoubleWidth) {
        this.connection.write(Buffer.from('\x1BW\x00', 'ascii'))
      }
    }
  }

  async qrcode(data: string, size: number) {
    const type = String.fromCharCode(2)
    const error = 'M'
    const _size = String.fromCharCode(Math.min(255, Math.max(1, size || 4)))
    this.connection.write(Buffer.from('\x1Do\x00' + _size + '\x00' + type, 'ascii'))
    this.connection.write(Buffer.from('\x1Dk\x0B' + error + 'A,', 'ascii'))
    this.connection.write(Buffer.from(data, 'ascii'))
    this.connection.write(Buffer.from('\x00', 'ascii'))
  }
}
