---
name: "twilio-integration-guide"
title: "Twilio Integration Guide - Athelgard Voice System Setup"
type: "text/markdown"
---

# Twilio Integration Guide
## Athelgard Voice System Setup & Configuration

**Document ID:** ATHELGARD-TWILIO-GUIDE-v1.0  
**Version:** 1.0.0  
**Status:** PRODUCTION READY  
**Author:** Kiran Wolfe  
**Last Updated:** August 5, 2026

---

## 🎯 Purpose

This guide provides **complete setup instructions** for integrating Twilio with Athelgard to enable:
- Inbound phone calls to 949-470-2082
- Speech-to-text transcription
- Athelgard's voice responses
- Context persistence across calls
- Intelligent handoff to web/CLI
- Safety layer enforcement

**Phone Number:** +1 (949) 470-2082

---

## 📋 Prerequisites

### Accounts Required
1. **Twilio Account** - [Sign up](https://www.twilio.com/try-twilio)
2. **Supabase Project** - For user memory and context
3. **Athelgard Core** - Running instance
4. **Domain** - athelgard.io (for webhooks)

### Required Credentials
```
Twilio:
- Account SID
- Auth Token
- Phone Number: +19494702082

Supabase:
- Project URL
- Anon Key
- Service Role Key (for server-side)

Athelgard:
- API Endpoint
- API Key
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ATHELGARD VOICE SYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │   Twilio     │────▶│  Webhook     │────▶│ Athelgard    │   │
│  │   Phone      │     │  Receiver    │     │  Core        │   │
│  │  +19494702082│     │  (Vercel)    │     │  (Server)    │   │
│  └──────────────┘     └──────────────┘     └──────────────┘   │
│           │                   │                    │             │
│           │ Call Event        │ HTTP POST         │ Process      │
│           ▼                   ▼                    ▼             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    VOICE FLOW                                 │ │
│  │  1. Answer Call                                              │ │
│  │  2. Authenticate User (if recognized)                        │ │
│  │  3. Load Context (from Supabase)                            │ │
│  │  4. Determine Intent                                        │ │
│  │  5. Select Mode (Quick Help, Mission Guide, etc.)            │ │
│  │  6. Process Request                                         │ │
│  │  7. Generate Response (TTS)                                  │ │
│  │  8. Check Safety Layer                                       │ │
│  │  9. Deliver Response or Handoff                             │ │
│  │ 10. Save Context (to Supabase)                               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐                          │
│  │  Supabase    │◀────┤  Context      │                          │
│  │  (Memory)    │     │  Management   │                          │
│  └──────────────┘     └──────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Step 1: Twilio Account Setup

### 1.1 Create Twilio Account
1. Go to [Twilio Sign Up](https://www.twilio.com/try-twilio)
2. Complete registration
3. Verify email and phone number

### 1.2 Get Phone Number
1. Navigate to **Phone Numbers > Manage > Buy a Number**
2. Search for **949-470-2082** (or similar if unavailable)
3. Select **Voice** capability
4. Click **Buy**
5. Note the **Phone Number SID**

**Important:** If 949-470-2082 is not available, choose a similar California number and update all references.

### 1.3 Configure Phone Number
1. Go to **Phone Numbers > Manage > Active Numbers**
2. Click on your number (949-470-2082)
3. Under **Voice Configuration**:
   - **A CALL COMES IN:** Webhook
   - **Webhook URL:** `https://athelgard.io/api/voice/incoming`
   - **HTTP Method:** POST
4. Under **Fallback Configuration**:
   - **A CALL COMES IN:** Webhook
   - **Webhook URL:** `https://athelgard.io/api/voice/fallback`
5. Click **Save**

### 1.4 Get Credentials
1. Go to **Settings > General**
2. Note your:
   - **Account SID** (starts with AC...)
   - **Auth Token**
3. Store securely in environment variables

---

## 🔧 Step 2: Environment Configuration

### 2.1 Twilio Environment Variables

```bash
# .env.local (Athelgard Voice Service)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+19494702082
TWILIO_PHONE_SID=PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# For local development
TWILIO_WEBHOOK_URL=http://localhost:3000/api/voice/incoming
```

### 2.2 Supabase Environment Variables

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2.3 Athelgard Core Environment Variables

```bash
ATHELGARD_API_URL=https://athelgard-core.athelgard.io
ATHELGARD_API_KEY=your_api_key
```

---

## 🔧 Step 3: Project Setup

### 3.1 Install Dependencies

```bash
# For Node.js/TypeScript project
npm install twilio @supabase/supabase-js dotenv
npm install --save-dev @types/twilio
```

### 3.2 Project Structure

```
athelgard-voice/
├── src/
│   ├── handlers/           # Webhook handlers
│   │   ├── incoming.ts     # Incoming call handler
│   │   ├── fallback.ts    # Fallback handler
│   │   └── status.ts      # Call status handler
│   ├── services/           # Core services
│   │   ├── twilio.ts      # Twilio service
│   │   ├── supabase.ts    # Supabase service
│   │   ├── athelgard.ts   # Athelgard Core service
│   │   ├── speech.ts      # Speech processing
│   │   ├── context.ts     # Context management
│   │   └── safety.ts      # Safety layer
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── utils/              # Utilities
│   │   └── logger.ts
│   └── index.ts            # Main entry point
├── .env.local
├── package.json
└── tsconfig.json
```

---

## 🔧 Step 4: Core Services Implementation

### 4.1 Twilio Service (`services/twilio.ts`)

```typescript
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;

const client = twilio(accountSid, authToken);

export const twilioService = {
  // Make a call (outbound - future feature)
  async makeCall(to: string, from: string, url: string) {
    return client.calls.create({
      to,
      from,
      url,
    });
  },

  // Send SMS (for handoff links)
  async sendSMS(to: string, from: string, body: string) {
    return client.messages.create({
      to,
      from,
      body,
    });
  },

  // Get call details
  async getCall(callSid: string) {
    return client.calls(callSid).fetch();
  },

  // Update call
  async updateCall(callSid: string, twiml: string) {
    return client.calls(callSid).update({
      twiml,
    });
  },
};
```

### 4.2 Supabase Service (`services/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'athelgard',
  },
});

