#!/usr/bin/env python3
"""
MAVFTP test v4 -- uses correct @PARAM/param.pck path.
Run: python3 test_mavftp.py /dev/ttyACM0
"""

import sys
import time
import struct

from pymavlink import mavutil
from MAVProxy.modules.mavproxy_ftp import FTP_OP

OP_TerminateSession = 1
OP_ResetSessions = 2
OP_ListDirectory = 3
OP_OpenFileRO = 4
OP_BurstReadFile = 15
OP_Ack = 128
OP_Nak = 129
HDR_Len = 12
MAX_Payload = 239

ERR_NAMES = {0:'None', 1:'Fail', 2:'FailErrno', 3:'InvalidDataSize',
             4:'InvalidSession', 5:'NoSessions', 6:'EOF', 7:'UnknownCmd',
             8:'FileExists', 9:'FileProtected', 10:'FileNotFound'}

class FTPClient:
    def __init__(self, mav):
        self.mav = mav
        self.seq = 0
        self.target_sys = mav.target_system
        self.target_comp = mav.target_component

    def send_op(self, opcode, session=0, size=0, offset=0, data=None):
        op = FTP_OP(self.seq, session, opcode, size, 0, 0, offset, data)
        payload = op.pack()
        if len(payload) < MAX_Payload + HDR_Len:
            payload.extend(bytearray([0] * ((HDR_Len + MAX_Payload) - len(payload))))
        self.mav.mav.file_transfer_protocol_send(0, self.target_sys, self.target_comp, payload)
        self.seq = (self.seq + 1) % 256

    def recv(self, timeout=3):
        msg = self.mav.recv_match(type='FILE_TRANSFER_PROTOCOL', blocking=True, timeout=timeout)
        if not msg:
            return None
        raw = bytearray(msg.payload)
        hdr = raw[:12]
        (rseq, rsess, rop, rsz, rreq, rburst, rpad, rofs) = struct.unpack("<HBBBBBBI", hdr)
        return {
            'seq': rseq, 'session': rsess, 'opcode': rop, 'size': rsz,
            'req_opcode': rreq, 'burst': rburst, 'offset': rofs,
            'data': raw[12:12+rsz]
        }

    def drain(self):
        while self.mav.recv_match(blocking=False):
            pass

    def reset_sessions(self):
        self.send_op(OP_ResetSessions)
        self.recv(2)
        time.sleep(0.3)

    def open_file(self, path):
        enc = bytearray(path, 'ascii')
        self.send_op(OP_OpenFileRO, size=len(enc), data=enc)
        r = self.recv(3)
        if not r:
            return False, 0, 0, "TIMEOUT"
        if r['opcode'] == OP_Nak:
            err = r['data'][0] if len(r['data']) > 0 else 0
            return False, 0, 0, ERR_NAMES.get(err, str(err))
        if r['opcode'] == OP_Ack:
            session = r['session']
            fsize = struct.unpack("<I", r['data'][:4])[0] if r['size'] >= 4 else 0
            return True, session, fsize, "OK"
        return False, 0, 0, f"opcode {r['opcode']}"

    def burst_read_all(self, session, file_size):
        """Full burst download with gap filling."""
        total = bytearray(file_size) if file_size > 0 else bytearray()
        received = set()
        chunks = 0

        # Start burst
        self.send_op(OP_BurstReadFile, session=session, size=MAX_Payload, offset=0)

        start = time.time()
        max_offset = 0
        while time.time() - start < 30:
            r = self.recv(2)
            if not r:
                break
            if r['opcode'] == OP_Nak:
                err = r['data'][0] if len(r['data']) > 0 else 0
                if err == 6:  # EOF
                    print(f"  EOF after {chunks} chunks")
                    break
                print(f"  NAK: {ERR_NAMES.get(err, str(err))}")
                break
            if r['opcode'] == OP_Ack and r['size'] > 0:
                end = r['offset'] + r['size']
                if end > len(total):
                    total.extend(bytearray(end - len(total)))
                total[r['offset']:end] = r['data']
                received.add(r['offset'])
                chunks += 1
                if end > max_offset:
                    max_offset = end
                if chunks % 50 == 0:
                    print(f"  {chunks} chunks, {max_offset} bytes...")
                if r['burst'] == 1:
                    # Request more if not done
                    if max_offset < file_size:
                        self.send_op(OP_BurstReadFile, session=session,
                                     size=MAX_Payload, offset=max_offset)
                    else:
                        break

        return bytes(total[:max_offset])

    def terminate(self, session):
        self.send_op(OP_TerminateSession, session=session)
        self.recv(1)


