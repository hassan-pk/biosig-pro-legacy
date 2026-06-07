# BioSig Pro Configuration Reference

Use this guide to configure BioSig Pro consistently across desktop, tablet, and mobile form factors.

## Attribute Matrix

| # | Label | Type | Default | Description |
|---|-------|------|---------|-------------|
| 1 | Canvas Height | Number | 200 | Height of signature canvas in px |
| 2 | Pen Color | Text | #000000 | Stroke color (hex) |
| 3 | Canvas Width | Number | 600 | Width of signature canvas in px |
| 4 | Pen Width | Number | 2 | Base stroke thickness in px |
| 5 | Rotate Degrees | Number | 0 | Rotate exported image by N degrees |
| 6 | Allow Text Signature | Select (Y/N) | N | Show typed name signature input |
| 7 | Placeholder Text | Text | Sign here... | Canvas placeholder text |

---

## 1) Canvas Height

- **Type:** Number
- **Default:** `200`
- **What it controls:** Vertical drawing area in pixels.

### Recommended values
- `180–220` for standard forms
- `240–320` for tablet-heavy workflows

### Example
```sql
Canvas Height = 220
```

### Tips
- Keep height balanced with width to avoid cramped signatures.
- Larger heights improve comfort for finger input.

---

## 2) Pen Color

- **Type:** Text (hex color)
- **Default:** `#000000`
- **What it controls:** Stroke color used for draw mode and text signature mode.

### Recommended values
- `#000000` for legal-style black ink
- `#1f2937` for softer dark gray
- Use brand-specific colors only if policy allows non-black signatures

### Example
```sql
Pen Color = #000000
```

### Tips
- High-contrast dark colors are best for print and archival readability.

---

## 3) Canvas Width

- **Type:** Number
- **Default:** `600`
- **What it controls:** Horizontal drawing area in pixels.

### Recommended values
- `600` default for desktop forms
- `480–560` for responsive mixed-device layouts

### Example
```sql
Canvas Width = 600
```

### Tips
- Very wide canvases can reduce usable space in narrow page regions.

---

## 4) Pen Width

- **Type:** Number
- **Default:** `2`
- **What it controls:** Base stroke thickness. BioSig Pro automatically scales by pointer type:
  - Stylus (`pen`) → thinner
  - Finger (`touch`) → thicker
  - Mouse (`mouse`) → base width

  Stroke width also varies within each stroke via pressure simulation (slow = thicker, fast = thinner). Real stylus pressure from the Pointer Events API overrides the simulation.

### Recommended values
- `2` for most use cases
- `3` for larger canvases or low-contrast displays

### Example
```sql
Pen Width = 2
```

### Tips
- Avoid very low values (`<2`) for touch-heavy scenarios.

---

## 5) Rotate Degrees

- **Type:** Number
- **Default:** `0`
- **What it controls:** Rotates the exported JPEG image by the specified number of degrees before submission.

### Recommended values
- `0` for standard capture
- `90` or `270` for specific downstream image orientation requirements

### Example
```sql
Rotate Degrees = 90
```

### Tips
- Only enable rotation if your storage/viewer pipeline requires it.

---

## 6) Allow Text Signature

- **Type:** Select (`Y` / `N`)
- **Default:** `N`
- **What it controls:** Displays a typed-name signature input and apply button.

### Recommended values
- `N` for strict handwritten-signature workflows
- `Y` when typed fallback is acceptable for accessibility or remote onboarding

### Example
```sql
Allow Text Signature = Y
```

### Tips
- If enabled, document governance rules for when typed signature is permitted.

---

## 7) Placeholder Text

- **Type:** Text
- **Default:** `Sign here...`
- **What it controls:** Centered helper message shown before user signs.

### Recommended values
- `Sign here...` for general forms
- `Please sign to continue` for guided workflows

### Example
```sql
Placeholder Text = Please sign to continue
```

### Tips
- Keep messaging short and action-oriented.
- Avoid legal copy inside placeholder text; place legal text outside the canvas.

---

## Configuration Profiles

### Profile A: Standard Business Form
- Height: `200`
- Width: `600`
- Pen Width: `2`
- Pen Color: `#000000`
- Rotate: `0`
- Allow Text Signature: `N`
- Placeholder: `Sign here...`

### Profile B: Mobile-First Intake
- Height: `240`
- Width: `520`
- Pen Width: `3`
- Pen Color: `#000000`
- Rotate: `0`
- Allow Text Signature: `Y`
- Placeholder: `Sign with finger or stylus`

## Production Tips

- Store the resulting JPEG as BLOB for durability and easy retrieval.
- Keep item session state at **Per Session (Disk)** with **Data Type = CLOB** — this is critical to prevent silent base64 truncation before the submit process runs.
- Validate non-empty base64 before conversion and insert (the provided submit process already does this).
- Use HTTPS and least-privilege page/process security for sensitive capture flows.
- If your downstream system checks MIME type, expect `image/jpeg` (not `image/png`).
