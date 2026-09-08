export interface SelectOption {
  value: string
  label: string
}

export const productionTypes: SelectOption[] = [
  { value: 'feature', label: 'Feature Film' },
  { value: 'series', label: 'Series' },
  { value: 'short', label: 'Short Film' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'music_video', label: 'Music Video' },
  { value: 'animation', label: 'Animation' },
  { value: 'youtube', label: 'YouTube Video' },
  { value: 'social_reel', label: 'Social Media Reel / TikTok' },
  { value: 'podcast', label: 'Podcast / Vodcast' },
  { value: 'vlog', label: 'Vlog' },
  { value: 'other', label: 'Other' }
]

export const genres: SelectOption[] = [
  { value: 'action', label: 'Action' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'drama', label: 'Drama' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'horror', label: 'Horror' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'romance', label: 'Romance' },
  { value: 'scifi', label: 'Sci-Fi' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'western', label: 'Western' },
  { value: 'educational', label: 'Educational / Tutorial' },
  { value: 'review', label: 'Review / Unboxing' },
  { value: 'gaming', label: 'Gaming / Stream' },
  { value: 'variety', label: 'Entertainment / Variety' },
  { value: 'other', label: 'Other' }
]
