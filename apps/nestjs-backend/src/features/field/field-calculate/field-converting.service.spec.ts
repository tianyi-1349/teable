import type { PrismaService } from '@teable/db-main-prisma';
import type { Knex } from 'knex';
import { FieldConvertingService } from './field-converting.service';

describe('FieldConvertingService', () => {
  let service: FieldConvertingService;

  beforeEach(() => {
    service = new FieldConvertingService(
      {} as never,
      {} as never,
      {} as never,
      {} as PrismaService,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as Knex
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the correct changes', () => {
    expect(
      service['getOptionsChanges'](
        {
          formatting: 'italic',
          showAs: 'number',
          filter: {
            conjunction: 'and',
            filterSet: [
              {
                fieldId: 'fldxxxxxxx01',
                operator: 'is',
                value: 'x',
              },
            ],
          },
          filterByViewId: 'viewxxxxxxx01',
          visibleFieldIds: ['fldxxxxxxx01'],
          anotherKey: 'anotherKey',
        },
        {
          formatting: 'bold',
          showAs: 'text',
          filter: {
            conjunction: 'and',
            filterSet: [
              {
                fieldId: 'fldxxxxxxx02',
                operator: 'is',
                value: 'x',
              },
            ],
          },
          filterByViewId: 'viewxxxxxxx02',
          visibleFieldIds: ['fldxxxxxxx02'],
          otherKey: 'otherKey',
        }
      )
    ).toEqual({
      anotherKey: 'anotherKey',
      otherKey: null,
    });

    expect(
      service['getOptionsChanges'](
        {
          formatting: 'italic',
          showAs: 'number',
          filter: {
            conjunction: 'and',
            filterSet: [
              {
                fieldId: 'fldxxxxxxx01',
                operator: 'is',
                value: 'x',
              },
            ],
          },
          filterByViewId: 'viewxxxxxxx01',
          visibleFieldIds: ['fldxxxxxxx01'],
          anotherKey: 'anotherKey',
        },
        {
          formatting: 'bold',
          showAs: 'text',
          filter: {
            conjunction: 'and',
            filterSet: [
              {
                fieldId: 'fldxxxxxxx02',
                operator: 'is',
                value: 'x',
              },
            ],
          },
          filterByViewId: 'viewxxxxxxx02',
          visibleFieldIds: ['fldxxxxxxx02'],
          otherKey: 'otherKey',
        },
        true
      )
    ).toEqual({
      anotherKey: 'anotherKey',
      otherKey: null,
      formatting: null,
      showAs: null,
      filter: null,
      filterByViewId: null,
      visibleFieldIds: null,
      sort: null,
      limit: null,
    });

    expect(
      service['getOptionsChanges'](
        {
          formatting: 'italic',
          showAs: 'number',
          filter: {
            conjunction: 'and',
            filterSet: [
              {
                fieldId: 'fldxxxxxxx01',
                operator: 'is',
                value: 'x',
              },
            ],
          },
          filterByViewId: 'viewxxxxxxx01',
          visibleFieldIds: ['fldxxxxxxx01'],
          otherKey: 'newOtherKey',
        },
        {
          formatting: 'bold',
          showAs: 'text',
          filter: {
            conjunction: 'and',
            filterSet: [
              {
                fieldId: 'fldxxxxxxx02',
                operator: 'is',
                value: 'x',
              },
            ],
          },
          filterByViewId: 'viewxxxxxxx02',
          visibleFieldIds: ['fldxxxxxxx02'],
          otherKey: 'oldOtherKey',
        }
      )
    ).toEqual({
      otherKey: 'newOtherKey',
    });
  });
});
