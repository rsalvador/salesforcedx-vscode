import { expect } from 'chai';
import * as path from 'path';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import {
  CancelResponse,
  CommandletExecutor,
  CompositeParametersGatherer,
  ContinueResponse,
  DirFileNameSelection,
  EmptyParametersGatherer,
  EmptyPostChecker,
  FilePathExistsChecker,
  LightningFilePathExistsChecker,
  ParametersGatherer,
  SelectPrioritizedDirPath,
  SelectStrictDirPath,
  SfdxCommandlet
} from '../../src/commands/commands';
import * as ForceApexExecute from '../../src/commands/forceApexExecute';
import { nls } from '../../src/messages';
import { notificationService } from '../../src/notifications';

describe('Force Apex Execute Command', () => {
  describe('CreateApexTempFile Parameter Gatherer', () => {
    let writeFileAsyncSpy: sinon.SinonSpy;
    const INPUT_TEXT_ARG = 1;

    before(() => {
      writeFileAsyncSpy = sinon
        .stub(ForceApexExecute, 'writeFileAsync')
        .returnsArg(INPUT_TEXT_ARG);
    });

    after(() => {
      writeFileAsyncSpy.restore();
    });

    afterEach(() => {
      writeFileAsyncSpy.reset();
    });

    it('CreateApexTempFile should return cancel if no editor open', async () => {
      const gatherer = new ForceApexExecute.CreateApexTempFile();
      const response = await gatherer.gather();
      expect(response.type).to.equal('CANCEL');
    });

    it('CreateApexTempFile should get text of document if no text selected in editor', async () => {
      const apexExecuteFile = path.join(
        vscode.workspace.rootPath!,
        'force-app',
        'main',
        'default',
        'classes',
        'apexExecute.cls'
      );
      await vscode.workspace.openTextDocument(apexExecuteFile);
    });

    // it('CreateApexTempFile should get selected text in editor when text selected', async () => {});
  });
});
