/* ============================================================
   EDIT THIS FILE to change your business details and settings
   ============================================================ */
window.TACH_CONFIG = {
  business: {
    name: 'Tachbonest Classic Ventures',
    bn: 'BN 2217663',
    address: '11, Adewunmi Ogefon St, Ladipo, Lagos',
    phones: ['08035613703', '07080760582'],   // check these against your quotation pad
    whatsapp: '2348035613703',                // WhatsApp number in international format, no + sign
    email: ''                                 // optional, e.g. 'info@yourdomain.com'
  },

  // Delivery options shown at checkout. fee = naira amount, or null = "confirmed by us after you order".
  // Put your real fees here. Nothing is invented.
  delivery: [
    { id: 'pickup', label: 'I will pick up / collect', fee: 0 },
    { id: 'deliver', label: 'Deliver to my address', fee: null }
  ],

  // Fill in your real links. Empty ones are hidden on the site.
  social: { facebook: '', instagram: '', tiktok: '', x: '' },

  // Add only REAL customer reviews, e.g. { name: 'Mrs A.', text: 'Fitted in two days.', place: 'Surulere' }.
  // While this list is empty, the reviews section stays hidden.
  reviews: [],

  // 'local'    = orders are saved in the browser only (good for testing / demo)
  // 'firebase' = orders from ALL customers arrive in your admin page (needs the free Firebase setup in README.md)
  provider: 'local',

  // Fill this in only when provider is 'firebase' (see README.md, Step 3)
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    appId: ''
  }
};