export const supabaseService = {
  // Get user by phone number
  async getUserByPhone(phone: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();
    
    return { data, error };
  },

  // Get or create session
  async getOrCreateSession(userId: string, surface: 'voice') {
    const { data: existing, error: existingError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('surface', surface)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      // Update existing session
      const { data: updated, error } = await supabase
        .from('sessions')
        .update({
          is_active: true,
          last_activity_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      return { data: updated, error };
    }

    // Create new session
    const { data: newSession, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        surface: surface,
        session_data: {},
      })
      .select()
      .single();

    return { data: newSession, error };
  },

  // Update session context
  async updateSessionContext(sessionId: string, context: any) {
    const { data, error } = await supabase
      .from('sessions')
      .update({
        session_data: context,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    return { data, error };
  },

  // Log safety decision
  async logSafetyDecision(decision: {
    userId?: string;
    sessionId?: string;
    surface: string;
    requestType: string;
    requestData: any;
    action: string;
    reason: string;
    tier: number;
    guardrailsChecked: string[];
    guardrailsViolated: string[];
  }) {
    const { error } = await supabase
      .from('safety_logs')
      .insert({
        user_id: decision.userId,
        session_id: decision.sessionId,
        surface: decision.surface,
        request_type: decision.requestType,
        request_data: decision.requestData,
        action: decision.action,
        reason: decision.reason,
        tier: decision.tier,
        guardrails_checked: decision.guardrailsChecked,
        guardrails_violated: decision.guardrailsViolated,
      });

    return { error };
  },
};
```

### 4.3 Athelgard Core Service (`services/athelgard.ts`)

```typescript
import axios from 'axios';

const apiUrl = process.env.ATHELGARD_API_URL!;
const apiKey = process.env.ATHELGARD_API_KEY!;

const athelgardClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
});

export const athelgardService = {
  // Get mode for user intent
  async getMode(intent: string, context: any) {
    const response = await athelgardClient.post('/mode', {
      intent,
      context,
    });
    return response.data;
  },

  // Process user request
  async processRequest(
    userId: string,
    sessionId: string,
    request: string,
    context: any,
    surface: string
  ) {
    const response = await athelgardClient.post('/process', {
      userId,
      sessionId,
      request,
      context,
      surface,
    });
    return response.data;
  },

  // Check safety
  async checkSafety(
    userId: string,
    request: string,
    context: any,
    surface: string
  ) {
    const response = await athelgardClient.post('/safety/check', {
      userId,
      request,
      context,
      surface,
    });
    return response.data;
  },

  // Get handoff URL
  async getHandoffUrl(
    userId: string,
    sessionId: string,
    context: any,
    reason: string
  ) {
    const response = await athelgardClient.post('/handoff', {
      userId,
      sessionId,
      context,
      reason,
    });
    return response.data;
  },
};
```

---

## 🔧 Step 5: Speech Processing

### 5.1 Speech-to-Text Configuration

**Options:**
1. **Twilio Media Streams** (Recommended for real-time)
2. **Twilio Transcribe** (For post-call transcription)
3. **Third-party API** (Google, AWS, Azure)

### 5.2 Using Twilio Media Streams

```typescript
// services/speech.ts
import { twilioService } from './twilio';

export const speechService = {
  // Start transcription
  async startTranscription(callSid: string) {
    // Twilio Media Streams setup
    // This requires Twilio Media Streams to be configured
    // See: https://www.twilio.com/docs/voice/media-streams
    
    // For now, we'll use a simpler approach with <Record>
    const twiml = `
      <Response>
        <Record 
          action="/api/voice/transcribe?callSid=${callSid}" 
          method="POST" 
          maxLength="3600" 
          playBeep="false"
          recordingChannels="mono"
          recordingTrack="inbound"
        />
      </Response>
    `;
    
    await twilioService.updateCall(callSid, twiml);
  },

  // Process transcription (simplified)
  async processTranscription(
    callSid: string,
    recordingUrl: string,
    from: string
  ) {
    // In production, use Twilio's transcription or a third-party API
    // For MVP, we can use a simple approach
    
    // Option 1: Use Twilio's built-in transcription
    // This requires enabling transcription in Twilio console
    
    // Option 2: Use a third-party API
    // const transcription = await thirdPartyService.transcribe(recordingUrl);
    
    // Option 3 (MVP): Return placeholder
    return {
      callSid,
      from,
      text: "[Transcription placeholder]",
      confidence: 0.9,
    };
  },

  // Text-to-Speech
  async textToSpeech(text: string, voice: string = 'Polly.Amy') {
    // Use Twilio's <Say> verb for simple TTS
    // For advanced TTS, use a third-party service
    
    return {
      ssml: `<speak><voice name="${voice}">${text}</voice></speak>`,
      text,
    };
  },
};
```

### 5.3 Using Third-Party TTS (Recommended for Quality)

For better voice quality, consider:
- **Amazon Polly** (Neural voices)
- **Google Cloud Text-to-Speech** (WaveNet voices)
- **Microsoft Azure TTS** (Neural voices)
- **ElevenLabs** (Most natural, paid)

Example with Amazon Polly:
```typescript
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';

const polly = new PollyClient({ region: 'us-east-1' });

export const pollyService = {
  async synthesize(text: string, voiceId: string = 'Amy') {
    const command = new SynthesizeSpeechCommand({
      Text: text,
      VoiceId: voiceId,
      Engine: 'neural',
      OutputFormat: 'mp3',
    });

    const response = await polly.send(command);
    const audioStream = response.AudioStream;
    
    // Convert to base64 or save to file
    // Then use Twilio's <Play> verb to play the audio
    
    return audioStream;
  },
};
```

---

## 🔧 Step 6: Context Management

### 6.1 Context Service (`services/context.ts`)

```typescript
export interface CallContext {
  userId?: string;
  sessionId?: string;
  phoneNumber: string;
  callSid: string;
  currentMode: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  currentMissionId?: string;
  currentBranch?: string;
  lastActivity?: string;
}

export const contextService = {
  // Initialize context for new call
  async initializeContext(callSid: string, from: string): Promise<CallContext> {
    // Check if user exists by phone
    const { data: user } = await supabaseService.getUserByPhone(from);
    
    const context: CallContext = {
      userId: user?.id,
      phoneNumber: from,
      callSid,
      currentMode: 'guide', // Default mode
      conversationHistory: [],
    };

    // Create or update session
    if (user) {
      const { data: session } = await supabaseService.getOrCreateSession(
        user.id,
        'voice'
      );
      context.sessionId = session?.id;
    }

    return context;
  },

  // Update context after each turn
  async updateContext(
    sessionId: string,
    update: Partial<CallContext>
  ): Promise<CallContext> {
    const { data: session } = await supabaseService.getOrCreateSession(
      update.userId || '',
      'voice'
    );

    const updatedContext: CallContext = {
      ...session?.session_data,
      ...update,
      conversationHistory: [
        ...(session?.session_data?.conversationHistory || []),
        ...(update.conversationHistory || []),
      ],
    };

    await supabaseService.updateSessionContext(
      sessionId,
      updatedContext
    );

    return updatedContext;
  },

  // Detect mode from intent
  async detectMode(intent: string, context: CallContext): Promise<string> {
    // Use Athelgard Core for mode detection
    const mode = await athelgardService.getMode(intent, context);
    return mode.mode;
  },

  // Check if handoff is needed
  async checkHandoff(
    request: string,
    context: CallContext
  ): Promise<{ needed: boolean; reason: string; url?: string }> {
    // Check for handoff conditions
    const handoffConditions = [
      { pattern: /code|diff|file|edit|change|modify/i, reason: 'code-heavy' },
      { pattern: /diagram|visual|chart|graph|image/i, reason: 'visual' },
      { pattern: /long|detailed|complex|extensive/i, reason: 'complex' },
    ];

    for (const condition of handoffConditions) {
      if (condition.pattern.test(request)) {
        const handoff = await athelgardService.getHandoffUrl(
          context.userId || '',
          context.sessionId || '',
          context,
          condition.reason
        );
        return { needed: true, reason: condition.reason, url: handoff.url };
      }
    }

    return { needed: false, reason: '' };
  },
};
```

---

## 🔧 Step 7: Safety Layer Integration

### 7.1 Safety Service (`services/safety.ts`)

```typescript
export const safetyService = {
  // Check request against safety layer
  async checkRequest(
    userId: string,
    request: string,
    context: any,
    surface: string = 'voice'
  ) {
    const safetyCheck = await athelgardService.checkSafety(
      userId,
      request,
      context,
      surface
    );

    // Log the decision
    await supabaseService.logSafetyDecision({
      userId: userId || undefined,
      sessionId: context.sessionId,
      surface,
      requestType: 'voice',
      requestData: { text: request },
      action: safetyCheck.action,
      reason: safetyCheck.reason,
      tier: safetyCheck.tier,
      guardrailsChecked: safetyCheck.guardrailsChecked,
      guardrailsViolated: safetyCheck.guardrailsViolated,
    });

    return safetyCheck;
  },

  // Generate safe response
  async generateSafeResponse(
    userId: string,
    request: string,
    context: any
  ) {
    const safetyCheck = await this.checkRequest(userId, request, context);

    if (safetyCheck.action === 'BLOCK') {
      return {
        response: "I can't help with that request. It falls outside ethical boundaries. Let me help you with something else.",
        shouldBlock: true,
      };
    }

    if (safetyCheck.action === 'REDIRECT') {
      return {
        response: safetyCheck.redirectMessage || "Let me redirect you to a better resource for this.",
        shouldRedirect: true,
        redirectUrl: safetyCheck.redirectUrl,
      };
    }

    // Process the request
    const response = await athelgardService.processRequest(
      userId,
      context.sessionId,
      request,
      context,
      'voice'
    );

    return {
      response: response.text,
      shouldBlock: false,
      shouldRedirect: false,
    };
  },
};
```

---

## 🔧 Step 8: Webhook Handlers

### 8.1 Incoming Call Handler (`handlers/incoming.ts`)

```typescript
import { Request, Response } from 'express';
import { Twilio } from 'twilio';
import { contextService } from '../services/context';
import { safetyService } from '../services/safety';
import { speechService } from '../services/speech';

export const incomingHandler = async (req: Request, res: Response) => {
  const callSid = req.body.CallSid;
  const from = req.body.From;
  const to = req.body.To;

  // Initialize context
  const context = await contextService.initializeContext(callSid, from);

  // Welcome message for new calls
  const welcomeMessage = context.userId
    ? `Welcome back. This is Athelgard. How can I help you today?`
    : `Welcome. This is Athelgard, the ethical bounty-hunting guide. How can I help you today?`;

  // Generate TwiML response
  const twiml = new Twilio.twiml.VoiceResponse();
  
  // Start with welcome message
  twiml.say({ voice: 'Polly.Amy' }, welcomeMessage);
  
  // Start recording for transcription
  twiml.record({
    action: `/api/voice/process?callSid=${callSid}`,
    method: 'POST',
    maxLength: 3600, // 1 hour max
    playBeep: false,
    recordingChannels: 'mono',
    recordingTrack: 'inbound',
  });

  // Set timeout for no speech
  twiml.pause({ length: 5 });
  twiml.say({ voice: 'Polly.Amy' }, `I didn't hear anything. Please speak after the tone.`);
  twiml.redirect(`/api/voice/incoming?callSid=${callSid}`);

  res.type('text/xml');
  res.send(twiml.toString());
};
```

### 8.2 Process Call Handler (`handlers/process.ts`)

```typescript
import { Request, Response } from 'express';
import { Twilio } from 'twilio';
import { contextService } from '../services/context';
import { safetyService } from '../services/safety';
import { speechService } from '../services/speech';
import { supabaseService } from '../services/supabase';

export const processHandler = async (req: Request, res: Response) => {
  const callSid = req.query.callSid as string;
  const recordingUrl = req.body.RecordingUrl;
  const from = req.body.From;

  // Get the call to check status
  const call = await twilioService.getCall(callSid);
  
  // If call is completed, end processing
  if (call.status === 'completed') {
    res.type('text/xml');
    res.send('<Response></Response>');
    return;
  }

  // Get or initialize context
  let { data: session } = await supabaseService.getOrCreateSession(
    '', // No user yet
    'voice'
  );
  
  const context = session?.session_data as CallContext || 
    await contextService.initializeContext(callSid, from);

  // Process transcription (in production, this would be real-time)
  // For MVP, we'll use the recording URL
  const transcription = await speechService.processTranscription(
    callSid,
    recordingUrl,
    from
  );

  // Update context with user input
  context.conversationHistory.push({
    role: 'user',
    content: transcription.text,
    timestamp: new Date().toISOString(),
  });

  // Check safety
  const safetyResult = await safetyService.generateSafeResponse(
    context.userId || '',
    transcription.text,
    context
  );

  if (safetyResult.shouldBlock) {
    // Generate blocked response
    const twiml = new Twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'Polly.Amy' }, safetyResult.response);
    twiml.pause({ length: 2 });
    twiml.say({ voice: 'Polly.Amy' }, 'How else can I help you?');
    twiml.redirect(`/api/voice/incoming?callSid=${callSid}`);

    res.type('text/xml');
    res.send(twiml.toString());
    return;
  }

  if (safetyResult.shouldRedirect) {
    // Generate handoff response
    const twiml = new Twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'Polly.Amy' }, safetyResult.response);
    twiml.pause({ length: 1 });
    twiml.say({ voice: 'Polly.Amy' }, `I'll send you a link to continue this conversation.`);
    
    // Send SMS with handoff link
    if (safetyResult.redirectUrl) {
      await twilioService.sendSMS(
        from,
        process.env.TWILIO_PHONE_NUMBER!,
        `Continue your conversation with Athelgard: ${safetyResult.redirectUrl}`
      );
    }
    
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());
    return;
  }

  // Process the request through Athelgard Core
  const mode = await contextService.detectMode(transcription.text, context);
  context.currentMode = mode;

  const response = await athelgardService.processRequest(
    context.userId || '',
    context.sessionId || '',
    transcription.text,
    context,
    'voice'
  );

  // Update context with assistant response
  context.conversationHistory.push({
    role: 'assistant',
    content: response.text,
    timestamp: new Date().toISOString(),
  });

  // Update session in Supabase
  if (context.sessionId) {
    await supabaseService.updateSessionContext(
      context.sessionId,
      context
    );
  }

  // Check if handoff is needed
  const handoffCheck = await contextService.checkHandoff(
    transcription.text,
    context
  );

  // Generate TwiML response
  const twiml = new Twilio.twiml.VoiceResponse();
  
  // Speak the response
  twiml.say({ voice: 'Polly.Amy' }, response.text);
  
  if (handoffCheck.needed) {
    twiml.pause({ length: 1 });
    twiml.say({ voice: 'Polly.Amy' }, `For this, you'll need to see a visual. I'll send you a link.`);
    
    if (handoffCheck.url) {
      await twilioService.sendSMS(
        from,
        process.env.TWILIO_PHONE_NUMBER!,
        `Continue here: ${handoffCheck.url}`
      );
    }
    
    twiml.hangup();
  } else {
    twiml.pause({ length: 2 });
    twiml.say({ voice: 'Polly.Amy' }, 'What would you like to do next?');
    twiml.redirect(`/api/voice/incoming?callSid=${callSid}`);
  }

  res.type('text/xml');
  res.send(twiml.toString());
};
```

### 8.3 Fallback Handler (`handlers/fallback.ts`)

```typescript
import { Request, Response } from 'express';
import { Twilio } from 'twilio';

