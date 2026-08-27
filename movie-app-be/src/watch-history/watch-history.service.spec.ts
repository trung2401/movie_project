import { Repository } from 'typeorm'

import { WatchHistory } from './entities/watch-history.entity'
import { WatchHistoryService } from './watch-history.service'

describe('WatchHistoryService', () => {
  it('writes the same user and episode through an atomic upsert', async () => {
    const history = {
      id: 'history-id',
      movieSlug: 'secret-relationship',
      movieName: 'Mối Quan Hệ Bí Mật',
      episodeSlug: 'full',
      progressSeconds: 1,
      updatedAt: new Date('2026-08-27T00:00:00.000Z'),
    } as WatchHistory
    const upsert = jest.fn().mockResolvedValue({})
    const findOne = jest.fn().mockResolvedValue(history)
    const repository = {
      upsert,
      findOne,
    } as unknown as Repository<WatchHistory>
    const service = new WatchHistoryService(repository)

    await Promise.all([
      service.upsert('user-id', {
        movieSlug: ' Secret-Relationship ',
        movieName: ' Mối Quan Hệ Bí Mật ',
        episodeSlug: ' FULL ',
        progressSeconds: 1,
      }),
      service.upsert('user-id', {
        movieSlug: 'secret-relationship',
        movieName: 'Mối Quan Hệ Bí Mật',
        episodeSlug: 'full',
        progressSeconds: 1,
      }),
    ])

    expect(upsert).toHaveBeenCalledTimes(2)
    expect(upsert).toHaveBeenCalledWith(
      {
        user: { id: 'user-id' },
        movieSlug: 'secret-relationship',
        movieName: 'Mối Quan Hệ Bí Mật',
        episodeSlug: 'full',
        progressSeconds: 1,
      },
      ['user', 'movieSlug', 'episodeSlug'],
    )
    expect(findOne).toHaveBeenCalledTimes(2)
  })
})
