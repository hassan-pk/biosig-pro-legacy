# BioSig Pro Installation Guide

This guide walks you through setting up the BioSig Pro Oracle APEX plugin in a production-friendly way.

## Prerequisites

- Oracle APEX workspace access with rights to import plugins
- Access to Shared Components in your target application
- A page and table/process context ready to receive a PNG signature as BLOB

## 1) Import the plugin `.sql` file into APEX

1. In your APEX application, go to **Shared Components**.
2. Open **Plugins**.
3. Click **Import**.
4. Select the BioSig Pro plugin export SQL file.
5. Complete the import wizard and verify the plugin appears in your plugin list.

## 2) Upload JavaScript and CSS to Static Application Files

1. Go to **Shared Components → Static Application Files**.
2. Upload the following files from this repository:
   - `plugin/oraclewithhassan_biosig_pro.js`
   - `plugin/oraclewithhassan_biosig_pro.css`
3. Confirm both files are available and note their generated URLs.

## 3) Reference JS and CSS in plugin **File URLs to Load**

1. Open the imported plugin definition.
2. In **File URLs to Load**, add:
   - JavaScript file URL for `oraclewithhassan_biosig_pro.js`
   - CSS file URL for `oraclewithhassan_biosig_pro.css`
3. Save the plugin.

> Tip: Prefer application static file substitutions (for example `#APP_FILES#`) for portability across environments.

## 4) Add the plugin item to a page

1. Open the target page in Page Designer.
2. Create a new item and select the **BioSig Pro** plugin item type.
3. Name the item (for example `P2_SIG`).
4. Configure plugin attributes as needed (size, pen color, pen width, rotation, text signature mode, placeholder).

## 5) Configure session state for CLOB support

1. Open the signature page item properties.
2. Locate the **Session State** settings.
3. Set storage to **Per Session (Disk)**.

This is recommended for larger base64 payloads and reliable handling of signature content.

## 6) Add the PL/SQL submit process

1. Create a page process on submit (for example on **Processing** point).
2. Use the code from `plsql/submit_process.sql`.
3. Ensure your upload table and columns exist and match the script.
4. Save and run the page.

## Validation Checklist

- Signature draws correctly on desktop and mobile.
- Hidden item receives base64 PNG content.
- Submit process converts base64 to BLOB without errors.
- Record is inserted and a generated file name is stored.

## Next Step

Continue with [CONFIGURATION.md](CONFIGURATION.md) for tuning attributes and recommended production defaults.
