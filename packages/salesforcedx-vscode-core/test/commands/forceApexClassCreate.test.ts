/*
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// tslint:disable:no-unused-expression

import { expect } from 'chai';
import { Application } from 'spectron';
import { SpectronApplication } from './application';
import { CommonActions } from './common';

describe('Integration Test', () => {
  describe('Force Apex Class Create', async function(this) {
    const app = new SpectronApplication();
    const common = new CommonActions(app);
    before(async () => await app.start());
    after(async () => await app.stop());

    it('Check that the apex files are created and recently opened', async () => {
      await app.wait();
      await app.command('workbench.action.quickOpen');
      await common.type('>create apex');
      await app.client.keys(['NULL', 'Enter', 'NULL'], false);
      await app.wait();
      const fileName = 'sampleApexClass';
      await common.type(fileName);
      await app.client.keys(['NULL', 'Enter', 'NULL'], false);
      await app.wait();
      await app.client.keys(['NULL', 'Enter', 'NULL'], false);
      await app.wait();
      await app.command('workbench.action.quickOpen');
      await app.wait();
      await common.type(fileName);
      await app.wait();
      const elCount = await common.getQuickOpenElements();
      expect(elCount).to.equal(3);
    });
  });
});