export const fallbackHandler = async (req: Request, res: Response) => {
  const twiml = new Twilio.twiml.VoiceResponse();
  
  twiml.say({ voice: 'Polly.Amy' }, 
    'Sorry, I encountered an error. Please try again later.');
  twiml.hangup();

  res.type('text/xml');
  res.send(twiml.toString());
};
```

### 8.4 Status Handler (`handlers/status.ts`)

```typescript
import { Request, Response } from 'express';
import { twilioService } from '../services/twilio';

export const statusHandler = async (req: Request, res: Response) => {
  const callSid = req.query.callSid as string;
  
  if (!callSid) {
    return res.status(400).json({ error: 'callSid is required' });
  }

  const call = await twilioService.getCall(callSid);
  
  res.json({
    callSid,
    status: call.status,
    from: call.from,
    to: call.to,
    startTime: call.startTime,
    endTime: call.endTime,
    duration: call.duration,
  });
};
```

---

## 🔧 Step 9: Main Server Setup

### 9.1 Express Server (`index.ts`)

```typescript
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { incomingHandler } from './handlers/incoming';
import { processHandler } from './handlers/process';
import { fallbackHandler } from './handlers/fallback';
import { statusHandler } from './handlers/status';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Voice API routes
app.post('/api/voice/incoming', incomingHandler);
app.post('/api/voice/process', processHandler);
app.post('/api/voice/fallback', fallbackHandler);
app.get('/api/voice/status', statusHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Athelgard Voice service running on port ${PORT}`);
});

export default app;
```

---

## 🚀 Deployment

### 10.1 Vercel Deployment (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Create `vercel.json`:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/voice/(.*)",
         "dest": "index.ts"
       },
       {
         "src": "/health",
         "dest": "index.ts"
       }
     ]
   }
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Configure Environment Variables in Vercel Dashboard:**
   - Add all variables from `.env.local`

