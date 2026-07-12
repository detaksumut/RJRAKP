/**
 * ASIA Index Rating Engine
 * Verifies article quality using Zenodo, ORCID, Scopus, and Crossref APIs
 */

const ZENODO_TOKEN = import.meta.env.VITE_ZENODO_API_TOKEN;
const SCOPUS_KEY = import.meta.env.VITE_SCOPUS_API_KEY;
const ORCID_CLIENT_ID = import.meta.env.VITE_ORCID_CLIENT_ID;

export interface AsiaVerificationResult {
  zenodo_verified: boolean;
  orcid_verified: boolean;
  scopus_verified: boolean;
  crossref_verified: boolean;
  has_abstract: boolean;
  has_issn: boolean;
  asia_score: number;
  asia_rating: number; // 1-5 stars
  asia_label: string;
}

export interface ArticleToVerify {
  doi?: string;
  title?: string;
  authors?: string;
  abstract?: string;
  issn?: string;
}

/**
 * Verify DOI in Zenodo (+20 pts)
 */
async function verifyZenodo(doi: string): Promise<boolean> {
  if (!doi || !ZENODO_TOKEN) return false;
  try {
    const cleanDoi = doi.replace('https://doi.org/', '').replace('http://doi.org/', '');
    const res = await fetch(`https://zenodo.org/api/records?q=doi:"${cleanDoi}"&access_token=${ZENODO_TOKEN}`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.hits?.total > 0;
  } catch {
    return false;
  }
}

/**
 * Verify author in ORCID (+20 pts)
 * Searches for the first author by name
 */
async function verifyOrcid(authors: string): Promise<boolean> {
  if (!authors) return false;
  try {
    const firstAuthor = authors.split(',')[0].trim();
    const query = encodeURIComponent(firstAuthor);
    const res = await fetch(`https://pub.orcid.org/v3.0/search/?q=family-name:${query}&rows=1`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return false;
    const data = await res.json();
    return (data['num-found'] || 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Verify article in Scopus (+30 pts)
 */
async function verifyScopus(doi: string, title: string): Promise<boolean> {
  if (!SCOPUS_KEY) return false;
  try {
    let query = '';
    if (doi) {
      const cleanDoi = doi.replace('https://doi.org/', '').replace('http://doi.org/', '');
      query = `DOI("${cleanDoi}")`;
    } else if (title) {
      query = `TITLE("${title.substring(0, 80)}")`;
    } else return false;

    const res = await fetch(
      `https://api.elsevier.com/content/search/scopus?query=${encodeURIComponent(query)}&count=1`,
      { headers: { 'X-ELS-APIKey': SCOPUS_KEY, 'Accept': 'application/json' } }
    );
    if (!res.ok) return false;
    const data = await res.json();
    const total = parseInt(data['search-results']?.['opensearch:totalResults'] || '0');
    return total > 0;
  } catch {
    return false;
  }
}

/**
 * Verify DOI in Crossref (+15 pts)
 */
async function verifyCrossref(doi: string, title: string): Promise<boolean> {
  try {
    if (doi) {
      const cleanDoi = doi.replace('https://doi.org/', '').replace('http://doi.org/', '');
      const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`);
      if (res.ok) return true;
    }
    if (title) {
      const res = await fetch(
        `https://api.crossref.org/works?query.title=${encodeURIComponent(title.substring(0, 100))}&rows=1`
      );
      if (!res.ok) return false;
      const data = await res.json();
      return (data.message?.['total-results'] || 0) > 0;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Calculate ASIA Rating (1-5 stars) from score
 */
function calculateRating(score: number): { rating: number; label: string } {
  if (score >= 85) return { rating: 5, label: 'Platinum — Fully Verified' };
  if (score >= 65) return { rating: 4, label: 'Gold — Highly Trusted' };
  if (score >= 45) return { rating: 3, label: 'Silver — Verified' };
  if (score >= 25) return { rating: 2, label: 'Bronze — Partially Verified' };
  return { rating: 1, label: 'Registered' };
}

/**
 * Main verification function — runs all checks in parallel
 */
export async function verifyArticle(article: ArticleToVerify): Promise<AsiaVerificationResult> {
  const [zenodo_verified, orcid_verified, scopus_verified, crossref_verified] = await Promise.all([
    verifyZenodo(article.doi || ''),
    verifyOrcid(article.authors || ''),
    verifyScopus(article.doi || '', article.title || ''),
    verifyCrossref(article.doi || '', article.title || ''),
  ]);

  const has_abstract = !!(article.abstract && article.abstract.trim().length > 50);
  const has_issn = !!(article.issn && article.issn.trim().length > 0);

  // Calculate score
  let score = 0;
  if (scopus_verified) score += 30;
  if (zenodo_verified) score += 20;
  if (orcid_verified) score += 20;
  if (crossref_verified) score += 15;
  if (has_abstract) score += 10;
  if (has_issn) score += 5;

  const { rating, label } = calculateRating(score);

  return {
    zenodo_verified,
    orcid_verified,
    scopus_verified,
    crossref_verified,
    has_abstract,
    has_issn,
    asia_score: score,
    asia_rating: rating,
    asia_label: label,
  };
}
