> **⚠️ Archived.** This repository is no longer maintained and does not receive
> updates, bug fixes, or support. It has been superseded by a newer, commercially
> supported rebuild of BioSig Pro. This code is kept here for historical reference
> only — do not use it for new work.

![Oracle APEX](https://img.shields.io/badge/Oracle-APEX-red?logo=oracle&logoColor=white)
![PL/SQL](https://img.shields.io/badge/PL%2FSQL-Database-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow?logo=javascript&logoColor=black)
![MIT License](https://img.shields.io/badge/License-MIT-green.svg)
![Oracle ACE](https://img.shields.io/badge/Oracle-ACE%20Apprentice-orange)
![Version](https://img.shields.io/badge/version-2.0.0-brightgreen)

# BioSig Pro — Signature Plugin for Oracle APEX

> A production-grade biometric signature capture plugin for Oracle APEX

<img width="472" height="377" alt="gif" src="https://github.com/user-attachments/assets/21fc4488-8aea-45ec-b8a5-d78852017557" />


## ✨ Features

- ✦ Draw signature with mouse, stylus, or finger
- ✦ Pointer-type awareness — auto-adjusts stroke weight (Mouse / Stylus / Finger)
- ✦ Bézier stroke smoothing — C1-continuous curves, no jagged segments
- ✦ Pressure simulation — slow strokes thicker, fast strokes thinner; real stylus pressure used when available
- ✦ Text signature mode — type name, renders in cursive
- ✦ Rotation export — rotate final image by any degree
- ✦ Adaptive JPEG export — guaranteed to fit within Oracle's VARCHAR2 limit regardless of stroke complexity
- ✦ Correct drawing on responsive layouts — coordinates scale with CSS canvas size
- ✦ Multiple pads per page — each instance is fully isolated
- ✦ Configurable: width, height, pen color, pen width, placeholder text
- ✦ Safe DB submit — guards against empty/corrupt base64, surfaces errors via APEX notifications
- ✦ Mobile-first — full touch and stylus support via Pointer Events API

## ⚙️ Plugin Attributes

| # | Label | Type | Default | Description |
|---|-------|------|---------|-------------|
| 1 | Canvas Height | Number | 200 | Height of signature canvas in px |
| 2 | Pen Color | Text | #000000 | Stroke color (hex) |
| 3 | Canvas Width | Number | 600 | Width of signature canvas in px |
| 4 | Pen Width | Number | 2 | Base stroke thickness in px |
| 5 | Rotate Degrees | Number | 0 | Rotate exported image by N degrees |
| 6 | Allow Text Signature | Select (Y/N) | N | Show typed name signature input |
| 7 | Placeholder Text | Text | Sign here... | Canvas placeholder text |

## 🚀 Installation

See the complete setup guide in [docs/INSTALLATION.md](docs/INSTALLATION.md).

## 🔧 Configuration

See the full attribute reference in [docs/CONFIGURATION.md](docs/CONFIGURATION.md).

## 🖼️ Screenshots

<img width="445" height="386" alt="image" src="https://github.com/user-attachments/assets/61d2cdd7-baf5-4faf-ac49-a350bc4b5749" />
<img width="472" height="377" alt="image" src="https://github.com/user-attachments/assets/c837e07d-3643-4599-a947-e6d8617e0ab4" />



## 🧱 Built With

- Oracle APEX
- PL/SQL
- Vanilla JavaScript
- HTML5 Canvas

## 👨‍💻 Author

**Hassan Raza**
- Oracle ACE Apprentice
- Oracle APEX Cloud Developer Certified Professional
- Senior Oracle Application Developer at S&H Software Solutions, Frankfurt

- GitHub: https://github.com/Darkhound-droid/
- LinkedIn: https://www.linkedin.com/in/link-hassan-raza/

## 🤝 Contributing

Contributions are welcome and appreciated.

1. Fork the repository
2. Create a feature branch
3. Commit your changes with clear messages
4. Open a pull request with implementation details and screenshots where relevant

Please also open an issue for major design changes before implementation.

## 📦 Releases

The compiled `.sql` plugin export is published in the **GitHub Releases** section for each tagged version.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
