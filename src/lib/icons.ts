export interface IconMetadata {
  name: string;
  tags: string[];
  category: IconCategory;
}

export type IconCategory = 
  | 'Business'
  | 'Office'
  | 'Education'
  | 'Research'
  | 'Finance'
  | 'Technology'
  | 'AI'
  | 'Science'
  | 'Healthcare'
  | 'Government'
  | 'People'
  | 'Communication'
  | 'Social Media'
  | 'Marketing'
  | 'Shopping'
  | 'Travel'
  | 'Transport'
  | 'Maps'
  | 'Weather'
  | 'Food'
  | 'Security'
  | 'Cloud'
  | 'Programming'
  | 'Database'
  | 'Charts'
  | 'Media'
  | 'Files'
  | 'Devices'
  | 'Arrows'
  | 'Shapes'
  | 'Emoji'
  | 'General';

export const ICON_CATEGORIES: IconCategory[] = [
  'Business', 'Office', 'Education', 'Research', 'Finance', 'Technology', 
  'AI', 'Science', 'Healthcare', 'Government', 'People', 'Communication', 
  'Social Media', 'Marketing', 'Shopping', 'Travel', 'Transport', 'Maps', 
  'Weather', 'Food', 'Security', 'Cloud', 'Programming', 'Database', 
  'Charts', 'Media', 'Files', 'Devices', 'Arrows', 'Shapes', 'Emoji', 'General'
];

