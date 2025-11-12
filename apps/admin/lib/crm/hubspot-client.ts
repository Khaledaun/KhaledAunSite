/**
 * HubSpot CRM Client
 * Handles contact and deal syncing with HubSpot
 */

export interface HubSpotConfig {
  apiKey: string;
  portalId?: string;
}

export interface HubSpotContact {
  email: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  jobtitle?: string;
  phone?: string;
  website?: string;
  lifecyclestage?: string; // 'subscriber', 'lead', 'marketingqualifiedlead', 'salesqualifiedlead', 'opportunity', 'customer'
  hs_lead_status?: string; // 'NEW', 'OPEN', 'IN_PROGRESS', 'OPEN_DEAL', 'UNQUALIFIED', 'ATTEMPTED_TO_CONTACT', 'CONNECTED', 'BAD_TIMING'
  
  // Custom properties
  lead_source?: string;
  lead_source_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  message?: string;
}

export interface HubSpotDeal {
  dealname: string;
  dealstage: string; // Pipeline stage ID
  amount?: number;
  closedate?: string;
  pipeline?: string;
}

export interface SyncResult {
  success: boolean;
  contactId?: string;
  dealId?: string;
  error?: string;
  isNew?: boolean;
}

/**
 * Get HubSpot configuration from environment
 */
export function getHubSpotConfig(): HubSpotConfig {
  const apiKey = process.env.HUBSPOT_API_KEY;
  const portalId = process.env.HUBSPOT_PORTAL_ID;

  if (!apiKey) {
    throw new Error('HUBSPOT_API_KEY environment variable is not set');
  }

  return {
    apiKey,
    portalId,
  };
}

/**
 * Check if HubSpot is configured
 */
export function isHubSpotConfigured(): boolean {
  return !!process.env.HUBSPOT_API_KEY;
}

/**
 * Create or update a contact in HubSpot
 */
