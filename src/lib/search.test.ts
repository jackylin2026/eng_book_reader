import { buildSearchIndex, searchIndex, serializeIndex, loadSerializedIndex } from './search'

describe('search', () => {
  const docs = [
    {
      id: 'b:c1',
      bookId: 'b',
      chapterId: 'c1',
      order: 0,
      text: 'Alice goes down the rabbit hole into wonderland.',
    },
    {
      id: 'b:c2',
      bookId: 'b',
      chapterId: 'c2',
      order: 1,
      text: 'The tea party starts with the mad hatter.',
    },
  ]

  it('returns chapter hits for text query', () => {
    const idx = buildSearchIndex(docs)
    const hits = searchIndex(idx, 'rabbit')
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0].chapterId).toBe('c1')
  })

  it('round-trips serialized index', () => {
    const idx = buildSearchIndex(docs)
    const json = serializeIndex(idx)
    const reloaded = loadSerializedIndex(json)
    const hits = searchIndex(reloaded, 'hatter')
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0].chapterId).toBe('c2')
  })
})