export const ICONS: IconMetadata[] = [
  // Business & Office
  { name: 'briefcase', tags: ['work', 'job', 'business'], category: 'Business' },
  { name: 'building', tags: ['office', 'company', 'work'], category: 'Business' },
  { name: 'presentation', tags: ['slide', 'meeting', 'business'], category: 'Business' },
  { name: 'pie-chart', tags: ['data', 'stats', 'analytics'], category: 'Charts' },
  { name: 'line-chart', tags: ['data', 'growth', 'stats'], category: 'Charts' },
  { name: 'bar-chart', tags: ['data', 'stats', 'analytics'], category: 'Charts' },
  { name: 'trending-up', tags: ['growth', 'increase', 'profit'], category: 'Finance' },
  { name: 'trending-down', tags: ['loss', 'decrease', 'decline'], category: 'Finance' },
  { name: 'wallet', tags: ['money', 'finance', 'pay'], category: 'Finance' },
  { name: 'credit-card', tags: ['payment', 'money', 'finance'], category: 'Finance' },
  { name: 'banknote', tags: ['money', 'cash', 'finance'], category: 'Finance' },
  { name: 'coins', tags: ['money', 'cash', 'finance'], category: 'Finance' },

  // Technology & AI
  { name: 'cpu', tags: ['tech', 'chip', 'processor'], category: 'Technology' },
  { name: 'hard-drive', tags: ['storage', 'tech', 'data'], category: 'Technology' },
  { name: 'database', tags: ['data', 'storage', 'server'], category: 'Database' },
  { name: 'server', tags: ['tech', 'network', 'host'], category: 'Technology' },
  { name: 'cloud', tags: ['storage', 'network', 'internet'], category: 'Cloud' },
  { name: 'cloud-lightning', tags: ['tech', 'storm', 'network'], category: 'Cloud' },
  { name: 'bot', tags: ['ai', 'robot', 'automation'], category: 'AI' },
  { name: 'sparkles', tags: ['ai', 'magic', 'clean'], category: 'AI' },
  { name: 'brain', tags: ['ai', 'intelligence', 'think'], category: 'AI' },
  { name: 'brain-circuit', tags: ['ai', 'tech', 'think'], category: 'AI' },
  { name: 'zap', tags: ['energy', 'power', 'fast'], category: 'Technology' },

  // Communication & Social Media
  { name: 'mail', tags: ['email', 'message', 'contact'], category: 'Communication' },
  { name: 'message-square', tags: ['chat', 'comment', 'talk'], category: 'Communication' },
  { name: 'phone', tags: ['call', 'contact', 'talk'], category: 'Communication' },
  { name: 'share-2', tags: ['social', 'network', 'link'], category: 'Social Media' },
  { name: 'thumbs-up', tags: ['like', 'agree', 'good'], category: 'Social Media' },
  { name: 'thumbs-down', tags: ['dislike', 'disagree', 'bad'], category: 'Social Media' },
  { name: 'heart', tags: ['like', 'love', 'favorite'], category: 'Social Media' },
  { name: 'user', tags: ['person', 'profile', 'account'], category: 'People' },
  { name: 'users', tags: ['group', 'team', 'people'], category: 'People' },
  { name: 'user-plus', tags: ['add', 'person', 'follow'], category: 'People' },

  // Media & Files
  { name: 'image', tags: ['picture', 'photo', 'media'], category: 'Media' },
  { name: 'video', tags: ['movie', 'film', 'media'], category: 'Media' },
  { name: 'music', tags: ['audio', 'sound', 'media'], category: 'Media' },
  { name: 'file-text', tags: ['doc', 'paper', 'notes'], category: 'Files' },
  { name: 'folder', tags: ['storage', 'files', 'directory'], category: 'Files' },
  { name: 'camera', tags: ['photo', 'media', 'capture'], category: 'Media' },

  // Navigation & General
  { name: 'home', tags: ['house', 'main', 'start'], category: 'General' },
  { name: 'settings', tags: ['config', 'tools', 'setup'], category: 'General' },
  { name: 'search', tags: ['find', 'lookup', 'magnify'], category: 'General' },
  { name: 'map-pin', tags: ['location', 'place', 'gps'], category: 'Maps' },
  { name: 'calendar', tags: ['date', 'time', 'schedule'], category: 'General' },
  { name: 'bell', tags: ['notification', 'alert', 'alarm'], category: 'General' },
  { name: 'check', tags: ['done', 'ok', 'correct'], category: 'General' },
  { name: 'x', tags: ['close', 'cancel', 'remove'], category: 'General' },
  { name: 'arrow-right', tags: ['next', 'direction', 'move'], category: 'Arrows' },
  { name: 'arrow-left', tags: ['prev', 'direction', 'back'], category: 'Arrows' },
  { name: 'arrow-up', tags: ['up', 'direction', 'move'], category: 'Arrows' },
  { name: 'arrow-down', tags: ['down', 'direction', 'move'], category: 'Arrows' },

  // Education & Science
  { name: 'graduation-cap', tags: ['school', 'learn', 'education'], category: 'Education' },
  { name: 'book', tags: ['read', 'learn', 'education'], category: 'Education' },
  { name: 'microscope', tags: ['science', 'research', 'lab'], category: 'Science' },
  { name: 'flask-conical', tags: ['science', 'chemistry', 'lab'], category: 'Science' },

  // Devices
  { name: 'monitor', tags: ['computer', 'screen', 'tech'], category: 'Devices' },
  { name: 'smartphone', tags: ['mobile', 'phone', 'tech'], category: 'Devices' },
  { name: 'laptop', tags: ['computer', 'portable', 'tech'], category: 'Devices' },
  { name: 'tablet', tags: ['mobile', 'pad', 'tech'], category: 'Devices' },

  // Weather
  { name: 'sun', tags: ['weather', 'day', 'light'], category: 'Weather' },
  { name: 'moon', tags: ['weather', 'night', 'dark'], category: 'Weather' },
  { name: 'cloud-sun', tags: ['weather', 'day', 'partly'], category: 'Weather' },

  // Shopping & Food
  { name: 'shopping-cart', tags: ['buy', 'store', 'ecommerce'], category: 'Shopping' },
  { name: 'shopping-bag', tags: ['buy', 'store', 'ecommerce'], category: 'Shopping' },
  { name: 'utensils', tags: ['food', 'eat', 'restaurant'], category: 'Food' },
  { name: 'coffee', tags: ['drink', 'break', 'cafe'], category: 'Food' },
];
