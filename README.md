![Oracle APEX](https://img.shields.io/badge/Oracle-APEX-red?logo=oracle&logoColor=white)
![PL/SQL](https://img.shields.io/badge/PL%2FSQL-Database-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow?logo=javascript&logoColor=black)
![MIT License](https://img.shields.io/badge/License-MIT-green.svg)
![Oracle ACE](https://img.shields.io/badge/Oracle-ACE%20Apprentice-orange)

# BioSig Pro — Signature Plugin for Oracle APEX

> A production-grade biometric signature capture plugin for Oracle APEX

<!-- DEMO GIF HERE -->

## ✨ Features

- ✦ Draw signature with mouse, stylus, or finger
- ✦ Pointer-type awareness — auto-adjusts stroke weight (Mouse / Stylus / Finger)
- ✦ Text signature mode — type name, renders in cursive
- ✦ Rotation export — rotate final PNG by any degree
- ✦ Transparent PNG export — no background, clean on any surface
- ✦ Configurable: width, height, pen color, pen width, placeholder text
- ✦ Safe DB submit — guards against empty/corrupt base64
- ✦ Mobile-first — full touch and stylus support via Pointer Events API

## ⚙️ Plugin Attributes

| # | Label | Type | Default | Description |
|---|-------|------|---------|-------------|
| 1 | Canvas Height | Number | 200 | Height of signature canvas in px |
| 2 | Pen Color | Text | #000000 | Stroke color (hex) |
| 3 | Canvas Width | Number | 600 | Width of signature canvas in px |
| 4 | Pen Width | Number | 2 | Base stroke thickness in px |
| 5 | Rotate Degrees | Number | 0 | Rotate exported PNG by N degrees |
| 6 | Allow Text Signature | Select (Y/N) | N | Show typed name signature input |
| 7 | Placeholder Text | Text | Sign here... | Canvas placeholder text |

## 🚀 Installation

See the complete setup guide in [docs/INSTALLATION.md](docs/INSTALLATION.md).

## 🔧 Configuration

See the full attribute reference in [docs/CONFIGURATION.md](docs/CONFIGURATION.md).

## 🖼️ Screenshots

<!-- SCREENSHOTS HERE -->

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

- GitHub: https://github.com/oraclewithhassan
- LinkedIn: [YOUR LINKEDIN]

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
