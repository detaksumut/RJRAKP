export const generateCrossrefXML = (article: any) => {
  const publication = article.publications?.[0] || {};
  const journal = article.journals || {};
  const authors = article.article_authors || [];

  const pubDate = publication.publication_date ? new Date(publication.publication_date) : new Date();
  
  // Format Date for XML
  const pubYear = pubDate.getFullYear();
  const pubMonth = String(pubDate.getMonth() + 1).padStart(2, '0');
  const pubDay = String(pubDate.getDate()).padStart(2, '0');

  // Simple clean abstract
  const abstractClean = (article.abstract || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const titleClean = (article.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const journalNameClean = (journal.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const publisher = (journal.publisher || 'Rumah Jurnal RJRAKP').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let contributorsXml = '';
  authors.forEach((author: any, idx: number) => {
    const isFirst = idx === 0;
    const authorRole = 'author'; // Typically author
    
    // Naive split for Given and Surname
    const names = (author.full_name || '').split(' ');
    const surname = names.pop() || '';
    const givenName = names.join(' ') || '';

    contributorsXml += `
          <person_name sequence="${isFirst ? 'first' : 'additional'}" contributor_role="${authorRole}">
            ${givenName ? `<given_name>${givenName}</given_name>` : ''}
            <surname>${surname}</surname>
            ${author.affiliation ? `<affiliation>${author.affiliation}</affiliation>` : ''}
            ${author.orcid ? `<ORCID>${author.orcid}</ORCID>` : ''}
          </person_name>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch version="4.4.2" xmlns="http://www.crossref.org/schema/4.4.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.crossref.org/schema/4.4.2 http://www.crossref.org/schema/deposit/crossref4.4.2.xsd">
  <head>
    <doi_batch_id>${Date.now()}_${article.id}</doi_batch_id>
    <timestamp>${Date.now()}</timestamp>
    <depositor>
      <depositor_name>${publisher}</depositor_name>
      <email_address>redaksi@rjrakp.com</email_address>
    </depositor>
    <registrant>${publisher}</registrant>
  </head>
  <body>
    <journal>
      <journal_metadata>
        <full_title>${journalNameClean}</full_title>
        <abbrev_title>${journal.slug || journalNameClean}</abbrev_title>
        ${journal.p_issn ? `<issn media_type="print">${journal.p_issn}</issn>` : ''}
        ${journal.e_issn ? `<issn media_type="electronic">${journal.e_issn}</issn>` : ''}
      </journal_metadata>
      <journal_issue>
        <publication_date media_type="online">
          <month>${pubMonth}</month>
          <day>${pubDay}</day>
          <year>${pubYear}</year>
        </publication_date>
        <journal_volume>
          <volume>${(publication.volume_number || '').replace(/[^0-9]/g, '') || '1'}</volume>
        </journal_volume>
        <issue>${(publication.issue_number || '').replace(/[^0-9]/g, '') || '1'}</issue>
      </journal_issue>
      <journal_article publication_type="full_text">
        <titles>
          <title>${titleClean}</title>
        </titles>
        <contributors>
          ${contributorsXml}
        </contributors>
        <publication_date media_type="online">
          <month>${pubMonth}</month>
          <day>${pubDay}</day>
          <year>${pubYear}</year>
        </publication_date>
        <pages>
          <first_page>1</first_page>
          <last_page>10</last_page>
        </pages>
        <doi_data>
          <doi>${publication.doi || `10.47822/rjrakp.${article.id}`}</doi>
          <resource>https://rjrakp.com/article/${article.slug || article.id}</resource>
        </doi_data>
      </journal_article>
    </journal>
  </body>
</doi_batch>`;

  return xml;
};
