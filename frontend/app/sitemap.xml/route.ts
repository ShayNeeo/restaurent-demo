import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  try {
    const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
    const sitemapContent = readFileSync(sitemapPath, 'utf-8');
    
    // Ensure the content is properly formatted XML (remove any BOM or extra whitespace)
    const trimmedContent = sitemapContent.trim();
    
    // Return as XML with proper headers
    return new NextResponse(trimmedContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Content-Type-Options': 'nosniff',
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

