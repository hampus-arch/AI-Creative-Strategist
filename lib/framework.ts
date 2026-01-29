export type FrameworkPhase = 
  | "INTERRUPT" 
  | "EXPLAIN" 
  | "OVERCOME" 
  | "PUSH" 
  | "REENFORCE";

export interface PhaseInfo {
  id: FrameworkPhase;
  name: string;
  goal: string;
  percentage: string;
  description: string;
  psychology: string[];
  creativeFormats: string[];
  messaging: string[];
  color: string;
}

export const FRAMEWORK_PHASES: PhaseInfo[] = [
  {
    id: "INTERRUPT",
    name: "Interrupt",
    goal: "Problem/Product Awareness",
    percentage: "60%",
    description: "Capture attention and create awareness among people who don't know your brand, product, or problem.",
    psychology: [
      "Surprise",
      "Contrast",
      "Relevance",
      "Identity resonance",
    ],
    creativeFormats: [
      "Founder story",
      "Bold claims",
      "POV hooks",
      "UGC",
      "US vs famous competitor",
    ],
    messaging: [
      '"Do you hate [pain]?"',
      '"I didn\'t realize this was destroying my X"',
      '"I created this product because I experienced X"',
    ],
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "EXPLAIN",
    name: "Explain",
    goal: "Clarity, Education, Differentiation",
    percentage: "20%",
    description: "Educate your audience about how your product works and what makes it different.",
    psychology: [
      "Logic",
      "Comprehension",
      "Visual clarity",
    ],
    creativeFormats: [
      "Demos",
      "Voice-over explainers",
      "Carousels",
      "FPO (Feature point out)",
      "Before & After",
      "US vs competitors",
      "Unboxing explain",
    ],
    messaging: [
      '"How it works"',
      '"Benefit 1, 2, 3"',
      '"Transform your X"',
      '"Designed in Sweden. Made for you"',
    ],
    color: "from-amber-500 to-amber-600",
  },
  {
    id: "OVERCOME",
    name: "Overcome",
    goal: "Objection Handling & Building Trust",
    percentage: "15%",
    description: "Address objections and build trust through social proof and authority.",
    psychology: [
      "Customer proof",
      "Press proof",
      "Influencer proof",
      "Authority",
      "Loss aversion",
    ],
    creativeFormats: [
      "Testimonials/Reviews",
      "UGC mashups",
      "Thought leaders",
      "Press quotes",
      "Unboxing with review",
      "IRL POV / Fit checks",
    ],
    messaging: [
      '"I thought it was too expensive... until I tried it"',
      '"Can\'t live without [Product X]"',
      '"[Magazine] says..."',
      '"[Benefit] is important for your health"',
    ],
    color: "from-yellow-500 to-yellow-600",
  },
  {
    id: "PUSH",
    name: "Push",
    goal: "Conversion Activation",
    percentage: "5%",
    description: "Drive conversions through urgency, scarcity, and compelling offers.",
    psychology: [
      "Timing (i.e. be there)",
      "FOMO",
      "Scarcity",
      "Urgency",
      "Commitment bias",
      "Sunk cost effect",
    ],
    creativeFormats: [
      "Grids & Splits",
      "DPA / Catalog ads",
      "Product bundle offers",
      "Discount offers",
      "Urgency offers",
    ],
    messaging: [
      '"Our top selling product ahead of the summer"',
      '"24h left for our best-ever offer"',
      '"Get 15% off today only"',
      '"Your cart is waiting"',
      '"Don\'t miss out"',
    ],
    color: "from-lime-500 to-lime-600",
  },
  {
    id: "REENFORCE",
    name: "Reenforce",
    goal: "Retention & Advocacy",
    percentage: "Post-purchase",
    description: "Retain customers and turn them into advocates through appreciation and community.",
    psychology: [
      "Gratitude",
      "Status signaling",
      "Community identity",
      "Belonging",
      "Empowerment",
    ],
    creativeFormats: [
      "Product care",
      "How to get the most out",
      "Loyalty/referral program",
      "Product pairings",
      "Founder thank-you videos",
      "Seasonal repurchase",
    ],
    messaging: [
      '"Thank you..."',
      '"You\'re part of something"',
      '"You\'ve unlocked early access"',
      '"Because you bought, You would like..."',
      '"Refer a friend"',
    ],
    color: "from-emerald-500 to-emerald-600",
  },
];

