/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Host, HostStage} from '../ir/api';
import * as uir from '../ir/update';
import * as cir from '../ir/create';
import {UpdateOnlyTemplateStage} from './base';

export class SortingStage extends UpdateOnlyTemplateStage {
  visitList(list: uir.List): void {
    // loop over each entry
    // figure out how to bundle each entry together
    // list.sortSubset
    let start: uir.Node|null = null;
    let end: uir.Node|null = null;
    let id: cir.CirId|null = null;

    for (let node = list.head; node !== null; node = node.next) {
      if (isElementUpdateInstruction(node)) {
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

function sortRegion(list: uir.List, start: uir.Node, end: uir.Node): void {
  list.sortSubset(start, end, compareRegionNodes);
}

/**
 * Docs...
 */
const INSTR_PRIORITY = new Map<uir.NodeKind, number>([
  [uir.NodeKind.StyleMap, 0],
  [uir.NodeKind.ClassMap, 1],
  [uir.NodeKind.StyleProp, 2],
  [uir.NodeKind.ClassProp, 3],
  [uir.NodeKind.Property, 4],
  [uir.NodeKind.Attribute, 5],
]);

function compareRegionNodes(a: uir.Node, b: uir.Node): number {
  const priorityA = INSTR_PRIORITY.get(a.kind)!;
  const priorityB = INSTR_PRIORITY.get(b.kind)!;
  return priorityA - priorityB;
}

export class SortingHostStage implements HostStage {
  transform(host: Host): void {
    host.update.applyTransform(new SortingStage());
  }
}

function isElementUpdateInstruction(node: uir.Node): node is uir.StyleMap|uir.StyleProp|uir.ClassMap|uir.ClassProp|uir.Property|uir.Attribute {
  switch (node.kind) {
    case uir.NodeKind.StyleMap:
    case uir.NodeKind.StyleProp:
    case uir.NodeKind.ClassMap:
    case uir.NodeKind.ClassProp:
    case uir.NodeKind.Property:
    case uir.NodeKind.Attribute:
      return true;
    default:
      return false;
  }
}
