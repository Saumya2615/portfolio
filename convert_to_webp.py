"""
Batch PNG/JPG -> WebP converter.

Usage:
    python convert_to_webp.py <input_folder> <output_folder> [quality]

- Converts .png, .jpg, .jpeg files to .webp
- Skips video/audio/other files (only touches image files)
- Preserves original filenames (just swaps the extension)
- Leaves your original folder completely untouched — writes to a separate output folder
- Default quality is 80 (good balance of size vs. quality); pass a number 1-100 to override
"""

import sys
import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow isn't installed. Run this first:")
    print("    pip install Pillow --break-system-packages")
    sys.exit(1)

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg"}
SKIP_EXTENSIONS = {".mp4", ".mov", ".webm", ".mp3", ".wav", ".m4a", ".avi", ".mkv"}


def convert_folder(input_folder, output_folder, quality=80):
    input_path = Path(input_folder)
    output_path = Path(output_folder)

    if not input_path.exists():
        print(f"Input folder not found: {input_folder}")
        sys.exit(1)

    output_path.mkdir(parents=True, exist_ok=True)

    converted = []
    skipped = []

    for file in sorted(input_path.iterdir()):
        if file.is_dir():
            continue

        ext = file.suffix.lower()

        if ext in IMAGE_EXTENSIONS:
            out_file = output_path / (file.stem + ".webp")
            try:
                img = Image.open(file)
                # Convert to RGB if needed (WebP doesn't support all modes, e.g. some CMYK/palette cases)
                if img.mode in ("P", "CMYK"):
                    img = img.convert("RGBA" if "A" in img.getbands() else "RGB")
                img.save(out_file, "WEBP", quality=quality)
                converted.append((file.name, out_file.name, file.stat().st_size, out_file.stat().st_size))
            except Exception as e:
                print(f"  ⚠ Failed to convert {file.name}: {e}")
        elif ext in SKIP_EXTENSIONS:
            skipped.append(file.name)
        else:
            skipped.append(file.name)

    print(f"\n✅ Converted {len(converted)} image(s):")
    total_before, total_after = 0, 0
    for orig, new, before, after in converted:
        total_before += before
        total_after += after
        print(f"   {orig}  →  {new}   ({before/1024:.0f}KB → {after/1024:.0f}KB)")

    if converted:
        saved_pct = (1 - total_after / total_before) * 100 if total_before else 0
        print(f"\n   Total: {total_before/1024:.0f}KB → {total_after/1024:.0f}KB  ({saved_pct:.0f}% smaller)")

    if skipped:
        print(f"\n⏭  Skipped {len(skipped)} non-image file(s) (left untouched, not copied):")
        for f in skipped:
            print(f"   {f}")

    print(f"\nDone. Converted files are in: {output_path.resolve()}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python convert_to_webp.py <input_folder> <output_folder> [quality]")
        sys.exit(1)

    input_folder = sys.argv[1]
    output_folder = sys.argv[2]
    quality = int(sys.argv[3]) if len(sys.argv) > 3 else 80

    convert_folder(input_folder, output_folder, quality)