def parse_pck(data):
    """
    Parse @PARAM/param.pck binary format.
    Format: sequence of packed parameter entries.
    Each entry: name (null-terminated, max 16 bytes) + value (float32, 4 bytes)
    ... but the exact format may differ. Let's dump and analyze.
    """
    print(f"\n=== Analyzing .pck format ({len(data)} bytes) ===")
    print(f"First 64 bytes hex: {' '.join(f'{b:02x}' for b in data[:64])}")
    print(f"First 64 bytes ascii: {''.join(chr(b) if 32 <= b < 127 else '.' for b in data[:64])}")

    # Try to detect format by looking for recognizable param names
    text = data.decode('ascii', errors='replace')
    
    # Check if it's actually plain text (some firmware versions)
    if '\n' in text and ',' in text[:200]:
        print("\nLooks like plain text CSV format!")
        lines = text.strip().split('\n')
        print(f"Lines: {len(lines)}")
        for line in lines[:5]:
            print(f"  {line}")
        return

    # Check for packed format header
    # ArduPilot param.pck format (AP_Param.cpp):
    # - 16-bit magic/version
    # - Then packed entries: flags(1) + param_header(varies) + value(4)
    # The exact format depends on firmware version.
    
    # Let's look for known param name patterns
    import re
    matches = list(re.finditer(b'[A-Z][A-Z0-9_]{2,15}', data))
    if matches:
        print(f"\nFound {len(matches)} potential param names in binary data")
        for m in matches[:10]:
            pos = m.start()
            name = m.group().decode('ascii')
            # Look at surrounding bytes
            ctx_before = data[max(0,pos-4):pos]
            ctx_after = data[m.end():m.end()+8]
            print(f"  @{pos}: '{name}' before={' '.join(f'{b:02x}' for b in ctx_before)} after={' '.join(f'{b:02x}' for b in ctx_after)}")
    else:
        print("\nNo recognizable param names found -- may be compressed")
        print("Checking for zlib/gzip header...")
        if data[:2] == b'\x1f\x8b':
            print("  GZIP compressed!")
            import gzip
            decompressed = gzip.decompress(data)
            print(f"  Decompressed: {len(decompressed)} bytes")
            parse_pck(decompressed)
        elif data[:2] == b'\x78\x9c' or data[:2] == b'\x78\x01' or data[:2] == b'\x78\xda':
            print("  ZLIB compressed!")
            import zlib
            decompressed = zlib.decompress(data)
            print(f"  Decompressed: {len(decompressed)} bytes")
            parse_pck(decompressed)
        else:
            print(f"  Header bytes: {' '.join(f'{b:02x}' for b in data[:16])}")
            print("  Unknown format -- dump first 256 bytes for analysis")
            for i in range(0, min(256, len(data)), 16):
                hexpart = ' '.join(f'{b:02x}' for b in data[i:i+16])
                ascpart = ''.join(chr(b) if 32 <= b < 127 else '.' for b in data[i:i+16])
                print(f"  {i:04x}: {hexpart:<48} {ascpart}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 test_mavftp.py <port> [baud]")
        sys.exit(1)

    port = sys.argv[1]
    baud = int(sys.argv[2]) if len(sys.argv) > 2 else 115200

    print(f"Connecting to {port} at {baud}...")
    mav = mavutil.mavlink_connection(port, baud=baud)

    print("Waiting for heartbeat...")
    mav.wait_heartbeat()
    print(f"Heartbeat: system={mav.target_system} component={mav.target_component}")

    print("Waiting 3s for FC to settle...")
    time.sleep(3)

    ftp = FTPClient(mav)
    ftp.drain()
    ftp.reset_sessions()
    ftp.drain()

    # Try the paths Mission Planner actually uses
    paths = [
        '@PARAM/param.pck?withdefaults=1',  # What Mission Planner uses (v4.6+)
        '@PARAM/param.pck',                  # Without defaults
        '@PARAM/param.parm',                 # Legacy text format
    ]

    for path in paths:
        print(f"\n=== Trying: '{path}' ===")
        ok, session, fsize, status = ftp.open_file(path)
        print(f"  Result: {status}" + (f" session={session} size={fsize}" if ok else ""))

        if ok:
            print(f"\n  Downloading {fsize} bytes...")
            data = ftp.burst_read_all(session, fsize)
            ftp.terminate(session)

            if data:
                print(f"  Got {len(data)} bytes total")

                if path.endswith('.pck') or path.endswith('.pck?withdefaults=1'):
                    parse_pck(data)
                else:
                    # Plain text
                    text = data.decode('utf-8', errors='replace')
                    lines = [l for l in text.strip().split('\n') if l.strip()]
                    print(f"  {len(lines)} parameters")
                    for line in lines[:5]:
                        print(f"    {line}")
                    if len(lines) > 5:
                        print(f"    ... and {len(lines)-5} more")

                print(f"\n*** SUCCESS with path: {path} ***")
                break
            else:
                print("  No data received")
        
        ftp.drain()
        time.sleep(0.5)
    else:
        print("\n*** All paths failed ***")

    print("\nDone.")

if __name__ == '__main__':
    main()
