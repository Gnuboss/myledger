# MyLedger

Local-first invoicing and quoting. Runs in the browser, stores data in your browser, prints clean documents.

## Run locally

```bash
git clone https://github.com/gnuboss/myledger.git
cd myledger
open index.html        # macOS
# or double-click index.html in Finder
```

No install. No server. No account.

## Features

- Quote to invoice flow
- Client directory
- Settings: currency, terms, tax, quote validity
- Line items, totals, discount, tax
- Payment methods: Bank, Wise, PayPal, Crypto
- JSON backup and restore
- Print / PDF export
- Local storage only

## Usage

- **New Quote**: Documents > New Quote
- **Convert**: open a sent/accepted quote > Convert to Invoice
- **Print**: export a clean PDF from any document
- **Backup**: Settings > Data > Export JSON
- **Restore**: Settings > Data > Import JSON

## Data

- Storage: browser `localStorage`
- Files: export/import as JSON
- No cloud sync

## License

MIT
