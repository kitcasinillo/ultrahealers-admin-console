import type { CampaignTemplate, CampaignTemplateFields } from '@/api/campaigns';

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function deriveTemplateFields(
  template: Pick<CampaignTemplate, 'name' | 'content' | 'fields'> | null
): CampaignTemplateFields {
  if (template?.fields) {
    return {
      title: template.fields.title ?? 'Hello {{first_name}},',
      subtitle: template.fields.subtitle ?? '',
      body: template.fields.body ?? '',
      buttonText: template.fields.buttonText ?? 'Discover Now',
      buttonUrl: template.fields.buttonUrl ?? 'https://ultrahealers.com',
    };
  }

  if (template?.content) {
    const headingMatch = template.content.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i);
    const title = headingMatch
      ? stripHtml(headingMatch[1])
      : template.name || 'Hello {{first_name}},';
    const withoutHeadingAndImg = template.content
      .replace(/<h[1-3][^>]*>.*?<\/h[1-3]>/gi, '')
      .replace(/<img[^>]*>/gi, '');
    const bodyText = stripHtml(withoutHeadingAndImg);

    return {
      title,
      subtitle: '',
      body: bodyText || 'Check out our newest retreats and exclusive healing sessions today.',
      buttonText: 'Discover Now',
      buttonUrl: 'https://ultrahealers.com',
    };
  }

  return {
    title: 'Hello {{first_name}},',
    subtitle: 'Explore new updates to your journey. Meditation just got more rewarding.',
    body: 'Check out our newest retreats and exclusive healing sessions today.',
    buttonText: 'Discover Now',
    buttonUrl: 'https://ultrahealers.com',
  };
}

/**
 * Builds email-ready HTML matching the exact Template Preview order:
 * 1. Greeting / Headline
 * 2. Subtitle
 * 3. Banner Image
 * 4. Message Body paragraphs
 * 5. Styled CTA Action Button
 */
export function buildTemplateEmailHtml(
  fields: CampaignTemplateFields,
  bannerImage?: string,
  altText = 'Campaign Banner'
): string {
  const parts: string[] = [];

  if (fields.title?.trim()) {
    parts.push(`<h1>${fields.title.trim()}</h1>`);
  }

  if (fields.subtitle?.trim()) {
    parts.push(`<p>${fields.subtitle.trim()}</p>`);
  }

  if (bannerImage?.trim()) {
    parts.push(`<p><img src="${bannerImage.trim()}" alt="${altText}" /></p>`);
  }

  if (fields.body?.trim()) {
    fields.body
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((paragraph) => {
        parts.push(`<p>${paragraph}</p>`);
      });
  }

  if (fields.buttonText?.trim()) {
    const href = fields.buttonUrl?.trim() || 'https://ultrahealers.com';
    parts.push(
      `<p><a href="${href}" data-cta-button="true" style="display:inline-block;background-color:#4318FF;color:#ffffff;padding:12px 28px;border-radius:12px;font-weight:800;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;">${fields.buttonText.trim()}</a></p>`
    );
  }

  return parts.join('');
}
