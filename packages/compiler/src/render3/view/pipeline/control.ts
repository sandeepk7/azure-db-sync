/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let _templatePipelineActive = false;
export function enableTemplatePipeline() {
  _templatePipelineActive = true;
}

export function disableTemplatePipeline() {
  _templatePipelineActive = false;
}

export function isTemplatePipelineActive() {
  return _templatePipelineActive;
}
