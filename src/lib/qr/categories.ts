/**
 * Data-driven category definitions — single source of truth for all QR types.
 * Adding a new category = adding one entry here. No more 4-branch if/else chains.
 */

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'tel'
  | 'email'
  | 'url'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'file'
  | 'image'
  | 'password';

export interface CategoryField {
  id: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  helper?: string;
  accept?: string;
}

export interface CategoryDef {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  fields: CategoryField[];
  encode: (v: Record<string, string | boolean>) => string | null;
  validate: (v: Record<string, string | boolean>) => string | null;
  preview?: (v: Record<string, string | boolean>) => string;
}

const escapeWifi = (s: string): string =>
  s.replace(/([\\;,":])/g, '\\$1');

const escapeVCard = (s: string): string => s.replace(/([\\,;])/g, '\\$1');

const digitsOnly = (s: string): string => s.replace(/[^\d+]/g, '');

const isEmpty = (v: string | boolean | undefined): boolean =>
  v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

export const categories: CategoryDef[] = [
  {
    id: 'text',
    label: 'Plain Text',
    description: 'Encode any text — notes, codes, quotes, anything.',
    icon: 'Type',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
    fields: [
      {
        id: 'text',
        label: 'Your Text',
        kind: 'textarea',
        placeholder: 'Type or paste anything…',
        required: true,
      },
    ],
    encode: (v) => String(v.text || '').trim(),
    validate: (v) => (isEmpty(v.text) ? 'Please enter some text.' : null),
    preview: (v) => String(v.text || '').slice(0, 80),
  },
  {
    id: 'url',
    label: 'Website URL',
    description: 'Open any website, blog, or product page.',
    icon: 'Globe',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    fields: [
      {
        id: 'url',
        label: 'URL',
        kind: 'url',
        placeholder: 'example.com',
        required: true,
        helper: 'We auto-prefix https:// if missing.',
      },
    ],
    encode: (v) => {
      let u = String(v.url || '').trim();
      if (!u) return null;
      if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
      return u;
    },
    validate: (v) => (isEmpty(v.url) ? 'Please enter a URL.' : null),
    preview: (v) => {
      let u = String(v.url || '').trim();
      if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u;
      return u;
    },
  },
  {
    id: 'instagram',
    label: 'Instagram',
    description: 'Link to any Instagram profile.',
    icon: 'Instagram',
    color: '#e1306c',
    gradient: 'linear-gradient(135deg, #e1306c, #f77737)',
    fields: [
      {
        id: 'username',
        label: 'Username',
        kind: 'text',
        placeholder: 'nasa',
        required: true,
        helper: 'Without the @ symbol.',
      },
    ],
    encode: (v) => {
      let u = String(v.username || '').trim().replace(/^@/, '');
      if (!u) return null;
      return `https://instagram.com/${u}`;
    },
    validate: (v) =>
      isEmpty(v.username) ? 'Please enter an Instagram username.' : null,
    preview: (v) => {
      const u = String(v.username || '').trim().replace(/^@/, '');
      return u ? `https://instagram.com/${u}` : '';
    },
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Open a chat — with an optional pre-filled message.',
    icon: 'MessageCircle',
    color: '#25D366',
    gradient: 'linear-gradient(135deg, #25D366, #128C7E)',
    fields: [
      {
        id: 'phone',
        label: 'Phone Number',
        kind: 'tel',
        placeholder: '919876543210',
        required: true,
        helper: 'Country code + number, digits only.',
      },
      {
        id: 'message',
        label: 'Pre-filled Message (optional)',
        kind: 'textarea',
        placeholder: 'Hi, I saw your QR…',
      },
    ],
    encode: (v) => {
      const phone = digitsOnly(String(v.phone || ''));
      if (!phone) return null;
      const msg = String(v.message || '').trim();
      const url = `https://wa.me/${phone}`;
      return msg ? `${url}?text=${encodeURIComponent(msg)}` : url;
    },
    validate: (v) => {
      const phone = digitsOnly(String(v.phone || ''));
      if (!phone) return 'Please enter a valid phone number.';
      if (phone.length < 8) return 'Phone number looks too short.';
      return null;
    },
    preview: (v) => {
      const phone = digitsOnly(String(v.phone || ''));
      return phone ? `https://wa.me/${phone}` : '';
    },
  },
  {
    id: 'email',
    label: 'Email',
    description: 'Compose an email with pre-filled subject and body.',
    icon: 'Mail',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #f43f5e)',
    fields: [
      {
        id: 'to',
        label: 'To',
        kind: 'email',
        placeholder: 'hello@example.com',
        required: true,
      },
      { id: 'subject', label: 'Subject', kind: 'text', placeholder: 'Hello!' },
      { id: 'body', label: 'Body', kind: 'textarea', placeholder: 'Hi there,' },
    ],
    encode: (v) => {
      const to = String(v.to || '').trim();
      if (!to) return null;
      const params = new URLSearchParams();
      if (!isEmpty(v.subject)) params.set('subject', String(v.subject));
      if (!isEmpty(v.body)) params.set('body', String(v.body));
      const q = params.toString();
      return `mailto:${to}${q ? '?' + q : ''}`;
    },
    validate: (v) => {
      if (isEmpty(v.to)) return 'Please enter a recipient email.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v.to)))
        return 'Email address looks invalid.';
      return null;
    },
  },
  {
    id: 'phone',
    label: 'Phone Call',
    description: 'One-tap dial a phone number.',
    icon: 'Phone',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #6366f1)',
    fields: [
      {
        id: 'phone',
        label: 'Phone Number',
        kind: 'tel',
        placeholder: '+1 234 567 8900',
        required: true,
      },
    ],
    encode: (v) => {
      const phone = digitsOnly(String(v.phone || ''));
      if (!phone) return null;
      return `tel:${phone}`;
    },
    validate: (v) => {
      const phone = digitsOnly(String(v.phone || ''));
      if (!phone) return 'Please enter a phone number.';
      return null;
    },
    preview: (v) => {
      const phone = digitsOnly(String(v.phone || ''));
      return phone ? `tel:${phone}` : '';
    },
  },
  {
    id: 'sms',
    label: 'SMS',
    description: 'Open SMS app with pre-filled message.',
    icon: 'MessageSquare',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    fields: [
      {
        id: 'phone',
        label: 'Phone Number',
        kind: 'tel',
        placeholder: '+1 234 567 8900',
        required: true,
      },
      { id: 'body', label: 'Message', kind: 'textarea', placeholder: 'Hey!' },
    ],
    encode: (v) => {
      const phone = digitsOnly(String(v.phone || ''));
      if (!phone) return null;
      const body = String(v.body || '').trim();
      return body
        ? `sms:${phone}?&body=${encodeURIComponent(body)}`
        : `sms:${phone}`;
    },
    validate: (v) => {
      const phone = digitsOnly(String(v.phone || ''));
      if (!phone) return 'Please enter a phone number.';
      return null;
    },
  },
  {
    id: 'wifi',
    label: 'Wi-Fi',
    description: 'Connect to WiFi in one tap.',
    icon: 'Wifi',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    fields: [
      {
        id: 'ssid',
        label: 'Network Name (SSID)',
        kind: 'text',
        placeholder: 'MyHomeWiFi',
        required: true,
      },
      {
        id: 'password',
        label: 'Password',
        kind: 'password',
        placeholder: '••••••••',
      },
      {
        id: 'security',
        label: 'Security',
        kind: 'select',
        options: [
          { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
          { value: 'WEP', label: 'WEP' },
          { value: 'nopass', label: 'No Password' },
        ],
      },
      { id: 'hidden', label: 'Hidden Network', kind: 'checkbox' },
    ],
    encode: (v) => {
      const ssid = String(v.ssid || '').trim();
      if (!ssid) return null;
      const sec = String(v.security || 'WPA');
      const pass = sec === 'nopass' ? '' : String(v.password || '');
      const hidden = v.hidden ? 'true' : 'false';
      return `WIFI:T:${sec};S:${escapeWifi(ssid)};P:${escapeWifi(pass)};H:${hidden};;`;
    },
    validate: (v) => {
      if (isEmpty(v.ssid)) return 'Please enter the network name.';
      const sec = String(v.security || 'WPA');
      if (sec !== 'nopass' && isEmpty(v.password))
        return 'Please enter the WiFi password.';
      return null;
    },
  },
  {
    id: 'vcard',
    label: 'Contact (vCard)',
    description: 'Share your contact card — saves to address book.',
    icon: 'Contact',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    fields: [
      { id: 'firstName', label: 'First Name', kind: 'text', required: true },
      { id: 'lastName', label: 'Last Name', kind: 'text', required: true },
      { id: 'phone', label: 'Phone', kind: 'tel' },
      { id: 'email', label: 'Email', kind: 'email' },
      { id: 'org', label: 'Organization', kind: 'text' },
      { id: 'title', label: 'Job Title', kind: 'text' },
      { id: 'url', label: 'Website', kind: 'url' },
    ],
    encode: (v) => {
      const first = String(v.firstName || '').trim();
      const last = String(v.lastName || '').trim();
      if (!first && !last) return null;
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeVCard(last)};${escapeVCard(first)};;;`,
        `FN:${escapeVCard(`${first} ${last}`.trim())}`,
      ];
      if (!isEmpty(v.phone))
        lines.push(`TEL;TYPE=CELL:${digitsOnly(String(v.phone))}`);
      if (!isEmpty(v.email)) lines.push(`EMAIL:${escapeVCard(String(v.email))}`);
      if (!isEmpty(v.org)) lines.push(`ORG:${escapeVCard(String(v.org))}`);
      if (!isEmpty(v.title)) lines.push(`TITLE:${escapeVCard(String(v.title))}`);
      if (!isEmpty(v.url)) lines.push(`URL:${String(v.url).trim()}`);
      lines.push('END:VCARD');
      return lines.join('\r\n');
    },
    validate: (v) => {
      if (isEmpty(v.firstName) && isEmpty(v.lastName))
        return 'Please enter at least a name.';
      return null;
    },
  },
  {
    id: 'location',
    label: 'Location',
    description: 'Open Google Maps / Apple Maps at a pin.',
    icon: 'MapPin',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    fields: [
      { id: 'lat', label: 'Latitude', kind: 'number', placeholder: '28.6139', required: true, helper: 'Decimal degrees.' },
      { id: 'lng', label: 'Longitude', kind: 'number', placeholder: '77.2090', required: true },
      { id: 'locName', label: 'Location Name (optional)', kind: 'text', placeholder: 'India Gate' },
    ],
    encode: (v) => {
      const lat = parseFloat(String(v.lat || ''));
      const lng = parseFloat(String(v.lng || ''));
      if (isNaN(lat) || isNaN(lng)) return null;
      return `geo:${lat},${lng}`;
    },
    validate: (v) => {
      const lat = parseFloat(String(v.lat || ''));
      const lng = parseFloat(String(v.lng || ''));
      if (isNaN(lat) || lat < -90 || lat > 90)
        return 'Latitude must be between -90 and 90.';
      if (isNaN(lng) || lng < -180 || lng > 180)
        return 'Longitude must be between -180 and 180.';
      return null;
    },
  },
  {
    id: 'youtube',
    label: 'YouTube',
    description: 'Link to a YouTube video.',
    icon: 'Youtube',
    color: '#ff0000',
    gradient: 'linear-gradient(135deg, #ff0000, #cc0000)',
    fields: [
      {
        id: 'url',
        label: 'Video URL or ID',
        kind: 'url',
        placeholder: 'https://youtu.be/dQw4w9WgXcQ',
        required: true,
      },
    ],
    encode: (v) => {
      const input = String(v.url || '').trim();
      if (!input) return null;
      const idMatch = input.match(
        /(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/,
      );
      if (idMatch) return `https://youtube.com/watch?v=${idMatch[1]}`;
      if (/^[A-Za-z0-9_-]{11}$/.test(input))
        return `https://youtube.com/watch?v=${input}`;
      return input.startsWith('http') ? input : `https://${input}`;
    },
    validate: (v) => (isEmpty(v.url) ? 'Please enter a YouTube URL or ID.' : null),
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    description: 'Link to an X profile.',
    icon: 'Twitter',
    color: '#1d9bf0',
    gradient: 'linear-gradient(135deg, #1d9bf0, #0a171f)',
    fields: [
      {
        id: 'username',
        label: 'Username',
        kind: 'text',
        placeholder: 'nasa',
        required: true,
      },
    ],
    encode: (v) => {
      const u = String(v.username || '').trim().replace(/^@/, '');
      if (!u) return null;
      return `https://twitter.com/${u}`;
    },
    validate: (v) =>
      isEmpty(v.username) ? 'Please enter a Twitter username.' : null,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    description: 'Link to a LinkedIn profile.',
    icon: 'Linkedin',
    color: '#0a66c2',
    gradient: 'linear-gradient(135deg, #0a66c2, #0a4a8a)',
    fields: [
      {
        id: 'username',
        label: 'Profile Username',
        kind: 'text',
        placeholder: 'in/yourname',
        required: true,
        helper: 'The part after linkedin.com/',
      },
    ],
    encode: (v) => {
      const u = String(v.username || '')
        .trim()
        .replace(/^(https?:\/\/)?(www\.)?linkedin\.com\//i, '')
        .replace(/^@/, '');
      if (!u) return null;
      return `https://linkedin.com/${u}`;
    },
    validate: (v) =>
      isEmpty(v.username) ? 'Please enter a LinkedIn username.' : null,
  },
  {
    id: 'bizcard',
    label: 'Business Card',
    description: 'Premium contact card with address — for professionals.',
    icon: 'Briefcase',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    fields: [
      { id: 'firstName', label: 'First Name', kind: 'text', required: true },
      { id: 'lastName', label: 'Last Name', kind: 'text', required: true },
      { id: 'title', label: 'Job Title', kind: 'text' },
      { id: 'org', label: 'Company', kind: 'text' },
      { id: 'phone', label: 'Phone', kind: 'tel' },
      { id: 'email', label: 'Email', kind: 'email' },
      { id: 'url', label: 'Website', kind: 'url' },
      { id: 'street', label: 'Street', kind: 'text' },
      { id: 'city', label: 'City', kind: 'text' },
      { id: 'state', label: 'State / Province', kind: 'text' },
      { id: 'zip', label: 'Postal Code', kind: 'text' },
      { id: 'country', label: 'Country', kind: 'text' },
    ],
    encode: (v) => {
      const first = String(v.firstName || '').trim();
      const last = String(v.lastName || '').trim();
      if (!first && !last) return null;
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeVCard(last)};${escapeVCard(first)};;;`,
        `FN:${escapeVCard(`${first} ${last}`.trim())}`,
      ];
      if (!isEmpty(v.title)) lines.push(`TITLE:${escapeVCard(String(v.title))}`);
      if (!isEmpty(v.org)) lines.push(`ORG:${escapeVCard(String(v.org))}`);
      if (!isEmpty(v.phone))
        lines.push(`TEL;TYPE=WORK,VOICE:${digitsOnly(String(v.phone))}`);
      if (!isEmpty(v.email)) lines.push(`EMAIL;TYPE=WORK:${escapeVCard(String(v.email))}`);
      if (!isEmpty(v.url)) lines.push(`URL:${String(v.url).trim()}`);
      if (
        !isEmpty(v.street) ||
        !isEmpty(v.city) ||
        !isEmpty(v.state) ||
        !isEmpty(v.zip) ||
        !isEmpty(v.country)
      ) {
        lines.push(
          `ADR;TYPE=WORK:;;${escapeVCard(String(v.street || ''))};${escapeVCard(
            String(v.city || ''),
          )};${escapeVCard(String(v.state || ''))};${escapeVCard(
            String(v.zip || ''),
          )};${escapeVCard(String(v.country || ''))}`,
        );
      }
      lines.push('END:VCARD');
      return lines.join('\r\n');
    },
    validate: (v) => {
      if (isEmpty(v.firstName) && isEmpty(v.lastName))
        return 'Please enter a name.';
      return null;
    },
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Encode an image URL (large files hosted externally).',
    icon: 'Image',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    fields: [
      {
        id: 'imageUrl',
        label: 'Public Image URL',
        kind: 'url',
        placeholder: 'https://example.com/photo.jpg',
        required: true,
        helper: 'Hosted image URL. The QR will encode the direct link.',
      },
      {
        id: 'imageUpload',
        label: '…or upload an image to host',
        kind: 'image',
        accept: 'image/*',
      },
    ],
    encode: (v) => {
      const url = String(v.imageUrl || '').trim();
      if (!url) return null;
      return url;
    },
    validate: (v) =>
      isEmpty(v.imageUrl) ? 'Please enter or upload an image.' : null,
  },
  {
    id: 'file',
    label: 'File / PDF',
    description: 'Encode a file URL (PDFs, documents, anything hosted).',
    icon: 'FileText',
    color: '#64748b',
    gradient: 'linear-gradient(135deg, #64748b, #334155)',
    fields: [
      {
        id: 'fileUrl',
        label: 'Public File URL',
        kind: 'url',
        placeholder: 'https://example.com/report.pdf',
        required: true,
        helper: 'Direct link to the file. The QR encodes this URL.',
      },
      {
        id: 'fileUpload',
        label: '…or upload a file to host',
        kind: 'file',
      },
    ],
    encode: (v) => {
      const url = String(v.fileUrl || '').trim();
      if (!url) return null;
      return url;
    },
    validate: (v) =>
      isEmpty(v.fileUrl) ? 'Please enter or upload a file URL.' : null,
  },
];

export const categoryMap: Record<string, CategoryDef> = Object.fromEntries(
  categories.map((c) => [c.id, c]),
);

export function getCategory(id: string): CategoryDef | undefined {
  return categoryMap[id];
}
