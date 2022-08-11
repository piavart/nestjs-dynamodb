import { createTestApp, setupDynalite, TestApp } from './test-utils/test-app';
import { TestService } from './test-utils/test.service';
import 'jest-dynalite/withDb';
import cats from './test-utils/stubs/db/cats';
import * as assert from 'assert';
import { Document } from '../entities/document';

const cat1Id = cats[0].id;

setupDynalite();

describe('DynamoDbModel', () => {
  let app: TestApp;
  let service: TestService;

  beforeEach(async () => {
    app = await createTestApp();
    service = app.module.get<TestService>(TestService);
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll((done) => {
    done();
  });

  describe('Method: findByPrimaryKey', () => {
    it('find by standard PK', async () => {
      const findedCat = await service.catsModel.findByPrimaryKey({
        id: '000000000000000000000010',
      });

      assert(findedCat instanceof Document);
    });
  });

  describe('Method: createItem', () => {
    it('success create item', async () => {
      const cat = service.catsModel.createItem({ withDefaultId: true });
      cat.name = 'some cat name';
      expect(cat._isNew).toBeTruthy();

      await cat.save();
      expect(cat._isNew).toBeFalsy();

      const findedCat = await service.catsModel.findByPrimaryKey({
        id: cat.id,
      });
      expect(findedCat.name).toBe(cat.name);
      expect(findedCat._isNew).toBeFalsy();
    });

    it('success create item subscription', async () => {
      const PK = { subId: '0000000000000000000001222', subject: 'global' };
      const sub = service.sbsModel.createItem();
      sub.subId = PK.subId;
      sub.subject = PK.subject;
      sub.status = 'any';
      expect(sub._isNew).toBeTruthy();

      await sub.save();
      expect(sub._isNew).toBeFalsy();

      const _sub = await service.sbsModel.findByPrimaryKey(PK);
      expect(_sub.status).toBe(sub.status);
      expect(_sub._isNew).toBeFalsy();
    });

    it('failed create item subscription', async () => {
      const PK = { subId: '000000000000000000000011', subject: 'global' };
      const sub = service.sbsModel.createItem();
      sub.subId = PK.subId;
      sub.subject = PK.subject;
      sub.status = 'any';
      expect(sub._isNew).toBeTruthy();

      await expect(sub.save()).rejects.toThrow(
        'The conditional request failed',
      );
    });
  });

  describe('Method: cerate', () => {
    it('success create: default PK', async () => {
      const cat = await service.catsModel.create({
        id: 'someId',
        name: 'Pushok',
      });

      assert(cat instanceof Document);
      expect(cat._isNew).toBeFalsy();
      expect(cat.id).toBe('someId');
      expect(cat.name).toBe('Pushok');
    });

    it('success create: custom PK', async () => {
      const sub = await service.sbsModel.create({
        subId: 'someId',
        subject: 'subject name',
        status: 'test',
      });

      assert(sub instanceof Document);
      expect(sub._isNew).toBeFalsy();
      expect(sub.subId).toBe('someId');
      expect(sub.subject).toBe('subject name');
      expect(sub.status).toBe('test');
    });

    it('failed create: default PK, id already exists', async () => {
      await expect(
        service.catsModel.create({
          id: '000000000000000000000010',
          name: 'Pushok',
        }),
      ).rejects.toThrow('The conditional request failed');
    });

    it('failed create: custom PK, pk already exists', async () => {
      await expect(
        service.sbsModel.create({
          subId: '000000000000000000000011',
          subject: 'global',
          status: 'test',
        }),
      ).rejects.toThrow('The conditional request failed');
    });

    it('failed create: custom PK, incomplete key', async () => {
      await expect(
        service.sbsModel.create({
          subId: '000000000000000000000013',
          status: 'test',
        } as any),
      ).rejects.toThrow();

      await expect(
        service.sbsModel.create({
          subject: 'global',
          status: 'test',
        } as any),
      ).rejects.toThrow();
    });
  });

  describe('Method: update', () => {
    it('update with standard PK', async () => {
      const newName = 'Barsik';
      await service.catsModel.update({ id: cat1Id }, { name: 'Barsik' });
      const cat = await service.catsModel.findByPrimaryKey({ id: cat1Id });
      expect(cat.name).toBe(newName);
      expect(cat.__v).toBe(0);
    });

    it('update with PK', async () => {
      const PK = { subId: '000000000000000000000011', subject: 'global' };
      await service.sbsModel.update(PK, { status: 'new status' });
      const subs = await service.sbsModel.findByPrimaryKey(PK);
      expect(subs.status).toBe('new status');
      expect(subs.__v).toBe(0);
    });
  });

  describe('Method: delete', () => {
    it('delete', async () => {
      const PK = { subId: '000000000000000000000011', subject: 'global' };
      await service.sbsModel.delete(PK);
      await expect(service.sbsModel.findByPrimaryKey(PK)).rejects.toThrow();
    });
  });
});
