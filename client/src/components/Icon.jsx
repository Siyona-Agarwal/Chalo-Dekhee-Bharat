import React from 'react'

const PATHS = {
  home: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  museum: 'M3 21h18M4 10h16M5 10V7l7-4 7 4v3M7 10v8m5-8v8m5-8v8',
  gallery: 'M4 5h16v14H4zM7 16l3-3 2 2 2-3 3 4M8 9h.01',
  games: 'M6.5 9h11a4.5 4.5 0 0 1 4.3 5.8l-1 3.1a2.5 2.5 0 0 1-4.5.6L14.5 16h-5l-1.8 2.5a2.5 2.5 0 0 1-4.5-.6l-1-3.1A4.5 4.5 0 0 1 6.5 9zM7 12v4m-2-2h4m7-1h.01m3 2h.01',
  map: 'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16m6-14v16',
  passport: 'M5 3h11a3 3 0 0 1 3 3v15H7a2 2 0 0 1-2-2zM5 17h14M10 8h5M10 11h5',
  close: 'M6 6l12 12M18 6 6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  sparkles: 'm12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z',
  location: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12a2.2 2.2 0 1 0 0-4.4A2.2 2.2 0 0 0 12 12z',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z',
  thermometer: 'M10 14.5V6a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0zM12 7v7',
  celebration: 'M4 20l16-16M4 4l3 3m10 10 3 3M12 3v3m0 12v3M3 12h3m12 0h3',
  food: 'M7 3v8m3-8v8M5 11h6M8 11v10m8-18v7m0 0c2 0 3-1 3-3V3m-3 7v11',
  gem: 'm12 3 8 6-8 12L4 9zM4 9h16M9 3l3 6 3-6M9 9l3 12 3-12',
  volumeOn: 'M4 10v4h4l5 4V6l-5 4zM16 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12',
  volumeOff: 'M4 10v4h4l5 4V6l-5 4zM18 9l4 6m0-6-4 6',
  nature: 'M12 21c0-7 2-12 8-16-1 7-1 12-8 16M12 21c0-5-2-9-7-12 0 6 2 10 7 12',
  wildlife: 'M4 18c3-6 6-8 8-8s5 2 8 8M8 10V7m8 3V7M7 18h10M10 14h4',
  budget: 'M12 3v18M17 7c-1-2-3-3-5-3-3 0-5 1-5 4s2 4 5 4 5 1 5 4-2 4-5 4c-2 0-4-1-5-3',
  compass: 'm12 3 6 6-6 12-6-12zM12 9l2 2-2 5-2-5z',
  backpack: 'M7 8a5 5 0 0 1 10 0v11H7zM9 8V6a3 3 0 0 1 6 0v2M7 13h10M10 17h4',
  calendar: 'M5 4h14v16H5zM8 2v4m8-4v4M5 9h14',
  weather: 'M6 16a4 4 0 1 1 1-7.9A5 5 0 0 1 17 10a3 3 0 0 1 0 6zM4 20l2-2m4 2 2-2m4 2 2-2',
  travelers: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 20a5 5 0 0 1 10 0m2 0a4 4 0 0 1 8 0',
  hotel: 'M4 19V6h16v13M4 12h16M7 9h3m4 0h3',
  diet: 'M4 4v8m3-8v8M2 8h7m-3 4v8m10-16v16m0-16c3 2 4 5 0 8',
  pace: 'M3 15a9 9 0 1 1 18 0M12 6v6l4 2',
  palette: 'M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h5a4 4 0 0 0 4-4 9 9 0 0 0-9-6zM7 10h.01M9 7h.01M15 7h.01',
  heart: 'M20 8.5C20 13 12 19 12 19S4 13 4 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 2.5z',
  warning: 'M12 3 22 20H2zM12 9v5m0 3h.01',
  hourglass: 'M6 3h12M6 21h12M8 3c0 4 4 5 4 9s-4 5-4 9m8-18c0 4-4 5-4 9s4 5 4 9',
  itinerary: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
  stamp: 'M5 20h14M8 17h8M9 17v-3a3 3 0 0 1 6 0v3M12 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM12 13v4m-4 4h8M5 6H3v2a4 4 0 0 0 4 4m12-6h2v2a4 4 0 0 1-4 4',
  book: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM8 4v16',
  speaker: 'M4 10v4h4l5 4V6l-5 4zM17 9a4 4 0 0 1 0 6',
  hint: 'M9 18h6m-5 3h4m-6-7a5 5 0 1 1 8 0c-1 1-2 2-2 4h-4c0-2-1-3-2-4z',
  target: 'M12 3v3m0 12v3M3 12h3m12 0h3M6.5 6.5l2 2m7 7 2 2m0-11-2 2m-7 7-2 2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  medal: 'M8 3h8l-2 5h-4zM12 8a5 5 0 1 0 0 10 5 5 0 0 0-5-5zM9 21l3-3 3 3',
  reset: 'M4 12a8 8 0 1 0 2-5.3M4 5v5h5',
  arrowRight: 'M4 12h15m-6-6 6 6-6 6',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4v5l3 2',
  rocket: 'M5 15c-2 1-3 3-3 5 2 0 4-1 5-3m8-9 3-3 3 3-3 3M7 17l-2-2 6-6 4 4-6 6zm8-8c2-3 4-5 7-6-1 3-3 5-6 7',
  artifact: 'M7 4h10v16H7zM10 8h4M10 12h4M10 16h3',
  story: 'M5 5h11a3 3 0 0 1 3 3v11H8a3 3 0 0 1-3-3zM8 5v14',
  play: 'm9 6 9 6-9 6z',
  check: 'm5 12 4 4 10-10',
}

export default function Icon({ name, size = 20, strokeWidth = 1.8, className, title }) {
  const path = PATHS[name] || PATHS.sparkles
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      <path d={path} />
    </svg>
  )
}
