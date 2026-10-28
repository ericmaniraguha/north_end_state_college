import { ICONS } from './icons.js';

export default function Icon({ name, className = 'icon' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={ICONS[name]} />
    </svg>
  );
}
