import {
  cleanTitle,
  validateAndMapSources,
  buildDeterministicResponse,
  AttachedDoc,
} from '../research';

const MOCK_DOCS: AttachedDoc[] = [
  { id: 'doc-1', name: 'AI Research Paper', content: 'This paper explores neural networks.' },
  { id: 'doc-2', name: 'Risk Analysis Report', content: 'Risk factors include data drift.' },
];

// ─── cleanTitle ──────────────────────────────────────────────────────────────

describe('cleanTitle', () => {
  it('strips leading question words', () => {
    expect(cleanTitle('hãy giải thích phương pháp luận')).toBe('Giải thích phương pháp luận');
  });

  it('removes trailing punctuation', () => {
    expect(cleanTitle('What is the main contribution?')).toBe('The main contribution');
  });

  it('truncates long titles at 40 chars with ellipsis', () => {
    const long = 'This is a very long research question about machine learning';
    const result = cleanTitle(long);
    expect(result.length).toBeLessThanOrEqual(40);
    expect(result).toContain('...');
  });

  it('capitalizes first letter', () => {
    expect(cleanTitle('neural networks in NLP')).toBe('Neural networks in NLP');
  });

  it('returns fallback on empty input', () => {
    expect(cleanTitle('')).toBe('Nghiên cứu mới');
  });

  it('returns fallback when only punctuation remains', () => {
    expect(cleanTitle('???')).toBe('Nghiên cứu mới');
  });
});

// ─── validateAndMapSources ────────────────────────────────────────────────────

describe('validateAndMapSources', () => {
  it('keeps sources with a valid documentId', () => {
    const sources = [{ documentId: 'doc-1', documentName: 'Wrong Name', page: 1 }];
    const result = validateAndMapSources(sources, MOCK_DOCS);
    expect(result).toHaveLength(1);
    expect(result[0].documentName).toBe('AI Research Paper');
  });

  it('maps sources by documentName when id is missing', () => {
    const sources = [{ documentId: '', documentName: 'Risk Analysis Report' }];
    const result = validateAndMapSources(sources, MOCK_DOCS);
    expect(result).toHaveLength(1);
    expect(result[0].documentId).toBe('doc-2');
  });

  it('maps sources by documentName case-insensitively', () => {
    const sources = [{ documentId: '', documentName: 'risk analysis report' }];
    const result = validateAndMapSources(sources, MOCK_DOCS);
    expect(result[0].documentId).toBe('doc-2');
  });

  it('falls back to first doc when no match found', () => {
    const sources = [{ documentId: 'nonexistent', documentName: 'Unknown' }];
    const result = validateAndMapSources(sources, MOCK_DOCS);
    expect(result).toHaveLength(1);
    expect(result[0].documentId).toBe('doc-1');
  });

  it('removes sources when doc list is empty and id is invalid', () => {
    const sources = [{ documentId: 'nonexistent', documentName: 'Unknown' }];
    const result = validateAndMapSources(sources, []);
    expect(result).toHaveLength(0);
  });

  it('handles empty sources array', () => {
    expect(validateAndMapSources([], MOCK_DOCS)).toEqual([]);
  });
});

// ─── buildDeterministicResponse ──────────────────────────────────────────────

describe('buildDeterministicResponse', () => {
  it('returns a valid ResearchResponse structure', () => {
    const result = buildDeterministicResponse('What is the summary?', MOCK_DOCS);
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('key_points');
    expect(result).toHaveProperty('risks');
    expect(result).toHaveProperty('actions');
    expect(result).toHaveProperty('sources');
  });

  it('includes doc names in summary', () => {
    const result = buildDeterministicResponse('summarize everything', MOCK_DOCS);
    expect(result.summary).toContain('AI Research Paper');
  });

  it('generates sources matching each attached doc', () => {
    const result = buildDeterministicResponse('test', MOCK_DOCS);
    expect(result.sources).toHaveLength(MOCK_DOCS.length);
    expect(result.sources[0].documentId).toBe('doc-1');
    expect(result.sources[1].documentId).toBe('doc-2');
  });

  it('includes high-severity risk when question mentions rủi ro', () => {
    const result = buildDeterministicResponse('các rủi ro chính là gì', MOCK_DOCS);
    const highRisk = result.risks.find((r) => r.severity === 'high');
    expect(highRisk).toBeDefined();
  });

  it('does NOT include high-severity risk for neutral questions', () => {
    const result = buildDeterministicResponse('Explain the methodology', MOCK_DOCS);
    const highRisk = result.risks.find((r) => r.severity === 'high');
    expect(highRisk).toBeUndefined();
  });

  it('key_points references document count', () => {
    const result = buildDeterministicResponse('test', MOCK_DOCS);
    const docCountPoint = result.key_points.find((p) => p.includes('2'));
    expect(docCountPoint).toBeDefined();
  });

  it('works with a single document', () => {
    const result = buildDeterministicResponse('single doc test', [MOCK_DOCS[0]]);
    expect(result.sources).toHaveLength(1);
    expect(result.summary).toContain('AI Research Paper');
  });

  it('includes doc content preview in sources', () => {
    const result = buildDeterministicResponse('test', MOCK_DOCS);
    expect(result.sources[0].excerpt).toContain('neural networks');
  });
});
