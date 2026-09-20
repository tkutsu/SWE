/**
 * Titles and ids only, so the sidebar renders without pulling in guides.ts.
 * Hand maintained alongside guides.ts; the smoke test fails if they drift.
 */
export type GuideRef = { id: string; title: string }
export type GuideGroupRef = { id: string; name: string; guides: GuideRef[] }

export const guideIndex: GuideGroupRef[] = [
  {
    id: 'design-exercises',
    name: 'System design exercises',
    guides: [
      { id: 'url-shortener', title: 'Design a URL shortener' },
      { id: 'design-rate-limiter', title: 'Design a rate limiter' },
      { id: 'design-news-feed', title: 'Design a news feed' },
      { id: 'design-chat', title: 'Design a chat app' },
      { id: 'design-autocomplete', title: 'Frontend: design an autocomplete widget' },
      { id: 'design-infinite-scroll', title: 'Frontend: design an infinite scroll feed' },
      { id: 'design-carousel', title: 'Frontend: design an image carousel' },
    ],
  },
  {
    id: 'behavioural',
    name: 'Behavioural',
    guides: [
      { id: 'star-stories', title: 'STAR stories to have ready' },
      { id: 'when-you-are-stuck', title: 'Handling a question you cannot answer' },
    ],
  },
]
