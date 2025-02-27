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

import { diag } from '@opentelemetry/api';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Resource } from '../Resource';
import { DetectorSync, ResourceAttributes } from '../types';
import { ResourceDetectionConfig } from '../config';
import { IResource } from '../IResource';

/**
 * ProcessDetectorSync will be used to detect the resources related current process running
 * and being instrumented from the NodeJS Process module.
 */
class ProcessDetectorSync implements DetectorSync {
  detect(config?: ResourceDetectionConfig): IResource {
    // Skip if not in Node.js environment.
    if (typeof process !== 'object') {
      return Resource.empty();
    }
    const processResource: ResourceAttributes = {
      [SemanticResourceAttributes.PROCESS_PID]: process.pid,
      [SemanticResourceAttributes.PROCESS_EXECUTABLE_NAME]: process.title || '',
      [SemanticResourceAttributes.PROCESS_COMMAND]: process.argv[1] || '',
      [SemanticResourceAttributes.PROCESS_COMMAND_LINE]:
        process.argv.join(' ') || '',
      [SemanticResourceAttributes.PROCESS_RUNTIME_VERSION]:
        process.versions.node,
      [SemanticResourceAttributes.PROCESS_RUNTIME_NAME]: 'nodejs',
      [SemanticResourceAttributes.PROCESS_RUNTIME_DESCRIPTION]: 'Node.js',
    };
    return this._getResourceAttributes(processResource, config);
  }
  /**
   * Validates process resource attribute map from process variables
   *
   * @param processResource The unsantized resource attributes from process as key/value pairs.
   * @param config: Config
   * @returns The sanitized resource attributes.
   */
  private _getResourceAttributes(
    processResource: ResourceAttributes,
    _config?: ResourceDetectionConfig
  ) {
    if (
      processResource[SemanticResourceAttributes.PROCESS_EXECUTABLE_NAME] ===
        '' ||
      processResource[SemanticResourceAttributes.PROCESS_EXECUTABLE_PATH] ===
        '' ||
      processResource[SemanticResourceAttributes.PROCESS_COMMAND] === '' ||
      processResource[SemanticResourceAttributes.PROCESS_COMMAND_LINE] === '' ||
      processResource[SemanticResourceAttributes.PROCESS_RUNTIME_VERSION] === ''
    ) {
      diag.debug(
        'ProcessDetector failed: Unable to find required process resources. '
      );
      return Resource.empty();
    } else {
      return new Resource({
        ...processResource,
      });
    }
  }
}

export const processDetectorSync = new ProcessDetectorSync();