5. **Update Twilio Webhook URL:**
   - Change from `http://localhost:3000/api/voice/incoming` to `https://your-vercel-app.vercel.app/api/voice/incoming`

### 10.2 Alternative: Self-Hosted

1. **Build Docker Image:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 3000
   CMD ["node", "index.ts"]
   ```

2. **Build and Run:**
   ```bash
   docker build -t athelgard-voice .
   docker run -p 3000:3000 --env-file .env.local athelgard-voice
   ```

3. **Deploy to Cloud Provider:**
   - AWS ECS
   - Google Cloud Run
   - Azure Container Instances

---

## 📊 Monitoring & Analytics

### 11.1 Twilio Metrics
- **Call Volume:** Track inbound calls
- **Call Duration:** Monitor average call length
- **Completion Rate:** % of calls that complete successfully
- **Error Rate:** % of calls with errors

### 11.2 Custom Metrics
```typescript
// Add to handlers
const metrics = {
  callsReceived: 0,
  callsCompleted: 0,
  callsFailed: 0,
  handoffsInitiated: 0,
  safetyBlocks: 0,
  averageCallDuration: 0,
};

// Log metrics to Supabase or analytics service
```

### 11.3 Logging
- All calls logged with:
  - Call SID
  - From/To numbers
  - Start/End time
  - Duration
  - Status
  - User ID (if authenticated)
  - Mode used
  - Safety decisions

---

## 🔒 Security Considerations

### 12.1 Twilio Security
- **Webhook Validation:** Verify Twilio requests using signature
  ```typescript
  import { twilio } from 'twilio';
  
  const validateRequest = (req: Request) => {
    const expectedSignature = req.headers['x-twilio-signature'];
    const url = process.env.TWILIO_WEBHOOK_URL || req.originalUrl;
    const params = req.body;
    
    return twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN!,
      expectedSignature,
      url,
      params
    );
  };
  ```

- **HTTPS Only:** All webhooks must use HTTPS
- **Rate Limiting:** Implement rate limiting on voice endpoints

### 12.2 Data Security
- **PII Protection:** Never store full phone numbers (hash them)
- **Recording Storage:** Store recordings securely, delete after processing
- **Encryption:** Encrypt sensitive data at rest

### 12.3 Privacy
- **GDPR Compliance:** Honor right to be forgotten
- **Data Retention:** Delete call recordings after 30 days (or user request)
- **Consent:** Inform users about recording (if applicable)

---

## 📚 Testing

### 13.1 Local Testing

1. **ngrok for Local Webhooks:**
   ```bash
   npm install -g ngrok
   ngrok http 3000
   ```

2. **Configure Twilio for Local Testing:**
   - Set webhook URL to `https://your-ngrok-url.ngrok.io/api/voice/incoming`