export async function upsertContact(
  contact: HubSpotContact
): Promise<SyncResult> {
  if (!isHubSpotConfigured()) {
    return {
      success: false,
      error: 'HubSpot is not configured',
    };
  }

  try {
    const config = getHubSpotConfig();

    // Convert contact to HubSpot properties format
    const properties = Object.entries(contact)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => ({
        property: key,
        value: String(value),
      }));

    // Try to find existing contact by email
    const searchResponse = await fetch(
      `https://api.hubapi.com/contacts/v1/contact/email/${encodeURIComponent(contact.email)}/profile?hapikey=${config.apiKey}`
    );

    if (searchResponse.ok) {
      // Contact exists, update it
      const existingContact = await searchResponse.json();
      const contactId = existingContact.vid;

      const updateResponse = await fetch(
        `https://api.hubapi.com/contacts/v1/contact/vid/${contactId}/profile?hapikey=${config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ properties }),
        }
      );

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.message || 'Failed to update contact');
      }

      return {
        success: true,
        contactId: String(contactId),
        isNew: false,
      };
    } else {
      // Contact doesn't exist, create it
      const createResponse = await fetch(
        `https://api.hubapi.com/contacts/v1/contact?hapikey=${config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ properties }),
        }
      );

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.message || 'Failed to create contact');
      }

      const newContact = await createResponse.json();

      return {
        success: true,
        contactId: String(newContact.vid),
        isNew: true,
      };
    }
  } catch (error) {
    console.error('HubSpot contact sync error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a deal in HubSpot and associate it with a contact
 */
export async function createDeal(
  deal: HubSpotDeal,
  contactId: string
): Promise<SyncResult> {
  if (!isHubSpotConfigured()) {
    return {
      success: false,
      error: 'HubSpot is not configured',
    };
  }

  try {
    const config = getHubSpotConfig();

    const properties = [
      { name: 'dealname', value: deal.dealname },
      { name: 'dealstage', value: deal.dealstage },
      { name: 'pipeline', value: deal.pipeline || 'default' },
    ];

    if (deal.amount) {
      properties.push({ name: 'amount', value: String(deal.amount) });
    }

    if (deal.closedate) {
      properties.push({ name: 'closedate', value: deal.closedate });
    }

    const response = await fetch(
      `https://api.hubapi.com/deals/v1/deal?hapikey=${config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties,
          associations: {
            associatedVids: [parseInt(contactId)],
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create deal');
    }

    const newDeal = await response.json();

    return {
      success: true,
      dealId: String(newDeal.dealId),
    };
  } catch (error) {
    console.error('HubSpot deal creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get contact by ID
 */
export async function getContact(contactId: string): Promise<any> {
  if (!isHubSpotConfigured()) {
    throw new Error('HubSpot is not configured');
  }

  const config = getHubSpotConfig();

  const response = await fetch(
    `https://api.hubapi.com/contacts/v1/contact/vid/${contactId}/profile?hapikey=${config.apiKey}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get contact');
  }

  return response.json();
}

/**
 * Search contacts by email
 */
export async function searchContactByEmail(email: string): Promise<any> {
  if (!isHubSpotConfigured()) {
    throw new Error('HubSpot is not configured');
  }

  const config = getHubSpotConfig();

  const response = await fetch(
    `https://api.hubapi.com/contacts/v1/contact/email/${encodeURIComponent(email)}/profile?hapikey=${config.apiKey}`
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to search contact');
  }

  return response.json();
}

/**
 * Add contact to a list
 */
export async function addContactToList(
  contactId: string,
  listId: string
): Promise<boolean> {
  if (!isHubSpotConfigured()) {
    throw new Error('HubSpot is not configured');
  }

  const config = getHubSpotConfig();

  const response = await fetch(
    `https://api.hubapi.com/contacts/v1/lists/${listId}/add?hapikey=${config.apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vids: [parseInt(contactId)],
      }),
    }
  );

  return response.ok;
}

/**
 * Sync newsletter subscriber to HubSpot
 */
export async function syncSubscriberToHubSpot(subscriber: {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  sourceUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): Promise<SyncResult> {
  const contact: HubSpotContact = {
    email: subscriber.email,
    firstname: subscriber.firstName,
    lastname: subscriber.lastName,
    lifecyclestage: 'subscriber',
    lead_source: subscriber.source || 'newsletter',
    lead_source_url: subscriber.sourceUrl,
    utm_source: subscriber.utmSource,
    utm_medium: subscriber.utmMedium,
    utm_campaign: subscriber.utmCampaign,
  };

  return upsertContact(contact);
}

/**
 * Sync form lead to HubSpot
 */
export async function syncLeadToHubSpot(lead: {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  website?: string;
  message?: string;
  source: string;
  sourceUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}): Promise<SyncResult> {
  const contact: HubSpotContact = {
    email: lead.email,
    firstname: lead.firstName,
    lastname: lead.lastName,
    company: lead.company,
    jobtitle: lead.jobTitle,
    phone: lead.phone,
    website: lead.website,
    lifecyclestage: 'lead',
    hs_lead_status: 'NEW',
    lead_source: lead.source,
    lead_source_url: lead.sourceUrl,
    message: lead.message,
    utm_source: lead.utmSource,
    utm_medium: lead.utmMedium,
    utm_campaign: lead.utmCampaign,
    utm_term: lead.utmTerm,
    utm_content: lead.utmContent,
  };

  return upsertContact(contact);
}

/**
 * Test HubSpot API connection
 */
export async function testConnection(): Promise<boolean> {
  if (!isHubSpotConfigured()) {
    return false;
  }

  try {
    const config = getHubSpotConfig();

    const response = await fetch(
      `https://api.hubapi.com/contacts/v1/lists?hapikey=${config.apiKey}&count=1`
    );

    return response.ok;
  } catch (error) {
    console.error('HubSpot connection test failed:', error);
    return false;
  }
}

