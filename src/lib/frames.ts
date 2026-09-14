const frameModules = import.meta.glob(
  '../assets/video_frames/frame_*.jpg',
  { eager: true, import: 'default' }
) as Record<string, string>;

/** Sorted frame URLs for the hero canvas scrub. */
export const frameUrls: string[] = Object.keys(frameModules).sort().map(k => frameModules[k]);
