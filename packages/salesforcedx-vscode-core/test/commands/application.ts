/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Application } from 'spectron';
import fs = require('fs');
import path = require('path');
import { SpectronClient } from './client';

/**
 * Wraps Spectron's Application instance with its used methods.
 */
export class SpectronApplication {
  public client: SpectronClient;

  private spectron: Application;
  private keybindings: any[];

  private readonly sampleExtensionsDir: string = 'test_data/sample_extensions_dir';
  private readonly pollTrials = 5;
  private readonly pollTimeout = 3; // in secs
  private testRetry = 1;

  constructor() {
    this.spectron = new Application({
      path: '/Applications/Visual Studio Code.app/Contents/MacOS/Electron',
      args: [
        '/Users/james.sweetman/development/salesforcedx-vscode/packages/salesforcedx-vscode-core/test/test_data/test_workspace',
        '--skip-getting-started',
        '--extensions-dir=/Users/james.sweetman/development/salesforcedx-vscode/packages'
      ],
      chromeDriverArgs: ['user-data-dir=test_data/temp_user_dir'],
      startTimeout: 10000
    });
    this.client = new SpectronClient(this.spectron);
    this.retrieveKeybindings();
  }

  public get app(): Application {
    return this.spectron;
  }

  public async start(): Promise<any> {
    try {
      await this.spectron.start();
      const count = await this.spectron.client.getWindowCount();
      await this.focusOnWindow(1); // focuses on main renderer window
      return this.checkWindowReady();
    } catch (err) {
      throw err;
    }
  }

  public async stop(): Promise<any> {
    if (this.spectron && this.spectron.isRunning()) {
      return await this.spectron.stop();
    }
  }

  public waitFor(func: (...args: any[]) => any, args: any): Promise<any> {
    return this.callClientAPI(func, args);
  }

  public wait(): Promise<any> {
    return new Promise(resolve =>
      setTimeout(resolve, this.testRetry * this.pollTimeout * 1000)
    );
  }

  public focusOnWindow(index: number): Promise<any> {
    return this.client.windowByIndex(index);
  }

  private checkWindowReady(): Promise<any> {
    return this.waitFor(
      this.spectron.client.getHTML,
      '[id="workbench.main.container"]'
    );
  }

  private retrieveKeybindings() {
    fs.readFile(
      path.join(process.cwd(), `test/test_data/keybindings.json`),
      'utf8',
      (err, data) => {
        if (err) {
          throw err;
        }
        try {
          this.keybindings = JSON.parse(data);
        } catch (e) {
          throw new Error(`Error parsing keybindings JSON: ${e}`);
        }
      }
    );
  }

  private callClientAPI(
    func: (...args: any[]) => Promise<any>,
    args: any
  ): Promise<any> {
    let trial = 1;
    return new Promise(async (res, rej) => {
      while (true) {
        if (trial > this.pollTrials) {
          rej(
            `Could not retrieve the element in ${this.testRetry *
              this.pollTrials *
              this.pollTimeout} seconds.`
          );
          break;
        }

        let result;
        try {
          result = await func.call(this.client, args, false);
          // tslint:disable-next-line:no-empty
        } catch (e) {}

        if (result && result !== '') {
          res(result);
          break;
        }

        await this.wait();
        trial++;
      }
    });
  }

  /*
	 * Retrieves the command from keybindings file and executes it with WebdriverIO client API
	 * @param command command (e.g. 'workbench.action.files.newUntitledFile')
	 */
  public command(command: string, capture?: boolean): Promise<any> {
    const binding = this.keybindings.find(x => x['command'] === command);
    if (!binding) {
      return Promise.reject(`Key binding for ${command} was not found.`);
    }

    const keys: string = binding.key;
    const keysToPress: string[] = [];

    const chords = keys.split(' ');
    chords.forEach(chord => {
      const keys2 = chord.split('+');
      keys2.forEach(key => keysToPress.push(this.transliterate(key)));
      keysToPress.push('NULL');
    });

    return this.client.keys(keysToPress, capture);
  }

  /*
	 * Transliterates key names from keybindings file to WebdriverIO keyboard actions defined in:
	 * https://w3c.github.io/webdriver/webdriver-spec.html#keyboard-actions
	 */
  private transliterate(key: string): string {
    switch (key) {
      case 'ctrl':
        return 'Control';
      case 'cmd':
        return 'Meta';
      default:
        return key.length === 1
          ? key
          : key.charAt(0).toUpperCase() + key.slice(1);
    }
  }
}
