import { renderToStaticMarkup } from 'react-dom/server';
import { renderInline } from './inline';

const html = (s: string) => renderToStaticMarkup(<>{renderInline(s)}</>);

describe('renderInline', () => {
  it('leaves plain text alone', () => {
    expect(html('amō, amās')).toBe('amō, amās');
  });
  it('renders *x* as em', () => {
    expect(html('the *ut* clause')).toBe('the <em>ut</em> clause');
  });
  it('renders **x** as strong', () => {
    expect(html('a **bold** word')).toBe('a <strong>bold</strong> word');
  });
  it('handles a mix', () => {
    expect(html('**A** then *b* and c')).toBe('<strong>A</strong> then <em>b</em> and c');
  });
  it('keeps an unmatched * literal', () => {
    expect(html('2 * 3')).toBe('2 * 3');
    expect(html('a *b')).toBe('a *b');
    expect(html('a **b')).toBe('a **b');
  });
  it('returns an array', () => {
    expect(Array.isArray(renderInline('x'))).toBe(true);
  });
});