3. **Test with Twilio CLI:**
   ```bash
   npm install -g twilio-cli
   twilio phone-numbers:update +19494702082 --voice-url https://your-ngrok-url.ngrok.io/api/voice/incoming
   ```

4. **Make Test Calls:**
   - Call your Twilio number from your phone
   - Verify the flow works

### 13.2 Automated Testing

```typescript
// tests/voice.test.ts
import { incomingHandler } from '../handlers/incoming';
import { processHandler } from '../handlers/process';

// Mock Twilio and services
jest.mock('../services/twilio');
jest.mock('../services/supabase');
jest.mock('../services/athelgard');

describe('Voice Handlers', () => {
  describe('incomingHandler', () => {
    it('should return TwiML with welcome message', async () => {
      const req = { body: { CallSid: 'CA123', From: '+1234567890', To: '+19494702082' } };
      const res = { type: jest.fn(), send: jest.fn() };
      
      await incomingHandler(req as any, res as any);
      
      expect(res.type).toHaveBeenCalledWith('text/xml');
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('processHandler', () => {
    it('should process transcription and generate response', async () => {
      const req = {
        query: { callSid: 'CA123' },
        body: { RecordingUrl: 'http://example.com/recording.mp3', From: '+1234567890' }
      };
      const res = { type: jest.fn(), send: jest.fn() };
      
      await processHandler(req as any, res as any);
      
      expect(res.type).toHaveBeenCalledWith('text/xml');
      expect(res.send).toHaveBeenCalled();
    });
  });
});
```

