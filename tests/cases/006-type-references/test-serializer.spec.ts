import {Interface6} from './input';
import serialize from './serializer';

describe('serializer tests', () => {
    it('006 - full', () => {
        const full: Interface6 = {
            requiredType: {
                optional: true,
            },
            optionalInterface: {
                required: true,
            }
        };

        const {data: actualData} = serialize(full).toJSON();
        expect(actualData).toEqual([2, 1, 2, 1])
    });

    it('006 - empty', () => {
        const full: Interface6 = {
            requiredType: {},
        };

        const {data: actualData} = serialize(full).toJSON();
        expect(actualData).toEqual([0, 0])
    });
});