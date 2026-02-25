import { SerialPort } from 'serialport';

export interface PortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  vendorId?: string;
  productId?: string;
}

export interface SerialManagerEvents {
  onData: (data: Uint8Array) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export class SerialManager {
  private port: SerialPort | null = null;
  private events: SerialManagerEvents | null = null;

  async listPorts(): Promise<PortInfo[]> {
    const ports = await SerialPort.list();
    // Filter to only USB/real ports (exclude /dev/ttyS* motherboard ports)
    return ports
      .filter((p) => {
        // Keep ports with a vendor ID (USB devices)
        if (p.vendorId) return true;
        // Keep /dev/ttyACM* and /dev/ttyUSB* (Linux USB serial)
        if (p.path.includes('ttyACM') || p.path.includes('ttyUSB')) return true;
        // Keep COM ports on Windows
        if (p.path.startsWith('COM')) return true;
        // Keep /dev/cu.usb* on macOS
        if (p.path.includes('cu.usb')) return true;
        return false;
      })
      .map((p) => ({
        path: p.path,
        manufacturer: p.manufacturer,
        serialNumber: p.serialNumber,
        pnpId: p.pnpId,
        vendorId: p.vendorId,
        productId: p.productId,
      }));
  }

  async open(
    portPath: string,
    baudRate: number,
    events: SerialManagerEvents
  ): Promise<void> {
    // Close any existing connection first
    if (this.port && this.port.isOpen) {
      await this.close();
    }

    this.events = events;

    return new Promise((resolve, reject) => {
      this.port = new SerialPort(
        {
          path: portPath,
          baudRate,
          autoOpen: false,
        }
      );

      this.port.on('data', (data: Buffer) => {
        this.events?.onData(new Uint8Array(data));
      });

      this.port.on('error', (err: Error) => {
        this.events?.onError(err.message);
      });

      this.port.on('close', () => {
        this.events?.onClose();
      });

      this.port.open((err) => {
        if (err) {
          this.port = null;
          reject(new Error(`Failed to open ${portPath}: ${err.message}`));
          return;
        }
        console.log(`Serial port opened: ${portPath} @ ${baudRate}`);
        resolve();
      });
    });
  }

  async close(): Promise<void> {
    if (!this.port) return;

    return new Promise((resolve) => {
      if (!this.port || !this.port.isOpen) {
        this.port = null;
        resolve();
        return;
      }

      this.port.close((err) => {
        if (err) {
          console.warn('Error closing serial port:', err.message);
        }
        console.log('Serial port closed');
        this.port = null;
        resolve();
      });
    });
  }

  async write(data: Uint8Array): Promise<void> {
    if (!this.port || !this.port.isOpen) {
      throw new Error('Port not open');
    }

    return new Promise((resolve, reject) => {
      this.port!.write(Buffer.from(data), (err) => {
        if (err) {
          reject(new Error(`Write failed: ${err.message}`));
          return;
        }
        this.port!.drain((drainErr) => {
          if (drainErr) {
            reject(new Error(`Drain failed: ${drainErr.message}`));
            return;
          }
          resolve();
        });
      });
    });
  }

  get isOpen(): boolean {
    return this.port !== null && this.port.isOpen;
  }
}