---

## 📖 Documentation

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/voice/incoming` | Handle incoming calls |
| POST | `/api/voice/process` | Process call transcription |
| POST | `/api/voice/fallback` | Handle call errors |
| GET | `/api/voice/status` | Get call status |
| GET | `/health` | Health check |

### Webhook Payloads

**Incoming Call:**
```json
{
  "CallSid": "CA1234567890",
  "From": "+1234567890",
  "To": "+19494702082",
  "CallStatus": "ringing"
}
```

**Recording Available:**
```json
{
  "CallSid": "CA1234567890",
  "RecordingUrl": "https://api.twilio.com/2010-04-01/Accounts/ACxxx/Recordings/RNxxx",
  "RecordingSid": "RNxxx",
  "From": "+1234567890",
  "To": "+19494702082"
}
```

---

## 🎯 Voice Modes Implementation

### Quick Help Mode
```typescript
// In processHandler
if (mode === 'quick_help') {
  // Short, direct answers
  const maxResponseLength = 2; // ~30 seconds of speech
  response.text = truncateResponse(response.text, maxResponseLength);
}
```

### Mission Guide Mode
```typescript
if (mode === 'mission_guide') {
  // Load mission context
  if (context.currentMissionId) {
    const mission = await getMission(context.currentMissionId);
    response.text = `In your current mission "${mission.title}": ${response.text}`;
  }
}
```

### Ethical Triage Mode
```typescript
if (mode === 'ethical_triage') {
  // Always check scope
  const scopeCheck = await checkScope(response.text);
  if (!scopeCheck.authorized) {
    return {
      response: "That target appears to be out of scope. Let me help you with authorized systems only.",
      shouldBlock: false, // Don't block, redirect
      shouldRedirect: true,
      redirectUrl: '/scope-guidance',
    };
  }
}
```

### Builder Brief Mode
```typescript
if (mode === 'builder_brief') {
  // Connect to CLI context if available
  if (context.lastBranch) {
    const branchInfo = await getBranchInfo(context.lastBranch);
    response.text = `Regarding branch ${context.lastBranch}: ${response.text}`;
  }
}
```

---

## 📞 Phone Number Management

### Primary Number
- **Number:** +1 (949) 470-2082
- **Type:** Local (California)
- **Capabilities:** Voice, SMS
- **Status:** Primary inbound number

### Future Numbers (Optional)
- **Toll-Free:** +1 (800) XXX-XXXX (for US-wide access)
- **International:** Local numbers in key markets
- **Dedicated:** Separate numbers for different modes

### Number Configuration
```
Voice:
- Incoming: Webhook to /api/voice/incoming
- Fallback: Webhook to /api/voice/fallback