export type ContentType = 
  | "hooks"
  | "scripts"
  | "angles"
  | "customer_avatar"
  | "review_analysis";

export interface PromptTemplate {
  id: string;
  type: ContentType;
  name: string;
  description: string;
  promptTemplate: string;
  variables: string[];
}

export const PROMPT_TEMPLATES: Record<FrameworkPhase, PromptTemplate[]> = {
  INTERRUPT: [
    {
      id: "interrupt-hooks",
      type: "hooks",
      name: "Attention-Grabbing Hooks",
      description: "Generate scroll-stopping hooks that interrupt and capture attention",
      promptTemplate: `You are a world-class direct response copywriter specializing in Facebook ads. Generate 10 attention-grabbing hooks for the INTERRUPT phase of the customer journey.

Brand: {{brandName}}
Product: {{productName}}
Description: {{productDescription}}
Target Audience: {{targetAudience}}

The hooks should:
- Create immediate pattern interrupts
- Use surprise, contrast, or identity resonance
- Address pain points or aspirations
- Be suitable for the first 3 seconds of a video ad or first line of copy

Psychology to leverage: Surprise, contrast, relevance, identity resonance

Example formats:
- "Do you hate [pain]?"
- "I didn't realize this was destroying my X"
- "I created this product because I experienced X"

Generate 10 unique hooks, each on a new line. Make them punchy, provocative, and impossible to ignore.`,
      variables: ["brandName", "productName", "productDescription", "targetAudience"],
    },
    {
      id: "interrupt-angles",
      type: "angles",
      name: "New Ad Angles",
      description: "Discover fresh angles to approach your audience",
      promptTemplate: `You are a creative strategist for performance marketing. Generate 5 unique advertising angles for the INTERRUPT phase.

Brand: {{brandName}}
Product: {{productName}}
Description: {{productDescription}}
Target Audience: {{targetAudience}}
Pain Points: {{painPoints}}

For each angle, provide:
1. Angle Name (2-4 words)
2. Core Concept (1-2 sentences)
3. Emotional Trigger (what emotion does it tap into)
4. Example Hook (one line)
5. Suggested Creative Format (from: Founder story, Bold claims, POV hooks, UGC, US vs competitor)

Focus on angles that can create pattern interrupts and make the viewer stop scrolling.`,
      variables: ["brandName", "productName", "productDescription", "targetAudience", "painPoints"],
    },
    {
      id: "interrupt-scripts",
      type: "scripts",
      name: "Video Ad Scripts",
      description: "Full scripts for attention-grabbing video ads",
      promptTemplate: `You are an expert direct response video ad scriptwriter. Write a 30-60 second video ad script for the INTERRUPT phase.

Brand: {{brandName}}
Product: {{productName}}
Description: {{productDescription}}
Target Audience: {{targetAudience}}
Key Benefits: {{keyBenefits}}

Script requirements:
- Opening hook (first 3 seconds) that creates a pattern interrupt
- Problem agitation that resonates with the target audience
- Introduction of the product as the solution
- End with curiosity or a soft CTA

Format the script with:
[HOOK - 0:00-0:03]
[PROBLEM - 0:03-0:15]
[SOLUTION INTRO - 0:15-0:30]
[CURIOSITY/CTA - 0:30-0:45]

Include visual directions in brackets and spoken text clearly marked.`,
      variables: ["brandName", "productName", "productDescription", "targetAudience", "keyBenefits"],
    },
  ],
  EXPLAIN: [
    {
      id: "explain-hooks",
      type: "hooks",
      name: "Educational Hooks",
      description: "Hooks that promise clarity and education",
      promptTemplate: `You are a direct response copywriter. Generate 10 educational hooks for the EXPLAIN phase.

Brand: {{brandName}}
Product: {{productName}}
Description: {{productDescription}}
Key Features: {{keyFeatures}}

The hooks should:
- Promise to explain how something works
- Highlight unique differentiators
- Use logic and comprehension triggers
- Set up a "learn more" expectation

Example formats:
- "How it works"
- "Benefit 1, 2, 3"
- "Here's why [Product] is different"
- "The science behind [X]"

Generate 10 educational hooks that make people want to learn more.`,
      variables: ["brandName", "productName", "productDescription", "keyFeatures"],
    },
    {
      id: "explain-scripts",
      type: "scripts",
      name: "Explainer Scripts",
      description: "Scripts that educate and differentiate",
      promptTemplate: `Write a 45-60 second explainer video script for the EXPLAIN phase.

Brand: {{brandName}}
Product: {{productName}}
Description: {{productDescription}}
Key Features: {{keyFeatures}}
Differentiators: {{differentiators}}

Script should:
- Open with a clear promise of what they'll learn
- Explain how the product works (simplified)
- Highlight 2-3 key differentiators
- Use visual demonstrations
- End with a clear value proposition

Format:
[INTRO/PROMISE - 0:00-0:05]
[HOW IT WORKS - 0:05-0:25]
[KEY DIFFERENTIATORS - 0:25-0:45]
[VALUE PROP - 0:45-0:60]

Include visual cues and B-roll suggestions.`,
      variables: ["brandName", "productName", "productDescription", "keyFeatures", "differentiators"],
    },
    {
      id: "explain-angles",
      type: "angles",
      name: "Educational Angles",
      description: "Angles focused on education and differentiation",
      promptTemplate: `Generate 5 educational advertising angles for the EXPLAIN phase.

Brand: {{brandName}}
Product: {{productName}}
Description: {{productDescription}}
Key Features: {{keyFeatures}}

For each angle:
1. Angle Name
2. Educational Focus (what will they learn)
3. Format Suggestion (Demo, Voice-over explainer, Carousel, Before/After, etc.)
4. Key Message
5. Visual Concept

Focus on clarity, logic, and differentiation.`,
      variables: ["brandName", "productName", "productDescription", "keyFeatures"],
    },
  ],
  OVERCOME: [
    {
      id: "overcome-hooks",
      type: "hooks",
      name: "Trust-Building Hooks",
      description: "Hooks that leverage social proof and overcome objections",
      promptTemplate: `Generate 10 trust-building hooks for the OVERCOME phase.

Brand: {{brandName}}
Product: {{productName}}
Common Objections: {{objections}}
Social Proof: {{socialProof}}

The hooks should:
- Address common objections head-on
- Leverage social proof (reviews, press, influencers)
- Build credibility and trust
- Use loss aversion psychology

Example formats:
- "I thought it was too expensive... until I tried it"
- "Can't live without [Product X]"
- "[Magazine] says..."
- "10,000+ 5-star reviews can't be wrong"

Generate 10 trust-building hooks that overcome skepticism.`,
      variables: ["brandName", "productName", "objections", "socialProof"],
    },
    {
      id: "overcome-scripts",
      type: "scripts",
      name: "Testimonial Scripts",
      description: "Scripts featuring customer stories and reviews",
      promptTemplate: `Write a 30-45 second testimonial-style script for the OVERCOME phase.

Brand: {{brandName}}
Product: {{productName}}
Common Objections: {{objections}}
Customer Success Stories: {{successStories}}

Script should:
- Open with the customer's initial skepticism/objection
- Show the transformation or result
- Include specific, believable details
- End with a recommendation

Format as a natural testimonial that could be filmed with a real customer.
Include notes on tone, setting, and visual suggestions.`,
      variables: ["brandName", "productName", "objections", "successStories"],
    },
    {
      id: "overcome-review-analysis",
      type: "review_analysis",
      name: "Review Mining",
      description: "Extract insights from customer reviews",
      promptTemplate: `Analyze these customer reviews and extract key insights for ad creation.

Brand: {{brandName}}
Product: {{productName}}

Reviews:
{{reviews}}

Please extract:
1. Top 5 Most Mentioned Benefits
2. Top 5 Initial Objections (that were overcome)
3. Top 5 Emotional Transformation Quotes
4. Common Language/Phrases Customers Use
5. Unexpected Benefits Mentioned
6. Before/After Descriptions

Format each section with specific quotes and frequency of mention where applicable.`,
      variables: ["brandName", "productName", "reviews"],
    },
  ],
  PUSH: [
    {
      id: "push-hooks",
      type: "hooks",
      name: "Urgency Hooks",
      description: "Hooks that create urgency and drive action",
      promptTemplate: `Generate 10 urgency-driven hooks for the PUSH phase.

Brand: {{brandName}}
Product: {{productName}}
Current Offer: {{currentOffer}}

The hooks should:
- Create FOMO (fear of missing out)
- Emphasize scarcity or time limits
- Drive immediate action
- Feel authentic, not spammy

Psychology: Timing, FOMO, Scarcity, Urgency, Commitment bias

Example formats:
- "24h left for our best-ever offer"
- "Get 15% off today only"
- "Your cart is waiting"
- "Don't miss out"

Generate 10 urgency hooks that compel immediate action.`,
      variables: ["brandName", "productName", "currentOffer"],
    },
    {
      id: "push-scripts",
      type: "scripts",
      name: "Conversion Scripts",
      description: "Short scripts focused on driving immediate action",
      promptTemplate: `Write a 15-30 second conversion-focused script for the PUSH phase.

Brand: {{brandName}}
Product: {{productName}}
Current Offer: {{currentOffer}}
Target: People who have seen previous ads but haven't purchased

Script should:
- Remind them of the product value (briefly)
- Present the offer clearly
- Create urgency (deadline, scarcity)
- Have a crystal-clear CTA

Keep it short, punchy, and action-oriented.`,
      variables: ["brandName", "productName", "currentOffer"],
    },
  ],
  REENFORCE: [
    {
      id: "reenforce-hooks",
      type: "hooks",
      name: "Retention Hooks",
      description: "Hooks for post-purchase engagement",
      promptTemplate: `Generate 10 retention and advocacy hooks for the REENFORCE phase.

Brand: {{brandName}}
Product: {{productName}}
Loyalty Program: {{loyaltyProgram}}

The hooks should:
- Express gratitude
- Build community identity
- Encourage referrals
- Promote additional products

Psychology: Gratitude, Status signaling, Community identity, Belonging

Example formats:
- "Thank you for being part of the family"
- "You've unlocked early access"
- "Because you loved [X], you'll love [Y]"
- "Refer a friend, get [reward]"

Generate 10 retention-focused hooks.`,
      variables: ["brandName", "productName", "loyaltyProgram"],
    },
    {
      id: "reenforce-scripts",
      type: "scripts",
      name: "Thank You & Upsell Scripts",
      description: "Scripts for customer appreciation and cross-sells",
      promptTemplate: `Write a warm, genuine thank-you message with subtle upsell for existing customers.

Brand: {{brandName}}
Product They Bought: {{purchasedProduct}}
Complementary Product: {{complementaryProduct}}

Message should:
- Express genuine gratitude
- Make them feel part of a community
- Provide value (tips, how-to)
- Softly introduce complementary product
- Offer exclusive customer benefit

Tone: Warm, appreciative, not salesy. They're already a customer - treat them like family.`,
      variables: ["brandName", "purchasedProduct", "complementaryProduct"],
    },
  ],
};

