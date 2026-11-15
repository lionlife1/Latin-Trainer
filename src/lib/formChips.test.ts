import { formChipsHtml } from './formChips';

describe('formChipsHtml', () => {
    it('renders one chip per part and escapes values', () => {
        expect(formChipsHtml([{ key: 'Person', value: '2nd pl.' }, { key: 'Form', value: '<b>' }])).toBe(
            "<div class='form-chips'><span class='form-chip'><span class='form-chip-k'>Person</span><span class='form-chip-v'>2nd pl.</span></span>" +
            "<span class='form-chip'><span class='form-chip-k'>Form</span><span class='form-chip-v'>&lt;b&gt;</span></span></div>",
        );
    });
});
