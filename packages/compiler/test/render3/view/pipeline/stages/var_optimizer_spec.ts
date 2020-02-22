import * as o from '../../../../../src/output/output_ast';
import * as uir from '../../../../../src/render3/view/pipeline/ir/update';
import {VariableOptimizerStage} from '../../../../../src/render3/view/pipeline/stages/var_optimizer';
import {UpdateBuilder} from '../util/update';

describe('variable optimizer', () => {
  xit('should not merge NextContext expressions across references', () => {
    const builder = new UpdateBuilder();
    const v0 = builder.addVarNextContext();
    /* const v1 = */ builder.addVarExpression(builder.varExpression(v0).prop('$implicit'));
    const v2 = builder.addVarNextContext();
    const v3 = builder.addVarExpression(builder.varExpression(v2).prop('$implicit'));
    const v4 = builder.addVarReference(0);
    /* const v5 = */ builder.addVarNextContext();
    /* const v6 = */ builder.addVarReference(1);
    builder.addInterpolate(0, [builder.varExpression(v4), builder.varExpression(v3)]);
    const list = builder.build();
    console.error(list.toString(uir.nodeToString));

    list.applyTransform(new VariableOptimizerStage());
    console.error(list.toString(uir.nodeToString));
    fail('...');
  });
});

const FRESH_NODE = {
  prev: null,
  next: null,
};