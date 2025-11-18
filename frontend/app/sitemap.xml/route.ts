import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml.template');
    const sitemapContent = readFileSync(sitemapPath, 'utf-8');
    
    // Ensure the content is properly formatted XML (remove any BOM or extra whitespace)
    const trimmedContent = sitemapContent.trim();
    
    // Return as XML with proper headers
    return new NextResponse(trimmedContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Accept',
      },
    });
  } catch (error) {
    console.error('Error reading sitemap.xml:', error);
    return new NextResponse('Sitemap not found', { 
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

