export interface OjsArticle {
  id: string;
  title: string;
  creator: string;
  subject: string[];
  description: string;
  date: string;
  type: string;
  format: string;
  identifier: string[];
  source: string;
  language: string;
  pdfUrl?: string;
  doi?: string;
}

export async function fetchOjsArticles(oaiUrl: string = 'https://jramk.com/index.php/jramk/oai'): Promise<OjsArticle[]> {
  try {
    const url = `${oaiUrl}?verb=ListRecords&metadataPrefix=oai_dc`;
    // Gunakan proxy cors-anywhere karena OJS biasanya memblokir CORS browser
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Gagal mengambil data dari OJS: ${response.statusText}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const records = xmlDoc.getElementsByTagName('record');
    const articles: OjsArticle[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      const header = record.getElementsByTagName('header')[0];
      if (header?.getAttribute('status') === 'deleted') continue;

      const metadata = record.getElementsByTagName('metadata')[0];
      if (!metadata) continue;

      const dc = metadata.getElementsByTagName('oai_dc:dc')[0];
      if (!dc) continue;

      const getText = (tagName: string) => {
        const els = dc.getElementsByTagName(tagName);
        return els.length > 0 ? els[0].textContent || '' : '';
      };

      const getMultiple = (tagName: string) => {
        const els = dc.getElementsByTagName(tagName);
        return Array.from(els).map(el => el.textContent || '');
      };

      const identifierArr = getMultiple('dc:identifier');
      let pdfUrl = '';
      let doi = '';

      identifierArr.forEach(id => {
        if (id.includes('/article/view/') && !id.includes('doi.org')) {
          // Attempt to convert view URL to download URL. e.g. /view/123 -> /download/123/123
          pdfUrl = id.replace('/view/', '/download/');
        }
        if (id.includes('doi.org')) {
          doi = id;
        }
      });

      articles.push({
        id: getText('dc:identifier'),
        title: getText('dc:title'),
        creator: getMultiple('dc:creator').join(', '),
        subject: getMultiple('dc:subject'),
        description: getText('dc:description'),
        date: getText('dc:date'),
        type: getText('dc:type'),
        format: getText('dc:format'),
        identifier: identifierArr,
        source: getText('dc:source'),
        language: getText('dc:language'),
        pdfUrl: pdfUrl,
        doi: doi
      });
    }

    return articles;
  } catch (error) {
    console.error('Error fetching OJS articles:', error);
    throw error;
  }
}
