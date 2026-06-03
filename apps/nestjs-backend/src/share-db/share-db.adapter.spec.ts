import { IdPrefix } from '@teable/core';
import { ShareDbAdapter } from './share-db.adapter';

describe('ShareDbAdapter snapshot metadata', () => {
  const createAdapter = (snapshotData: unknown[]) => {
    const clsStore: Record<string, unknown> = {};
    const cls = {
      get: vi.fn((key?: string) => (key ? clsStore[key] : clsStore)),
      runWith: vi.fn(async (_store: Record<string, unknown>, callback: () => Promise<unknown>) =>
        callback()
      ),
    };
    const readonlyService = {
      getSnapshotBulk: vi.fn().mockResolvedValue(snapshotData),
    };
    const adapter = new ShareDbAdapter(
      cls as never,
      readonlyService as never,
      readonlyService as never,
      readonlyService as never,
      readonlyService as never,
      {} as never
    );

    return { adapter };
  };

  it('preserves snapshot metadata returned by readonly service', async () => {
    const metadata = { ctime: 10, mtime: 20, _create: { src: 'src1', seq: 1, v: 0 } };
    const { adapter } = createAdapter([
      { id: 'rec1', v: 1, type: 'json0', data: { fields: {} }, m: metadata },
    ]);

    const result = await new Promise<Record<string, { m: unknown }> | undefined>(
      (resolve, reject) => {
        adapter.getSnapshotBulk(
          `${IdPrefix.Record}_tbl1`,
          ['rec1'],
          undefined,
          { cookie: 'token=test' },
          (err, data) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(data as Record<string, { m: unknown }>);
          }
        );
      }
    );

    expect(result?.rec1.m).toEqual(metadata);
  });

  it('builds legacy metadata for existing snapshots without metadata', async () => {
    const { adapter } = createAdapter([{ id: 'rec1', v: 3, type: 'json0', data: { fields: {} } }]);

    const result = await new Promise<Record<string, { m: unknown }> | undefined>(
      (resolve, reject) => {
        adapter.getSnapshotBulk(
          `${IdPrefix.Record}_tbl1`,
          ['rec1'],
          undefined,
          { cookie: 'token=test' },
          (err, data) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(data as Record<string, { m: unknown }>);
          }
        );
      }
    );

    expect(result?.rec1.m).toEqual({
      ctime: 0,
      mtime: 0,
      _create: {
        src: 'legacy-rec1',
        seq: 0,
        v: 0,
      },
    });
  });
});
