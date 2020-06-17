/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AttributeMarker} from '../../../../../../src/core';
import {ElementAttrs} from '../../../../../../src/render3/view/pipeline/features/element';
import {filterAttrs, FilterAttrsPredicate} from '../../../../../../src/render3/view/pipeline/features/element/util';

describe('element utils', () => {
  describe('filterAttrs', () => {
    it('should filter an empty set of values', () => {
      expectFilterAttrs([], () => true).toEqual([]);
      expectFilterAttrs([], () => false).toEqual([]);
    });

    it('should filter a set of values with only markers', () => {
      expectFilterAttrs([AttributeMarker.Bindings], () => true).toEqual([]);
      expectFilterAttrs([AttributeMarker.Bindings], () => false).toEqual([]);
      expectFilterAttrs([AttributeMarker.Bindings, AttributeMarker.Styles], () => true).toEqual([]);
      expectFilterAttrs([AttributeMarker.Bindings, AttributeMarker.Styles], () => false)
          .toEqual([]);
      expectFilterAttrs(
          [AttributeMarker.Bindings, AttributeMarker.Styles, AttributeMarker.Classes], () => true)
          .toEqual([]);
      expectFilterAttrs(
          [AttributeMarker.Bindings, AttributeMarker.Styles, AttributeMarker.Classes], () => false)
          .toEqual([]);
    });

    it('should retain entries when true', () => {
      const attrs = ['one', 1, 'two', 2];
      expectFilterAttrs(attrs, () => true).toEqual(['one', 1, 'two', 2]);
    });

    it('should reject entries when true', () => {
      const attrs = ['one', 1, 'two', 2];
      expectFilterAttrs(attrs, () => false).toEqual([]);
    });

    it('should retain/reject individual entries', () => {
      const attrs = ['one', 1, 'two', 2];
      expectFilterAttrs(attrs, (marker: AttributeMarker, value: any, key: any) => {
        return key !== 'one';
      }).toEqual(['two', 2]);
    });

    it('should filter class entries', () => {
      const attrs = [
        'key', 'value', AttributeMarker.Classes, 'one', 'two', 'three', AttributeMarker.Bindings,
        'A', 'B', 'C'
      ];

      expectFilterAttrs(
          attrs,
          (marker: AttributeMarker, value: any,
           key: any) => {return marker === AttributeMarker.Classes})
          .toEqual([AttributeMarker.Classes, 'one', 'two', 'three']);
    });

    it('should filter style entries', () => {
      const attrs = [
        'key', 'value', AttributeMarker.Styles, 'width', '100px', 'height', '200px',
        AttributeMarker.Bindings, 'A', 'B', 'C'
      ];

      expectFilterAttrs(
          attrs,
          (marker: AttributeMarker, value: any,
           key: any) => {return marker === AttributeMarker.Styles})
          .toEqual([AttributeMarker.Styles, 'width', '100px', 'height', '200px']);
    });

    it('should filter binding entries', () => {
      const attrs = [
        'key', 'value', AttributeMarker.Styles, 'width', '100px', 'height', '200px',
        AttributeMarker.Bindings, 'A', 'B', 'C'
      ];

      expectFilterAttrs(
          attrs,
          (marker: AttributeMarker, value: any,
           key: any) => {return marker === AttributeMarker.Bindings})
          .toEqual([AttributeMarker.Bindings, 'A', 'B', 'C']);
    });

    it('should filter template entries', () => {
      const attrs = [
        'key', 'value', AttributeMarker.Template, 'one', 'two', 'three', AttributeMarker.Bindings,
        'A', 'B', 'C'
      ];

      expectFilterAttrs(
          attrs,
          (marker: AttributeMarker, value: any,
           key: any) => {return marker === AttributeMarker.Template})
          .toEqual([AttributeMarker.Template, 'one', 'two', 'three']);
    });

    it('should filter projectAs entries', () => {
      const attrs = [
        'key', 'value', AttributeMarker.ProjectAs, ['selector'], AttributeMarker.Bindings, 'A', 'B',
        'C'
      ];

      expectFilterAttrs(
          attrs,
          (marker: AttributeMarker, value: any,
           key: any) => {return marker === AttributeMarker.ProjectAs})
          .toEqual([AttributeMarker.ProjectAs, ['selector']]);
    });

    it('should filter i18n entries', () => {
      const attrs = [
        'key', 'value', AttributeMarker.I18n, 'foo', 'bar', 'baz', AttributeMarker.Bindings, 'A',
        'B', 'C'
      ];

      expectFilterAttrs(
          attrs,
          (marker: AttributeMarker, value: any,
           key: any) => {return marker === AttributeMarker.I18n})
          .toEqual([AttributeMarker.I18n, 'foo', 'bar', 'baz']);
    });

    it('should filter namespace entries', () => {
      const attrs = [
        'key1',
        'value1',
        AttributeMarker.NamespaceURI,
        'ns1',
        'key1',
        'value1',
        AttributeMarker.NamespaceURI,
        'ns2',
        'key2',
        'value2',
        'key2',
        'value2',
        AttributeMarker.NamespaceURI,
        'ns3',
        'key3',
        'value3',
      ];

      expectFilterAttrs(
          attrs,
          (marker: AttributeMarker, value: any, key: any, ns?: string) => {
            return marker === AttributeMarker.NamespaceURI && ns === 'ns2';
          })
          .toEqual([
            AttributeMarker.NamespaceURI,
            'ns2',
            'key2',
            'value2',
          ]);
    });

    it('should permit being called multiple times ', () => {
      let attrs: ElementAttrs = [
        'key1',
        'value1',
        AttributeMarker.NamespaceURI,
        'ns',
        'key',
        'value',
        AttributeMarker.Styles,
        'width',
        '200px',
        AttributeMarker.Classes,
        'one',
        'two',
        'three',
        AttributeMarker.Bindings,
        'A',
        'B',
        'C',
        AttributeMarker.Template,
        'T1',
        'T2',
        'T3',
        AttributeMarker.ProjectAs,
        ['selector'],
        AttributeMarker.I18n,
        'foo',
        'bar'
      ];

      attrs = filterAttrs(attrs, rejectMarker(AttributeMarker.Styles));
      expect(attrs).toEqual([
        'key1',
        'value1',
        AttributeMarker.NamespaceURI,
        'ns',
        'key',
        'value',
        AttributeMarker.Classes,
        'one',
        'two',
        'three',
        AttributeMarker.Bindings,
        'A',
        'B',
        'C',
        AttributeMarker.Template,
        'T1',
        'T2',
        'T3',
        AttributeMarker.ProjectAs,
        ['selector'],
        AttributeMarker.I18n,
        'foo',
        'bar'
      ]);

      attrs = filterAttrs(attrs, rejectMarker(AttributeMarker.Classes));
      expect(attrs).toEqual([
        'key1', 'value1', AttributeMarker.NamespaceURI, 'ns', 'key', 'value',
        AttributeMarker.Bindings, 'A', 'B', 'C', AttributeMarker.Template, 'T1', 'T2', 'T3',
        AttributeMarker.ProjectAs, ['selector'], AttributeMarker.I18n, 'foo', 'bar'
      ]);

      attrs = filterAttrs(attrs, rejectMarker(AttributeMarker.Bindings));
      expect(attrs).toEqual([
        'key1', 'value1', AttributeMarker.NamespaceURI, 'ns', 'key', 'value',
        AttributeMarker.Template, 'T1', 'T2', 'T3', AttributeMarker.ProjectAs, ['selector'],
        AttributeMarker.I18n, 'foo', 'bar'
      ]);

      attrs = filterAttrs(attrs, rejectMarker(AttributeMarker.NamespaceURI));
      expect(attrs).toEqual([
        'key1', 'value1', AttributeMarker.Template, 'T1', 'T2', 'T3', AttributeMarker.ProjectAs,
        ['selector'], AttributeMarker.I18n, 'foo', 'bar'
      ]);

      attrs = filterAttrs(attrs, rejectMarker(AttributeMarker.Template));
      expect(attrs).toEqual([
        'key1', 'value1', AttributeMarker.ProjectAs, ['selector'], AttributeMarker.I18n, 'foo',
        'bar'
      ]);

      attrs = filterAttrs(attrs, rejectMarker(AttributeMarker.ProjectAs));
      expect(attrs).toEqual(['key1', 'value1', AttributeMarker.I18n, 'foo', 'bar']);

      attrs = filterAttrs(attrs, rejectMarker(AttributeMarker.I18n));
      expect(attrs).toEqual(['key1', 'value1']);

      attrs = filterAttrs(attrs, () => false);
      expect(attrs).toEqual([]);
    });

    it('should remove markers when all the values are filtered out', () => {
      let attrs: ElementAttrs = [
        'key1',
        'value1',
        AttributeMarker.Styles,
        'width',
        '200px',
        AttributeMarker.Classes,
        'one',
        'two',
        'three',
        AttributeMarker.Bindings,
        'A',
        'two',
        'C',
      ];

      attrs = filterAttrs(attrs, (marker: AttributeMarker, value: any) => {
        return value !== 'one';
      });
      expect(attrs).toEqual([
        'key1',
        'value1',
        AttributeMarker.Styles,
        'width',
        '200px',
        AttributeMarker.Classes,
        'two',
        'three',
        AttributeMarker.Bindings,
        'A',
        'two',
        'C',
      ]);

      attrs = filterAttrs(attrs, (marker: AttributeMarker, value: any) => {
        return value !== 'two';
      });
      expect(attrs).toEqual([
        'key1',
        'value1',
        AttributeMarker.Styles,
        'width',
        '200px',
        AttributeMarker.Classes,
        'three',
        AttributeMarker.Bindings,
        'A',
        'C',
      ]);

      attrs = filterAttrs(attrs, (marker: AttributeMarker, value: any) => {
        return value !== 'three';
      });
      expect(attrs).toEqual([
        'key1',
        'value1',
        AttributeMarker.Styles,
        'width',
        '200px',
        AttributeMarker.Bindings,
        'A',
        'C',
      ]);
    });
  });
});

function expectFilterAttrs(attrs: ElementAttrs, filterFn: FilterAttrsPredicate) {
  return expect(filterAttrs(attrs, filterFn));
}

function filterMarker(marker: AttributeMarker) {
  return (m: AttributeMarker) => m === marker;
}

function rejectMarker(marker: AttributeMarker) {
  return (m: AttributeMarker) => m !== marker;
}
