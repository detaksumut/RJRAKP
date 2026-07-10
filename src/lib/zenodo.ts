const ZENODO_API_URL = 'https://zenodo.org/api';

export interface ZenodoCreator {
  name: string;
  affiliation?: string;
  orcid?: string;
}

export interface ZenodoMetadata {
  title: string;
  description: string;
  creators: ZenodoCreator[];
  upload_type: string;
  publication_type?: string;
  communities?: { identifier: string }[];
  access_right?: string;
  license?: string;
  keywords?: string[];
}

const getHeaders = () => {
  const token = import.meta.env.VITE_ZENODO_API_TOKEN;
  if (!token) {
    throw new Error('VITE_ZENODO_API_TOKEN is not defined in environment variables.');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Creates an empty deposition in Zenodo with the provided metadata.
 */
export async function createDeposition(metadata: ZenodoMetadata) {
  const response = await fetch(`${ZENODO_API_URL}/deposit/depositions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ metadata })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to create deposition: ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

/**
 * Downloads a file from a public URL and uploads it to the Zenodo deposition.
 */
export async function uploadFileToDeposition(depositionId: number, fileUrl: string, fileName: string) {
  // First, fetch the file as a Blob
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    throw new Error(`Failed to download file from ${fileUrl}`);
  }
  const fileBlob = await fileResponse.blob();

  // Prepare FormData for Zenodo
  const formData = new FormData();
  formData.append('file', fileBlob, fileName);
  formData.append('name', fileName);

  const token = import.meta.env.VITE_ZENODO_API_TOKEN;
  const response = await fetch(`${ZENODO_API_URL}/deposit/depositions/${depositionId}/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Note: Do not set Content-Type for FormData, fetch will set it with boundary
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to upload file to deposition: ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

/**
 * Publishes a deposition, assigning a permanent DOI.
 * WARNING: This cannot be undone.
 */
export async function publishDeposition(depositionId: number) {
  const response = await fetch(`${ZENODO_API_URL}/deposit/depositions/${depositionId}/actions/publish`, {
    method: 'POST',
    headers: getHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to publish deposition: ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

/**
 * Orchestrates the full process: Create -> Upload -> Publish
 */
export async function publishArticleToZenodo(
  metadata: ZenodoMetadata, 
  fileUrl: string, 
  fileName: string
) {
  try {
    // 1. Create empty deposition
    const deposition = await createDeposition(metadata);
    const depositionId = deposition.id;
    
    // 2. Upload file
    await uploadFileToDeposition(depositionId, fileUrl, fileName);
    
    // 3. Publish (Warning: irreversible)
    const publishedDeposition = await publishDeposition(depositionId);
    
    // The DOI is available in the published metadata
    const doi = publishedDeposition.doi || publishedDeposition.metadata.prereserve_doi.doi;
    const zenodoUrl = publishedDeposition.links.html;
    
    return { success: true, doi, zenodoUrl, deposition: publishedDeposition };
  } catch (error: any) {
    console.error("Zenodo Integration Error:", error);
    return { success: false, error: error.message };
  }
}
