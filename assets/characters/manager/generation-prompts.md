# Landlord miniature artwork

Generated with the built-in ImageGen tool. Approved reference: `sources/idle.png` (human, youthful face, slightly chubby body, silver-white slicked-back hair with black locks, sunglasses, brown cable-knit sweater, charcoal trousers, black shoes).

Shared prompt: Preserve the exact approved identity, youthful smooth face, sunglasses, silver-white and black swept-back all-back hair, slightly chubby short body, brown cable-knit sweater, charcoal trousers and black shoes. Preserve oversized chibi head proportions, chunky stepped pixel outlines and limited palette. Entire full body visible, same camera and head scale, generous true transparent margin. One character only. No text, floor, cast shadow or background.

Per-image instructions:
- `clean_a`: Both hands grip a wooden broom; shaft and bristles sweep to the viewer's left. Slight forward lean, focused friendly expression, no hand in pocket.
- `clean_b`: Matching opposite sweep to the viewer's right, both hands gripping the broom; matching stance and head scale.
- `happy`: Big open happy smile, raised eyebrows, both arms thrown upward in cheerful celebration.
- `angry`: Comically annoyed, hands on hips, elbows out, raised shoulders, furrowed brows, open complaining mouth. Never threatening or violent.
- `sad`: Weary and disappointed, slumped shoulders, slightly lowered head, downturned sighing mouth, one hand rubbing the back of the neck. No added aging lines.
- `surprised`: Lean back, both palms raised with fingers spread, open oval mouth, raised eyebrows, bent knees, sunglasses stay on.
- `retort`: Big comic facepalm above sunglasses, other arm flung out palm-up, drooping shoulders, incredulous wry half-grin. Exasperation rather than rage.

`tools/prepare-manager-art.py` packages the generated RGBA images into 160×160 game frames using nearest-neighbor scaling. Original generation outputs are preserved in `sources/`. They are not copied to the public game package; only referenced game sprites are shipped.
