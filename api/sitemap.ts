import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: any, res: any) {
  try {
    // 1. Get all published articles with slugs
    const { data: articles, error } = await supabase
      .from('articles')
      .select('slug, updated_at')
      .eq('status', 'published')
      .not('slug', 'is', null);

    if (error) {
      console.error('Error fetching articles for sitemap:', error);
      return res.status(500).send('Error generating sitemap');
    }

    // 2. Generate XML
    const domain = 'https://rjrakp.com';
    const today = new Date().toISOString().split('T')[0];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/jurnal</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/publikasi</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/indexing</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/editorial-board</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/publication-ethics</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;

    if (articles) {
      articles.forEach((article: any) => {
        if (article.slug) {
          const date = article.updated_at ? new Date(article.updated_at).toISOString() : new Date().toISOString();
          xml += `  <url>
    <loc>${domain}/article/${article.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
        }
      });
    }

    xml += `</urlset>`;

    // 3. Return XML response
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Internal Server Error');
  }
}