// Customer Avatar prompt (used across all phases)
export const CUSTOMER_AVATAR_PROMPT: PromptTemplate = {
  id: "customer-avatar",
  type: "customer_avatar",
  name: "Customer Avatar Builder",
  description: "Create a detailed customer persona for targeted messaging",
  promptTemplate: `You are a customer research expert. Create a detailed customer avatar for this brand.

Brand: {{brandName}}
Product: {{productName}}
Description: {{productDescription}}
Website Content: {{websiteContent}}

Create a comprehensive customer avatar including:

1. DEMOGRAPHICS
- Name (fictional)
- Age range
- Gender
- Location
- Occupation
- Income level
- Education

2. PSYCHOGRAPHICS
- Values
- Interests/Hobbies
- Lifestyle
- Personality traits
- Media consumption

3. PAIN POINTS
- Top 5 frustrations related to the product category
- What they've tried before that didn't work
- What's holding them back

4. GOALS & ASPIRATIONS
- What success looks like for them
- Short-term goals
- Long-term aspirations

5. BUYING BEHAVIOR
- Where they shop
- How they research products
- What influences their decisions
- Price sensitivity

6. LANGUAGE & COMMUNICATION
- How they describe their problems
- Words/phrases they use
- Tone that resonates with them

Be specific and vivid. This avatar will guide all creative decisions.`,
  variables: ["brandName", "productName", "productDescription", "websiteContent"],
};

export function getPhaseInfo(phase: FrameworkPhase): PhaseInfo | undefined {
  return FRAMEWORK_PHASES.find(p => p.id === phase);
}

export function getPromptsForPhase(phase: FrameworkPhase): PromptTemplate[] {
  return PROMPT_TEMPLATES[phase] || [];
}
