import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const articleId = url.searchParams.get('article_id');

    if (!articleId) {
      throw new Error('article_id parameter is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Article Data
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select(`
        *,
        article_authors (*),
        publications (*)
      `)
      .eq('id', articleId)
      .single();

    if (articleError || !article) {
      throw new Error('Article not found');
    }

    // Default Journal Settings
    const journalTitle = "Rumah Jurnal RJRAKP";
    const journalAbbrev = "RJRAKP";
    const eIssn = "0000-0000"; // Replace when approved
    const depositorName = "RJRAKP Admin";
    const depositorEmail = "rjrakp@rjrakp.com";
    const registrant = "Rumah Jurnal RJRAKP";

    // Generate Timestamps
    const now = new Date();
    const timestamp = now.getTime().toString();
    const batchId = `rjrakp-${articleId}-${timestamp}`;

    // Authors XML
    const contributorsXml = article.article_authors
      ?.sort((a: any, b: any) => a.author_order - b.author_order)
      ?.map((author: any, index: number) => {
        // Simple name split (assuming last word is surname if multiple words)
        const nameParts = author.full_name.split(' ');
        const surname = nameParts.length > 1 ? nameParts.pop() : author.full_name;
        const givenName = nameParts.length > 0 ? nameParts.join(' ') : '';
        const sequence = index === 0 ? 'first' : 'additional';

        let xml = `
            <person_name sequence="${sequence}" contributor_role="author">
              ${givenName ? `<given_name>${givenName}</given_name>` : ''}
              <surname>${surname}</surname>
            </person_name>`;
        return xml;
      }).join('') || '';

    // Publication Dates
    const pubDate = article.publications?.[0]?.publication_date ? new Date(article.publications[0].publication_date) : now;
    const pubYear = pubDate.getFullYear();
    const pubMonth = String(pubDate.getMonth() + 1).padStart(2, '0');
    const pubDay = String(pubDate.getDate()).padStart(2, '0');

    // Issue Info
    const volume = article.publications?.[0]?.volume_number || '1';
    const issue = article.publications?.[0]?.issue_number || '1';

    // DOI Data
    // Fallback to dummy DOI if not present in DB, to allow XML generation to succeed for testing
    let doi = article.publications?.[0]?.doi;
    if (!doi) {
      // 10.xxxx is placeholder prefix
      doi = `10.99999/rjrakp.v${volume}i${issue}.${articleId.substring(0, 6)}`;
    }
    const resourceUrl = `https://rjrakp.com/article/${article.slug || articleId}`;

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch xmlns="http://www.crossref.org/schema/4.4.2" 
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
           version="4.4.2" 
           xsi:schemaLocation="http://www.crossref.org/schema/4.4.2 http://www.crossref.org/schema/deposit/crossref4.4.2.xsd">
  <head>
    <doi_batch_id>${batchId}</doi_batch_id>
    <timestamp>${timestamp}</timestamp>
    <depositor>
      <depositor_name>${depositorName}</depositor_name>
      <email_address>${depositorEmail}</email_address>
    </depositor>
    <registrant>${registrant}</registrant>
  </head>
  <body>
    <journal>
      <journal_metadata language="en">
        <full_title>${journalTitle}</full_title>
        <abbrev_title>${journalAbbrev}</abbrev_title>
        <issn media_type="electronic">${eIssn}</issn>
      </journal_metadata>
      <journal_issue>
        <publication_date media_type="online">
          <month>${pubMonth}</month>
          <day>${pubDay}</day>
          <year>${pubYear}</year>
        </publication_date>
        <journal_volume>
          <volume>${volume}</volume>
        </journal_volume>
        <issue>${issue}</issue>
      </journal_issue>
      <journal_article publication_type="full_text">
        <titles>
          <title>${article.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
        </titles>
        <contributors>
          ${contributorsXml}
        </contributors>
        <publication_date media_type="online">
          <month>${pubMonth}</month>
          <day>${pubDay}</day>
          <year>${pubYear}</year>
        </publication_date>
        <doi_data>
          <doi>${doi}</doi>
          <resource>${resourceUrl}</resource>
        </doi_data>
      </journal_article>
    </journal>
  </body>
</doi_batch>`;

    const responseHeaders = new Headers(corsHeaders);
    // Use application/xml or text/xml for Crossref. Content-Disposition allows it to be downloaded as a file.
    responseHeaders.set('Content-Type', 'text/xml; charset=utf-8');
    responseHeaders.set('Content-Disposition', \`attachment; filename="crossref-deposit-${articleId}.xml"\`);

    return new Response(xmlContent, {
      headers: responseHeaders,
      status: 200,
    });

  } catch (error: any) {
    const errHeaders = new Headers(corsHeaders);
    errHeaders.set('Content-Type', 'application/json');
    return new Response(JSON.stringify({ error: error.message }), {
      headers: errHeaders,
      status: 400,
    });
  }
});
