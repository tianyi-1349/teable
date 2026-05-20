import { Module, forwardRef } from '@nestjs/common';
import { V2Module } from '../../v2/v2.module';
import { UndoRedoStackModule } from '../stack/undo-redo-stack.module';
import { UndoRedoController } from './undo-redo.controller';
import { UndoRedoService } from './undo-redo.service';

@Module({
  imports: [UndoRedoStackModule, forwardRef(() => V2Module)],
  controllers: [UndoRedoController],
  providers: [UndoRedoService],
})
export class UndoRedoModule {}
