import { App } from '@capacitor/app';
import { DocumentScanner } from '@capacitor-mlkit/document-scanner';

const LOG_STORAGE_KEY = 'repro-log';
const logElement = document.getElementById('log');

// The log is kept in localStorage so that it survives the app restart that this bug causes.
function log(message, data) {
  const line = `${new Date().toISOString()} ${message}${data === undefined ? '' : ' ' + JSON.stringify(data)}`;
  const previous = localStorage.getItem(LOG_STORAGE_KEY) || '';
  localStorage.setItem(LOG_STORAGE_KEY, previous + line + '\n');
  render();
}

function render() {
  logElement.textContent = localStorage.getItem(LOG_STORAGE_KEY) || '(empty)';
}

render();
log('app started');

// Registered before anything else, as the Capacitor docs recommend for appRestoredResult.
App.addListener('appRestoredResult', event => {
  log('appRestoredResult', event);
});

document.getElementById('scan').addEventListener('click', async () => {
  log('scanDocument called');
  try {
    const result = await DocumentScanner.scanDocument({
      pageLimit: 5,
      resultFormats: 'JPEG',
      scannerMode: 'FULL',
    });
    log('scanDocument resolved', result);
  } catch (error) {
    log('scanDocument rejected', { message: error?.message || String(error) });
  }
});

document.getElementById('check-module').addEventListener('click', async () => {
  try {
    const result = await DocumentScanner.isGoogleDocumentScannerModuleAvailable();
    log('isGoogleDocumentScannerModuleAvailable', result);
    if (!result.available) {
      await DocumentScanner.installGoogleDocumentScannerModule();
      log('installGoogleDocumentScannerModule started');
    }
  } catch (error) {
    log('module check failed', { message: error?.message || String(error) });
  }
});

document.getElementById('clear-log').addEventListener('click', () => {
  localStorage.removeItem(LOG_STORAGE_KEY);
  render();
});
