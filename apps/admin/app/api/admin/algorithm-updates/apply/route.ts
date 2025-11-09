import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@khaledaun/auth';
import {
  generateUpdatedPrompt,
  comparePrompts,
} from '@khaledaun/utils/prompt-update-analyzer';

/**
 * POST /api/admin/algorithm-updates/apply
 * Apply algorithm update recommendations to prompts
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const { updateIds, templateIds, autoApply = false } = await request.json();

    if (!updateIds || !Array.isArray(updateIds) || updateIds.length === 0) {
      return NextResponse.json(
        { error: 'updateIds array is required' },
        { status: 400 }
      );
    }

    // Fetch analyzed updates
    const updates = await prisma.algorithmUpdate.findMany({
      where: {
        id: { in: updateIds },
        analyzed: true,
        applied: false,
      },
    });

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No analyzed, unapplied updates found' },
        { status: 404 }
      );
    }

    // Get relevant prompt templates
    const templates = templateIds
      ? await prisma.aIPromptTemplate.findMany({
          where: { id: { in: templateIds } },
        })
      : await prisma.aIPromptTemplate.findMany({
          where: {
            OR: [
              { category: { in: ['seo', 'content-generation', 'linkedin'] } },
              { useCase: { in: ['CONTENT_DRAFT', 'SEO_METADATA'] } },
            ],
          },
        });

    // Collect all prompt updates from analyzed updates
    const allPromptUpdates: any[] = [];
    updates.forEach(update => {
      if (update.promptUpdates) {
        try {
          const parsed = JSON.parse(update.promptUpdates as string);
          if (parsed.seoPrompts) allPromptUpdates.push(...parsed.seoPrompts);
          if (parsed.aioPrompts) allPromptUpdates.push(...parsed.aioPrompts);
          if (parsed.linkedinPrompts) allPromptUpdates.push(...parsed.linkedinPrompts);
        } catch (error) {
          console.error('Failed to parse prompt updates:', error);
        }
      }
    });

    if (allPromptUpdates.length === 0) {
      return NextResponse.json(
        { error: 'No prompt updates found in analyzed updates' },
        { status: 400 }
      );
    }

    const updatedTemplates: any[] = [];

    // Update each template
    for (const template of templates) {
      const currentPrompt = template.prompt;

      // Filter relevant updates for this template
      const relevantUpdates = filterRelevantUpdates(
        allPromptUpdates,
        template.category,
        template.useCase
      );

      if (relevantUpdates.length === 0) continue;

      // Generate updated prompt
      const newPrompt = await generateUpdatedPrompt(currentPrompt, relevantUpdates);

      // Compare prompts to show changes
      const diff = comparePrompts(currentPrompt, newPrompt);

      if (autoApply) {
        // Automatically apply the update
        const updated = await prisma.aIPromptTemplate.update({
          where: { id: template.id },
          data: { prompt: newPrompt },
        });

        updatedTemplates.push({
          templateId: template.id,
          templateName: template.name,
          applied: true,
          diff,
        });
      } else {
        // Return preview for manual approval
        updatedTemplates.push({
          templateId: template.id,
          templateName: template.name,
          currentPrompt,
          newPrompt,
          diff,
          applied: false,
        });
      }
    }

    // If auto-applied, mark updates as applied
    if (autoApply) {
      await prisma.algorithmUpdate.updateMany({
        where: { id: { in: updateIds } },
        data: {
          applied: true,
          appliedAt: new Date(),
          appliedBy: user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      updatedTemplates,
      autoApplied: autoApply,
      message: autoApply
        ? `Applied ${updatedTemplates.length} prompt updates`
        : `Preview of ${updatedTemplates.length} prompt updates`,
    });
  } catch (error) {
    console.error('Error applying updates:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to apply updates',
      },
      { status: 500 }
    );
  }
}

/**
 * Filter prompt updates relevant to a specific template
 */
function filterRelevantUpdates(
  updates: any[],
  templateCategory: string,
  templateUseCase: string
): any[] {
  return updates.filter(update => {
    const section = update.section?.toLowerCase() || '';

    // Match by category
    if (templateCategory.includes('seo') && section.includes('seo')) {
      return true;
    }
    if (templateCategory.includes('linkedin') && section.includes('linkedin')) {
      return true;
    }
    if (templateCategory.includes('ai') && section.includes('ai')) {
      return true;
    }

    // Match by use case
    if (templateUseCase === 'CONTENT_DRAFT' && section.includes('content')) {
      return true;
    }
    if (templateUseCase === 'SEO_METADATA' && section.includes('metadata')) {
      return true;
    }

    return false;
  });
}

/**
 * PUT /api/admin/algorithm-updates/apply/:id
 * Manually approve and apply a specific update
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin();
    const { templateId, newPrompt } = await request.json();

    // Update the template
    await prisma.aIPromptTemplate.update({
      where: { id: templateId },
      data: { prompt: newPrompt },
    });

    // Mark update as applied
    await prisma.algorithmUpdate.update({
      where: { id: params.id },
      data: {
        applied: true,
        appliedAt: new Date(),
        appliedBy: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Update applied successfully',
    });
  } catch (error) {
    console.error('Error applying update:', error);
    return NextResponse.json(
      { error: 'Failed to apply update' },
      { status: 500 }
    );
  }
}
