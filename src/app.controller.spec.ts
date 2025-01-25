import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello and Welcome to the Wonderful World of My Learning Curve !!"', () => {
      expect(appController.getHello()).toBe(
        'Hello and Welcome to the Wonderful World of My Learning Curve !',
      );
    });
  });
});
