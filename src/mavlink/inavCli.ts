/**
 * inavCli.ts -- Raw serial communication with INAV CLI.
 *
 * Opens the serial port directly (bypassing MAVLink) and interacts with
 * INAV's text-based CLI to extract configuration data.
 *
 * Usage:
 *   const cli = new InavCli();
 *   await cli.open('/dev/ttyACM0', 115200);
 *   const diffAll = await cli.extractDiffAll();
 *   await cli.close();
 */

export interface InavInfo {
  version: string | null;
  boardTarget: string | null;
  buildDate: string | null;
}

type ProgressCallback = (message: string) => void;

export class InavCli {
  private buffer = '';
  private dataCleanup: (() => void) | null = null;
  private resolveWaiter: ((data: string) => void) | null = null;

  /**
   * Open serial port for raw CLI communication.
   */
  async open(portPath: string, baudRate: number = 115200): Promise<void> {
    const api = window.electronAPI;
    if (!api) throw new Error('Not running in Electron');

    await api.serial.open(portPath, baudRate);

    this.buffer = '';
    this.dataCleanup = api.serial.onData((data: Uint8Array) => {
      const text = new TextDecoder().decode(data);
      this.buffer += text;
      // If someone is waiting for data, notify them
      if (this.resolveWaiter) {
        this.resolveWaiter(this.buffer);
      }
    });
  }

  /**
   * Close the serial port.
   */
  async close(): Promise<void> {
    if (this.dataCleanup) {
      this.dataCleanup();
      this.dataCleanup = null;
    }
    try {
      await window.electronAPI?.serial.close();
    } catch { /* ignore */ }
  }

  /**
   * Send a string over serial.
   */
  private async send(text: string): Promise<void> {
    const api = window.electronAPI;
    if (!api) throw new Error('Not running in Electron');
    const data = new TextEncoder().encode(text);
    await api.serial.write(data);
  }

  /**
   * Wait until the buffer contains a specific string or times out.
   */
  private waitFor(marker: string, timeoutMs: number = 5000): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check if already in buffer
      if (this.buffer.includes(marker)) {
        resolve(this.buffer);
        return;
      }

      const timer = setTimeout(() => {
        this.resolveWaiter = null;
        reject(new Error(`Timeout waiting for "${marker}" after ${timeoutMs}ms`));
      }, timeoutMs);

      this.resolveWaiter = (buf: string) => {
        if (buf.includes(marker)) {
          clearTimeout(timer);
          this.resolveWaiter = null;
          resolve(buf);
        }
      };
    });
  }

  /**
   * Clear the receive buffer.
   */
  private clearBuffer(): void {
    this.buffer = '';
  }

  /**
   * Enter INAV CLI mode by sending '#' and waiting for the '# ' prompt.
   */
  async enterCli(onProgress?: ProgressCallback): Promise<void> {
    onProgress?.('Entering CLI mode...');
    this.clearBuffer();

    // Send '#' to enter CLI mode
    await this.send('#');
    await new Promise((r) => setTimeout(r, 500));

    // Sometimes need a second '#' or newline
    await this.send('\r\n');

    try {
      await this.waitFor('# ', 3000);
    } catch {
      // Retry once
      await this.send('#');
      await this.waitFor('# ', 3000);
    }

    onProgress?.('CLI mode active');
  }

  /**
   * Run a CLI command and capture the output.
   */
  async runCommand(cmd: string, timeoutMs: number = 10000): Promise<string> {
    this.clearBuffer();
    await this.send(cmd + '\r\n');

    // Wait for the next prompt, which signals command completion
    await this.waitFor('# ', timeoutMs);

    // Extract output: everything between the command echo and the final prompt
    const output = this.buffer;
    const cmdIdx = output.indexOf(cmd);
    const promptIdx = output.lastIndexOf('# ');
    if (cmdIdx >= 0 && promptIdx > cmdIdx) {
      return output.substring(cmdIdx + cmd.length, promptIdx).trim();
    }
    return output.trim();
  }

  /**
   * Extract "diff all" output from INAV CLI.
   * This is the main config extraction function.
   */
  async extractDiffAll(onProgress?: ProgressCallback): Promise<string> {
    onProgress?.('Extracting configuration...');
    this.clearBuffer();
    await this.send('diff all\r\n');

    // diff all can take a while on boards with lots of config
    // Wait for the trailing '# ' prompt with a generous timeout
    await this.waitFor('# ', 30000);

    const output = this.buffer;

    // Extract just the diff output
    const diffIdx = output.indexOf('diff all');
    const promptIdx = output.lastIndexOf('# ');
    if (diffIdx >= 0 && promptIdx > diffIdx) {
      const diffText = output.substring(diffIdx, promptIdx).trim();
      onProgress?.(`Extracted ${diffText.split('\n').length} lines of configuration`);
      return diffText;
    }

    onProgress?.('Configuration extracted');
    return output.trim();
  }

  /**
   * Get board info from CLI "status" command.
   */
  async getStatus(onProgress?: ProgressCallback): Promise<InavInfo> {
    onProgress?.('Reading board status...');
    const output = await this.runCommand('status', 5000);

    const info: InavInfo = {
      version: null,
      boardTarget: null,
      buildDate: null,
    };

    // Parse version: "INAV/7.1.0 (board) ..."
    const versionMatch = output.match(/INAV[/\s](\d+\.\d+\.\d+)/i);
    if (versionMatch) info.version = versionMatch[1];

    // Parse board target: varies by INAV version
    const boardMatch = output.match(/(?:board|target)[:\s]+(\S+)/i)
      ?? output.match(/INAV\/\d+\.\d+\.\d+\s+(\S+)/);
    if (boardMatch) info.boardTarget = boardMatch[1];

    // Parse build date
    const dateMatch = output.match(/(?:Build|Date)[:\s]+(.+?)(?:\r?\n|$)/i);
    if (dateMatch) info.buildDate = dateMatch[1].trim();

    onProgress?.(`INAV ${info.version ?? 'unknown'} on ${info.boardTarget ?? 'unknown board'}`);
    return info;
  }

  /**
   * Exit CLI mode (sends "exit" which reboots the FC).
   */
  async exitCli(): Promise<void> {
    try {
      await this.send('exit\r\n');
    } catch { /* ignore -- port may close during reboot */ }
  }
}
