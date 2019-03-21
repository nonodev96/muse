import { Utils } from './utils';

describe('Utils', () => {
  it('should create an instance', () => {
    expect(new Utils().setUnion({},{})).toBeTruthy();
  });
});
