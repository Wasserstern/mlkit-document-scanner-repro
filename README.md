# mlkit-document-scanner-repro

Minimal reproduction for `@capacitor-mlkit/document-scanner`: the `scanDocument(...)` result is lost when Android destroys the app while the Google document scanner is open, and no `appRestoredResult` event is emitted.

Based on [capawesome-team/.capacitor-app](https://github.com/capawesome-team/.capacitor-app).

## Setup

```bash
npm install
npm run build
npx cap sync android
npx cap open android
```

Run the app on a physical Android device with Google Play services (the scanner module is downloaded by Play services on first use; the "Check scanner module" button triggers that).

## Steps to reproduce

1. On the device, enable Developer options → **Don't keep activities**, then fully close the app once.
2. Open the app and tap **Scan document**. The log shows `scanDocument called`.
3. In the Google scanner, capture one page and press **Save**.
4. The app is recreated. The log (kept in localStorage so it survives the restart) shows a new `app started` line, but neither `scanDocument resolved`, `scanDocument rejected`, nor `appRestoredResult`. The scanned page is lost.

Closer to the production case, without the developer option: while the scanner is in the foreground, run

```bash
adb shell am kill io.example.documentscannerrepro
```

then press **Save** in the scanner. Same result.

## Expected

Same behavior as `@capacitor-mlkit/barcode-scanning` since [#356](https://github.com/capawesome-team/capacitor-mlkit/pull/356): the result is delivered through the `appRestoredResult` event of `@capacitor/app` when the app is restored.

## What the app does

- `src/js/app.js` registers an `appRestoredResult` listener at startup, offers one button that calls `scanDocument({ pageLimit: 5, resultFormats: 'JPEG' })`, and appends everything to a persistent log.
