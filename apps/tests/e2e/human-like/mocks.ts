/**
 * HTTP Mocks for External Services
 * Used when MOCK_EXTERNALS=true to avoid hitting real APIs
 */

import nock from 'nock';

/**
 * Enable all API mocks
 */
export function enableMocks(): void {
  if (process.env.MOCK_EXTERNALS !== 'true') {
    return;
  }

  console.log('🎭 Enabling API mocks (Resend, HubSpot, LinkedIn, OpenAI)');

  // Clear any existing mocks
  nock.cleanAll();

  // ========== RESEND EMAIL API ==========
  nock('https://api.resend.com')
    .persist()
    .post('/emails')
    .reply(200, {
      id: 're_mock_123',
      from: 'test@khaledaun.com',
      to: ['recipient@example.com'],
      created_at: new Date().toISOString(),
    })
    .get(/\/emails\/.*/)
    .reply(200, {
      id: 're_mock_123',
      status: 'sent',
      created_at: new Date().toISOString(),
    });

  // ========== HUBSPOT CRM API ==========
  nock('https://api.hubapi.com')
    .persist()
    // Search contacts
    .post('/crm/v3/objects/contacts/search')
    .reply(200, {
      total: 0,
      results: [],
    })
    // Create contact
    .post('/crm/v3/objects/contacts')
    .reply(201, {
      id: '12345',
      properties: {
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User',
      },
      createdAt: new Date().toISOString(),
    })
    // Create deal
    .post('/crm/v3/objects/deals')
    .reply(201, {
      id: '67890',
      properties: {
        dealname: 'Test Deal',
        dealstage: 'discovery',
      },
      createdAt: new Date().toISOString(),
    })
    // Associate contact with deal
    .put(/\/crm\/v3\/objects\/deals\/.*\/associations\/contacts\/.*/)
    .reply(200, {});

  // ========== LINKEDIN API ==========
  nock('https://api.linkedin.com')
    .persist()
    // Get user profile
    .get('/v2/me')
    .reply(200, {
      id: 'mock-linkedin-id',
      firstName: { localized: { en_US: 'Test' } },
      lastName: { localized: { en_US: 'User' } },
    })
    // Create post
    .post('/v2/ugcPosts')
    .reply(201, {
      id: 'urn:li:share:mock123',
      activity: 'urn:li:activity:mock123',
    })
    // OAuth token exchange
    .post('/oauth/v2/accessToken')
    .reply(200, {
      access_token: 'mock_access_token',
      expires_in: 5184000,
      refresh_token: 'mock_refresh_token',
    });

  // ========== OPENAI API ==========
  nock('https://api.openai.com')
    .persist()
    .post('/v1/chat/completions')
    .reply(200, {
      id: 'chatcmpl-mock',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'gpt-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: JSON.stringify({
              outline: [
                '## Introduction',
                '## Main Content',
                '### Point 1',
                '### Point 2',
                '## Conclusion',
              ],
              facts: ['This is a test fact', 'Another test fact'],
            }),
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 100,
        total_tokens: 150,
      },
    });

  // ========== ANTHROPIC API ==========
  nock('https://api.anthropic.com')
    .persist()
    .post('/v1/messages')
    .reply(200, {
      id: 'msg-mock',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            outline: ['## Introduction', '## Main Content', '## Conclusion'],
            facts: ['Test fact 1', 'Test fact 2'],
          }),
        },
      ],
      model: 'claude-3-opus-20240229',
      stop_reason: 'end_turn',
      usage: {
        input_tokens: 50,
        output_tokens: 100,
      },
    });

  console.log('✅ API mocks enabled');
}

/**
 * Disable all mocks
 */
export function disableMocks(): void {
  nock.cleanAll();
  nock.restore();
}

/**
 * Check if mocks are active
 */
export function areMocksActive(): boolean {
  return nock.isActive();
}




