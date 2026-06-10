import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const verb = url.searchParams.get('verb') || 'Identify';
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = 'https://rjrakp.com/oai';
    const adminEmail = 'rjrakp@rjrakp.com';
    const repositoryName = 'Rumah Jurnal RJRAKP Repository';
    const date = new Date().toISOString();

    let xmlContent = '';

    if (verb === 'Identify') {
      xmlContent = `
        <Identify>
          <repositoryName>${repositoryName}</repositoryName>
          <baseURL>${baseUrl}</baseURL>
          <protocolVersion>2.0</protocolVersion>
          <adminEmail>${adminEmail}</adminEmail>
          <earliestDatestamp>2024-01-01T00:00:00Z</earliestDatestamp>
          <deletedRecord>transient</deletedRecord>
          <granularity>YYYY-MM-DDThh:mm:ssZ</granularity>
        </Identify>`;
    } else if (verb === 'ListMetadataFormats') {
      xmlContent = `
        <ListMetadataFormats>
          <metadataFormat>
            <metadataPrefix>oai_dc</metadataPrefix>
            <schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema>
            <metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace>
          </metadataFormat>
        </ListMetadataFormats>`;
    } else if (verb === 'ListRecords' || verb === 'ListIdentifiers') {
      // Basic implementation fetching published articles
      const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, abstract, keywords, slug, updated_at, article_authors(full_name), journals(name)')
        .eq('status', 'published');

      if (error) throw error;

      let records = '';
      if (articles && articles.length > 0) {
        articles.forEach((art: any) => {
          const identifier = `oai:rjrakp.com:article/${art.id}`;
          const datestamp = new Date(art.updated_at || Date.now()).toISOString();
          
          if (verb === 'ListIdentifiers') {
            records += `
            <header>
              <identifier>${identifier}</identifier>
              <datestamp>${datestamp}</datestamp>
              <setSpec>${art.journals?.name?.replace(/\\s+/g, '_') || 'journal'}</setSpec>
            </header>`;
          } else {
            const authors = (art.article_authors || []).map((a: any) => `<dc:creator>${a.full_name}</dc:creator>`).join('');
            records += `
            <record>
              <header>
                <identifier>${identifier}</identifier>
                <datestamp>${datestamp}</datestamp>
              </header>
              <metadata>
                <oai_dc:dc 
                  xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" 
                  xmlns:dc="http://purl.org/dc/elements/1.1/" 
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                  xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
                  <dc:title>${(art.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</dc:title>
                  ${authors}
                  <dc:description>${(art.abstract || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</dc:description>
                  <dc:publisher>Rumah Jurnal RJRAKP</dc:publisher>
                  <dc:date>${datestamp.split('T')[0]}</dc:date>
                  <dc:type>info:eu-repo/semantics/article</dc:type>
                  <dc:format>application/pdf</dc:format>
                  <dc:identifier>https://rjrakp.com/article/${art.slug}</dc:identifier>
                  <dc:language>id</dc:language>
                </oai_dc:dc>
              </metadata>
            </record>`;
          }
        });
      }

      xmlContent = `
        <${verb}>
          ${records || '<error code="noRecordsMatch">No matches for the selection criteria</error>'}
        </${verb}>`;
    } else {
      xmlContent = `<error code="badVerb">Illegal OAI verb</error>`;
    }

    const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
  <responseDate>${date}</responseDate>
  <request verb="${verb}">${baseUrl}</request>
  ${xmlContent}
</OAI-PMH>`;

    return new Response(xmlResponse, {
      headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
