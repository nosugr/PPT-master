import { projects } from "./api";

/**
 * Load slide SVGs in batches to avoid overwhelming the server with parallel requests.
 * Loads `batchSize` slides at a time, waiting for each batch to complete before starting the next.
 */
export async function loadSlidesBatched(
  slideList: { name: string }[],
  projectId: string,
  onLoaded: (name: string, svg: string) => void,
  batchSize = 4,
) {
  for (let i = 0; i < slideList.length; i += batchSize) {
    const batch = slideList.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (slide) => {
        try {
          const data = await projects.getSlide(projectId, slide.name);
          if (data.svg) onLoaded(slide.name, data.svg);
        } catch {
          /* ignore individual slide load failures */
        }
      }),
    );
  }
}
