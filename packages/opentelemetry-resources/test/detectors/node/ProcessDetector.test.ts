/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as sinon from 'sinon';
import { processDetector, IResource } from '../../../src';
import {
  assertResource,
  assertEmptyResource,
} from '../../util/resource-assertions';
import { describeNode } from '../../util';

describeNode('processDetector() on Node.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return resource information from process', async () => {
    sinon.stub(process, 'pid').value(1234);
    sinon.stub(process, 'title').value('otProcess');
    sinon
      .stub(process, 'argv')
      .value(['/tmp/node', '/home/ot/test.js', 'arg1', 'arg2']);
    sinon.stub(process, 'versions').value({ node: '1.4.1' });

    const resource: IResource = await processDetector.detect();
    assertResource(resource, {
      pid: 1234,
      name: 'otProcess',
      command: '/home/ot/test.js',
      commandLine: '/tmp/node /home/ot/test.js arg1 arg2',
      version: '1.4.1',
      runtimeDescription: 'Node.js',
      runtimeName: 'nodejs',
    });
  });
  it('should return empty resources if title, command and commondLine is missing', async () => {
    sinon.stub(process, 'pid').value(1234);
    sinon.stub(process, 'title').value(undefined);
    sinon.stub(process, 'argv').value([]);
    const resource: IResource = await processDetector.detect();
    assertEmptyResource(resource);
  });
});
