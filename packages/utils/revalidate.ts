/**
 * Phase 6 Lite: Revalidation utility
 * Triggers ISR revalidation on the public site after publishing posts
 */

export async function revalidatePost(slug: string): Promise<void> {
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    console.error('REVALIDATE_SECRET not configured - skipping revalidation');
    return;
  }

  try {
    const response = await fetch(`${siteUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-reval-secret': secret,
      },
      body: JSON.stringify({ slug }),
    });

    if (!response.ok) {
      console.error('Revalidation failed:', await response.text());
    } else {
      console.log('Successfully revalidated:', slug);
    }
  } catch (error) {
    console.error('Error calling revalidation endpoint:', error);
    // Don't throw - revalidation failure shouldn't break publish
  }
}

export async function revalidateBlog(): Promise<void> {
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    console.error('REVALIDATE_SECRET not configured - skipping revalidation');
    return;
  }

  try {
    const response = await fetch(`${siteUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-reval-secret': secret,
      },
      body: JSON.stringify({}), // No slug = just revalidate blog index
    });

    if (!response.ok) {
      console.error('Blog revalidation failed:', await response.text());
    } else {
      console.log('Successfully revalidated blog index');
    }
  } catch (error) {
    console.error('Error calling revalidation endpoint:', error);
  }
}

