/**
 * inavCli.ts -- Raw serial communication with INAV CLI.
 *
 * Opens the serial port directly (bypassing MAVLink) and interacts with
 * INAV's text-based CLI to extract configuration data.
 *
 * Usage:
 *   const cli = new InavCli();
 *   await cli.open('/dev/ttyACM0', 115200);
 *   const dump = await cli.extractDumpAll();
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
   * Good for simple markers that won't appear mid-stream (e.g. error text).
   * For the CLI prompt '# ', use waitForPrompt() instead.
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
   * Wait for the INAV CLI prompt '# ' at the end of the buffer.
   *
   * Unlike waitFor(), this distinguishes the real prompt from comment
   * lines that also contain '# ' (e.g. '# version', '# INAV/BOARD...').
   * The real prompt appears on its own line at the buffer tail with no
   * text following it. We require a silence period after detecting the
   * pattern to confirm the FC has finished sending data.
   *
   * @param timeoutMs  Overall timeout
   * @param settleMs   Silence duration to confirm prompt is real (default 1500ms).
   *                   Serial data arrives in chunks with gaps between lines.
   *                   300ms is too short -- F4 boards can pause 500ms+ between chunks.
   * @param minSize    Minimum buffer size before prompt is considered real.
   *                   Prevents early resolution on comment-only headers.
   */
  private waitForPrompt(timeoutMs: number = 5000, settleMs: number = 1500, minSize: number = 0): Promise<string> {
    return new Promise((resolve, reject) => {
      let settleTimer: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        if (settleTimer) { clearTimeout(settleTimer); settleTimer = null; }
        this.resolveWaiter = null;
      };

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Timeout waiting for CLI prompt after ${timeoutMs}ms`));
      }, timeoutMs);

      const check = () => {
        // The CLI prompt is '# ' on its own line at the end of the buffer.
        // Match: newline (or start of buffer) followed by '# ' at the very end.
        if (/(\r?\n|^)# $/.test(this.buffer) && this.buffer.length >= minSize) {
          // Looks like a prompt -- wait for silence to confirm it's real
          // (not a partially-received comment line like '# vers' before 'ion\r\n')
          if (settleTimer) clearTimeout(settleTimer);
          settleTimer = setTimeout(() => {
            clearTimeout(timer);
            this.resolveWaiter = null;
            resolve(this.buffer);
          }, settleMs);
        } else {
          // More data arrived after the '# ' -- it was a comment, not a prompt
          if (settleTimer) { clearTimeout(settleTimer); settleTimer = null; }
        }
      };

      // Check current buffer immediately
      check();

      // Re-check on each new data arrival
      this.resolveWaiter = () => check();
    });
  }

  /**
   * Wait until a line matching exactly the given text appears in the buffer.
   * Unlike waitFor() which uses substring includes(), this checks for the
   * text as a complete line (anchored by newlines) to avoid false matches
   * on comments like "# save configuration" when looking for "save".
   */
  private waitForLine(lineText: string, timeoutMs: number = 5000): Promise<string> {
    // Match: start-of-buffer or newline, then the exact text, then \r\n or \n
    const pattern = new RegExp(`(^|\\r?\\n)${lineText}\\r?\\n`);

    return new Promise((resolve, reject) => {
      if (pattern.test(this.buffer)) {
        resolve(this.buffer);
        return;
      }

      const timer = setTimeout(() => {
        this.resolveWaiter = null;
        reject(new Error(`Timeout waiting for line "${lineText}" after ${timeoutMs}ms`));
      }, timeoutMs);

      this.resolveWaiter = (buf: string) => {
        if (pattern.test(buf)) {
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
   * Extract "dump all" output from INAV CLI.
   * Captures every parameter including defaults, giving the import parser
   * the full picture. Produces ~30-50KB of output.
   *
   * INAV dump output ends with:
   *   save
   *   # end the command batch
   *   batch end
   *   #
   *
   * We use "batch end" as the deterministic end marker. This avoids the
   * prompt-detection problem where "# " in comment lines causes early
   * resolution. Settle-based prompt detection is the fallback if the
   * marker never arrives (e.g. older INAV without batch mode).
   */
  async extractDumpAll(onProgress?: ProgressCallback): Promise<string> {
    onProgress?.('Extracting full configuration...');
    this.clearBuffer();
    await this.send('dump all\r\n');

    // Primary: wait for "batch end" -- the last line INAV emits after a dump
    try {
      await this.waitForLine('batch end', 60000);
      // Let the trailing prompt arrive
      await new Promise((r) => setTimeout(r, 300));
    } catch {
      // Fallback for older INAV without batch mode
      onProgress?.('Waiting for CLI prompt...');
      await this.waitForPrompt(10000, 2000, 1000);
    }

    const output = this.buffer;

    // Extract output: starts at "dump" (echo may be "dump" or "dump all"),
    // ends before the final "# " prompt
    const dumpIdx = output.indexOf('dump');
    const promptIdx = output.lastIndexOf('# ');
    if (dumpIdx >= 0 && promptIdx > dumpIdx) {
      const dumpText = output.substring(dumpIdx, promptIdx).trim();
      onProgress?.(`Extracted ${dumpText.split('\n').length} lines of configuration`);
      return dumpText;
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

    // Parse version: "INAV/MATEKF405SE 9.0.1 Feb 13 2026 ..."
    // Older format: "INAV/7.1.0 ..." (version right after slash)
    // Newer format: "INAV/BOARDNAME VERSION ..." (board name between slash and version)
    const versionMatch = output.match(/INAV\/\S+\s+(\d+\.\d+\.\d+)/i)
      ?? output.match(/INAV[/\s](\d+\.\d+\.\d+)/i);
    if (versionMatch) info.version = versionMatch[1];

    // Parse board target: "INAV/MATEKF405SE ..."
    const boardMatch = output.match(/INAV\/(\S+)/i);
    if (boardMatch) {
      // Board name may include version if old format -- strip trailing digits
      const raw = boardMatch[1];
      const cleaned = raw.replace(/^\d+\.\d+\.\d+.*/, ''); // old format: version was board name
      info.boardTarget = cleaned || null;
    }
    // Fallback: look for "board" or "target" keywords
    if (!info.boardTarget) {
      const kwMatch = output.match(/(?:board|target)[:\s]+(\S+)/i);
      if (kwMatch) info.boardTarget = kwMatch[1];
    }

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
