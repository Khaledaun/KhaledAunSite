import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Revalidate case studies pages after content changes
 */
export async function revalidateCaseStudies() {
  try {
    // Revalidate case studies listing page (both locales)
    revalidatePath('/[locale]/case-studies', 'page');
    revalidatePath('/en/case-studies');
    revalidatePath('/ar/case-studies');

    console.log('✅ Revalidated case studies pages');
    return { success: true };
  } catch (error) {
    console.error('❌ Error revalidating case studies:', error);
    return { success: false, error };
  }
}

/**
 * Revalidate specific case study detail page
 */
export async function revalidateCaseStudy(slug: string) {
  try {
    // Revalidate case study detail page (both locales)
    revalidatePath(`/[locale]/case-studies/[slug]`, 'page');
    revalidatePath(`/en/case-studies/${slug}`);
    revalidatePath(`/ar/case-studies/${slug}`);

    // Also revalidate the listing page since it shows this case study
    await revalidateCaseStudies();

    console.log(`✅ Revalidated case study: ${slug}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error revalidating case study ${slug}:`, error);
    return { success: false, error };
  }
}

/**
 * Revalidate blog posts pages after content changes
 */
export async function revalidateBlogPosts() {
  try {
    // Revalidate blog listing page (both locales)
    revalidatePath('/[locale]/blog', 'page');
    revalidatePath('/en/blog');
    revalidatePath('/ar/blog');

    // Also revalidate home page (shows latest posts)
    revalidatePath('/[locale]', 'page');
    revalidatePath('/en');
    revalidatePath('/ar');

    console.log('✅ Revalidated blog posts pages');
    return { success: true };
  } catch (error) {
    console.error('❌ Error revalidating blog posts:', error);
    return { success: false, error };
  }
}

/**
 * Revalidate specific blog post detail page
 */
export async function revalidateBlogPost(slug: string) {
  try {
    // Revalidate blog post detail page (both locales)
    revalidatePath(`/[locale]/blog/[slug]`, 'page');
    revalidatePath(`/en/blog/${slug}`);
    revalidatePath(`/ar/blog/${slug}`);

    // Also revalidate the listing page and home
    await revalidateBlogPosts();

    console.log(`✅ Revalidated blog post: ${slug}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error revalidating blog post ${slug}:`, error);
    return { success: false, error };
  }
}

/**
 * Revalidate home page
 */
export async function revalidateHome() {
  try {
    revalidatePath('/[locale]', 'page');
    revalidatePath('/en');
    revalidatePath('/ar');

    console.log('✅ Revalidated home page');
    return { success: true };
  } catch (error) {
    console.error('❌ Error revalidating home page:', error);
    return { success: false, error };
  }
}

/**
 * Revalidate everything (use sparingly)
 */
export async function revalidateAll() {
  try {
    await Promise.all([
      revalidateCaseStudies(),
      revalidateBlogPosts(),
      revalidateHome(),
    ]);

    console.log('✅ Revalidated all pages');
    return { success: true };
  } catch (error) {
    console.error('❌ Error revalidating all pages:', error);
    return { success: false, error };
  }
}