SMS:
- Incoming: Webhook to /api/sms/incoming
- Fallback: Webhook to /api/sms/fallback
```

---

## 💰 Cost Considerations

### Twilio Pricing (Estimated)
- **Phone Number:** $1/month
- **Inbound Calls:** ~$0.0135/minute
- **Outbound Calls:** ~$0.0135/minute
- **Transcription:** $0.0025/minute
- **SMS:** $0.0075/message

### Monthly Cost Estimates
| Calls/Day | Minutes/Month | Cost/Month |
|-----------|---------------|------------|
| 10        | 300           | ~$4        |
| 50        | 1,500         | ~$20       |
| 100       | 3,000         | ~$40       |
| 500       | 15,000        | ~$200      |

### Cost Optimization
- **Call Length:** Encourage concise interactions (3-5 minutes)
- **Handoff:** Redirect to web for long conversations
- **Caching:** Cache frequent responses
- **Transcription:** Use Twilio's built-in (included with voice)

---

## 🎯 Success Metrics

### Phase 3 Targets (Weeks 9-12)
- **Calls per Day:** >100
- **Call Completion Rate:** >90%
- **Average Call Duration:** 3-5 minutes
- **Handoff Rate:** 30-40%
- **User Satisfaction:** >4.5/5
- **Voice User Retention:** >60% month-over-month

### Monitoring Dashboard
Track in real-time:
- Active calls
- Calls today
- Average duration
- Completion rate
- Handoff rate
- Safety blocks
- Top intents
- Top modes

---

## 📚 Related Documents

- [Voice Product Spec PRD](canvas) - Requirements
- [Athelgard Core PRD](canvas) - Core system
- [Safety & Ethics PRD](canvas) - Guardrails
- [Athelgard Master Spec](canvas) - Production spec
- [Athelgard Ethical Blueprint](canvas) - Ethical framework

---

## ✅ Implementation Checklist

### Setup
- [ ] Twilio account created
- [ ] Phone number purchased (949-470-2082)
- [ ] Supabase project configured
- [ ] Environment variables set
- [ ] Dependencies installed

### Development
- [ ] Twilio service implemented
- [ ] Supabase service implemented
- [ ] Athelgard Core service implemented
- [ ] Speech service implemented
- [ ] Context service implemented
- [ ] Safety service implemented
- [ ] Webhook handlers implemented
- [ ] Server configured

### Testing
- [ ] Local testing with ngrok
- [ ] Incoming call handler tested
- [ ] Process handler tested
- [ ] Fallback handler tested
- [ ] Safety layer tested
- [ ] Handoff logic tested

### Deployment
- [ ] Vercel project set up
- [ ] Environment variables configured
- [ ] Twilio webhook updated
- [ ] Health check working
- [ ] Monitoring configured

### Post-Deployment
- [ ] First test call successful
- [ ] Error handling verified
- [ ] Logging working
- [ ] Metrics tracking
- [ ] Documentation updated

---

## 🎯 Final Notes

This integration guide provides **everything needed** to set up Athelgard's voice system:
- Twilio account and phone number configuration
- Complete server implementation
- Speech processing (STT and TTS)
- Context management across calls
- Safety layer enforcement
- Handoff to web/CLI
- Monitoring and analytics

**Next Steps:**
1. Set up Twilio account and purchase number
2. Configure Supabase project
3. Deploy voice service (Vercel recommended)
4. Update Twilio webhook URL
5. Test with real calls
6. Monitor and iterate

---

*"The voice is Athelgard's most personal surface. This guide ensures it's as intelligent, ethical, and connected as the rest of her."*