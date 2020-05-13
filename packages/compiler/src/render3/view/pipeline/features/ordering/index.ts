/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';

export class SortingStage extends ir.UpdateOnlyTemplateStage {
  visitList(list: ir.UpdateList): void {
    // loop over each entry
    // figure out how to bundle each entry together
    // list.sortSubset
    let start: ir.UpdateNode|null = null;
    let end: ir.UpdateNode|null = null;
    let id: ir.Id|null = null;

    for (let node = list.head; node !== null; node = node.next) {
      if (ir.hasOrderableAspect(node)) {
        // process the node
        if (id === null) {
          // starting a new region
          start = end = node;
          id = node.id;
        } else if (node.id !== id) {
          // end the current region
          // sort the existing region
          sortRegion(list, start!, end!);
          // start a new region
          start = end = node;
          id = node.id;
        } else {
          end = node;
        }
      } else if (start !== null) {
        // process the previous region
        sortRegion(list, start, end!);
        start = end = id = null;
      }
    }

    if (start !== null) {
      sortRegion(list, start, end!);
    }
  }
}

function sortRegion(list: ir.UpdateList, start: ir.UpdateNode, end: ir.UpdateNode): void {
  list.sortSubset(start, end, compareRegionNodes);
}

function compareRegionNodes(a: ir.UpdateNode, b: ir.UpdateNode): number {
  if (!ir.hasOrderableAspect(a) || !ir.hasOrderableAspect(b)) {
    throw new Error('Expected only orderable nodes in the region');
  }
  return a.priority - b.priority;
}

export class SortingHostStage implements ir.HostStage {
  transform(host: ir.Host): void {
    host.update.applyTransform(new SortingStage());
  }
}
