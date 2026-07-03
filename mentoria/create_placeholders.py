import os
import struct
import zlib

out_dir = os.path.join(os.path.dirname(__file__), 'img')
os.makedirs(out_dir, exist_ok=True)


def write_png(path, width, height, pixels):
    def chunk(chunk_type, data):
        return struct.pack('!I', len(data)) + chunk_type + data + struct.pack('!I', zlib.crc32(chunk_type + data) & 0xffffffff)

    raw = bytearray()
    for row in pixels:
        raw.append(0)
        for r, g, b, a in row:
            raw.extend([r, g, b, a])

    png = bytearray(b'\x89PNG\r\n\x1a\n')
    png.extend(chunk(b'IHDR', struct.pack('!IIBBBBB', width, height, 8, 6, 0, 0, 0)))
    png.extend(chunk(b'IDAT', zlib.compress(bytes(raw), 9)))
    png.extend(chunk(b'IEND', b''))
    with open(path, 'wb') as f:
        f.write(png)


def create_logo(path):
    w, h = 240, 240
    pixels = []
    for y in range(h):
        row = []
        for x in range(w):
            dx = x - w // 2
            dy = y - h // 2
            r = 8 + int(20 * (1 - min(1, abs(dx) / (w // 2))))
            g = 24 + int(70 * (1 - min(1, abs(dy) / (h // 2))))
            b = 60 + int(40 * (1 - min(1, (abs(dx) + abs(dy)) / (w // 2 + h // 2))))
            a = 255
            if (x - 80) ** 2 + (y - 80) ** 2 <= 60 ** 2:
                r, g, b = 255, 255, 255
            if (x - 80) ** 2 + (y - 125) ** 2 <= 54 ** 2:
                r, g, b = 59, 130, 246
            if (x - 122) ** 2 + (y - 96) ** 2 <= 54 ** 2:
                r, g, b = 6, 182, 212
            row.append((r, g, b, a))
        pixels.append(row)
    write_png(path, w, h, pixels)


def create_hero(path):
    w, h = 900, 1100
    pixels = []
    for y in range(h):
        row = []
        for x in range(w):
            bg_r = 8 + int((x / w) * 10)
            bg_g = 16 + int((y / h) * 12)
            bg_b = 28 + int((x + y) / (w + h) * 12)
            r, g, b = bg_r, bg_g, bg_b
            if (x - 560) ** 2 + (y - 560) ** 2 < 240 ** 2:
                r = 11 + int((x / w) * 12)
                g = 30 + int((y / h) * 20)
                b = 60 + int((x + y) / (w + h) * 18)
            if (x - 550) ** 2 + (y - 370) ** 2 < 160 ** 2:
                r, g, b = 59, 130, 246
            if (x - 300) ** 2 + (y - 710) ** 2 < 160 ** 2:
                r, g, b = 6, 182, 212
            if 320 <= x <= 620 and 250 <= y <= 860:
                r = max(0, r - 18)
                g = max(0, g - 18)
                b = max(0, b - 16)
            row.append((r, g, b, 255))
        pixels.append(row)
    write_png(path, w, h, pixels)


def create_profile(path):
    w, h = 900, 1100
    pixels = []
    for y in range(h):
        row = []
        for x in range(w):
            bg_r = 8 + int((x / w) * 8)
            bg_g = 16 + int((y / h) * 10)
            bg_b = 24 + int((x + y) / (w + h) * 10)
            r, g, b = bg_r, bg_g, bg_b
            if 280 <= x <= 620 and 180 <= y <= 900:
                r = max(0, r + 10)
                g = max(0, g + 12)
                b = max(0, b + 16)
            if 340 <= x <= 560 and 320 <= y <= 760:
                r, g, b = 59, 130, 246
            if 380 <= x <= 520 and 380 <= y <= 640:
                r, g, b = 240, 240, 240
            if 280 <= x <= 620 and 760 <= y <= 920:
                r, g, b = 6, 182, 212
            row.append((r, g, b, 255))
        pixels.append(row)
    write_png(path, w, h, pixels)

create_logo(os.path.join(out_dir, 'logo-devplus.png'))
create_hero(os.path.join(out_dir, 'hero-daniel.png'))
create_profile(os.path.join(out_dir, 'perfil-daniel.png'))
print('Images created at', out_dir)
