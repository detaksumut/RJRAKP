import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const rawUrl = process.env.VITE_SUPABASE_URL || '';
const envSupabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const baseUrlMatch = rawUrl.match(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/);
const supabaseUrl = baseUrlMatch ? baseUrlMatch[0] : (rawUrl.startsWith('http') ? rawUrl : 'https://abcdefghijklmnopqr.supabase.co');
const supabaseAnonKey = (envSupabaseAnonKey ? envSupabaseAnonKey.trim() : '') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

import ws from 'ws';
globalThis.WebSocket = ws;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const targetOrcid = '0009-0006-8416-6156';
  console.log(`Updating Muhibbuddin's ORCID to: ${targetOrcid}`);

  // 1. Fetch all authors matching 'Muhibbuddin'
  const { data: authors, error: err1 } = await supabase
    .from('article_authors')
    .select('*, articles(*)')
    .ilike('full_name', '%Muhibbuddin%');

  if (err1) {
    console.error("Error fetching authors:", err1);
    return;
  }

  console.log(`Found ${authors.length} author records.`);

  for (const author of authors) {
    console.log(`\nProcessing author record: ${author.id} (${author.full_name}) for article ${author.article_id}`);
    
    // Update article_authors.orcid_id
    const { error: err2 } = await supabase
      .from('article_authors')
      .update({ orcid_id: targetOrcid })
      .eq('id', author.id);

    if (err2) {
      console.error(`Error updating author ${author.id}:`, err2);
    } else {
      console.log(`Updated author table for ${author.id}`);
    }

    // Update article.similarity_notes if it contains integrity_report JSON
    if (author.articles) {
      const article = author.articles;
      const notesRaw = article.similarity_notes || '';
      
      if (notesRaw.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(notesRaw);
          if (parsed.integrity_report) {
            console.log(`Found integrity_report JSON in article ${article.id}. Updating it...`);
            parsed.integrity_report.orcid_verification = {
              orcid_id: targetOrcid,
              status: 'Verified',
              profile_link: `https://orcid.org/${targetOrcid}`
            };
            
            // Re-calculate authorIdentityScore if necessary
            let verifiedCount = parsed.integrity_report.academic_profile_verification?.filter((p) => p.status === 'Verified' || p.url).length || 0;
            const authorIdentityScore = 40 + (verifiedCount * 10);
            
            // Parse other scores
            const citationScore = parsed.citation_integrity_score || 95;
            const doiValidationScore = parsed.integrity_report.doi_verification?.status === 'Verified' ? 100 : 0;
            const editorialScore = parsed.integrity_report.editorial_validation?.decision === 'Approved' ? 100 : parsed.integrity_report.editorial_validation?.decision === 'Revision Required' ? 50 : 25;
            
            const calculatedScore = Math.round((citationScore * 0.40) + (doiValidationScore * 0.20) + (authorIdentityScore * 0.20) + (editorialScore * 0.20));
            
            const updatedNotes = JSON.stringify(parsed);
            
            const { error: err3 } = await supabase
              .from('articles')
              .update({ 
                similarity_notes: updatedNotes,
                similarity_score: calculatedScore
              })
              .eq('id', article.id);

            if (err3) {
              console.error(`Error updating article ${article.id} notes:`, err3);
            } else {
              console.log(`Updated article ${article.id} JSON report with score ${calculatedScore}`);
            }
          }
        } catch (e) {
          console.error(`Error parsing notes JSON for article ${article.id}:`, e);
        }
      } else {
        console.log(`No integrity_report JSON found in article ${article.id}. Will rely on fallback logic.`);
      }
    }
  }

  console.log("\nUpdate complete!");
}

run();
