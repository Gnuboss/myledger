/* ════════════════════════════════════════════════════════
   GLOBALS — loaded first, before all other JS
   ════════════════════════════════════════════════════════ */

const STORE_KEY    = 'ml_docs_v1';
const SETTINGS_KEY = 'ml_settings_v1';
const SEEN_KEY     = 'ml_seen_v1';
const BANNER_KEY   = 'ml_banner_v1';

let DB          = [];
let SETTINGS    = {};
let CID         = null;
let LIST_FILTER = 'all';
let ROW_COUNTER = 0;

const STATUS_CLASS = {
  'quote':      's-quote',
  'quote-sent': 's-sent',
  'accepted':   's-accepted',
  'declined':   's-void',
  'draft':      's-draft',
  'pending':    's-pending',
  'paid':       's-paid',
  'overdue':    's-overdue',
  'void':       's-void',
};

const STATUS_LABEL = {
  'quote':      'QUOTE',
  'quote-sent': 'SENT',
  'accepted':   'ACCEPTED',
  'declined':   'DECLINED',
  'draft':      'DRAFT',
  'pending':    'PENDING',
  'paid':       'PAID',
  'overdue':    'OVERDUE',
  'void':       'VOID',
};

const PAY_METHODS = ['bank', 'wise', 'paypal', 'crypto'];

const SAMPLE_QUOTE_ITEMS = [
  { title: 'Discovery & Strategy',  detail: 'Kick-off, research, project brief',        qty: 1, rate: 800,  disc: 0 },
  { title: 'Design & Creative',     detail: 'Concepts, revisions, final assets',        qty: 1, rate: 1500, disc: 0 },
  { title: 'Delivery & Handoff',    detail: 'Source files, documentation, walkthrough', qty: 1, rate: 500,  disc: 0 },
];

const SAMPLE_INVOICE_ITEMS = [
  { title: 'Service / Product',     detail: 'Description of deliverable',               qty: 1, rate: 1000, disc: 0 },
  { title: 'Additional Service',    detail: 'Description of deliverable',               qty: 2, rate: 250,  disc: 0 },
  { title: 'Expenses / Materials',  detail: 'Itemised costs or disbursements',          qty: 1, rate: 150,  disc: 0 },
];
