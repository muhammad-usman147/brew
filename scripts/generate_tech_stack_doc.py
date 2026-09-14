"""Generate Brew Tech Stack Word document for funding application."""

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from datetime import date


def set_cell_shading(cell, fill_hex):
    shading = OxmlElement("w:shd")
    shading.set(qn("w:fill"), fill_hex)
    cell._tc.get_or_add_tcPr().append(shading)


def add_heading(doc, text, level=1):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.color.rgb = RGBColor(0xF4, 0x77, 0x0B)
    return h


def add_body(doc, text, bold=False):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.size = Pt(11)
    run.font.name = "Calibri"
    run.bold = bold
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15
    return p


def add_bullet(doc, text, level=0):
    p = doc.add_paragraph(text, style="List Bullet")
    p.paragraph_format.left_indent = Inches(0.25 + level * 0.25)
    p.paragraph_format.space_after = Pt(4)
    for run in p.runs:
        run.font.size = Pt(11)
        run.font.name = "Calibri"
    return p


def add_table(doc, headers, rows, col_widths=None):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    hdr_cells = table.rows[0].cells
    for i, header in enumerate(headers):
        hdr_cells[i].text = header
        set_cell_shading(hdr_cells[i], "F4770B")
        for p in hdr_cells[i].paragraphs:
            for run in p.runs:
                run.font.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                run.font.size = Pt(10)
                run.font.name = "Calibri"

    for r_idx, row in enumerate(rows):
        row_cells = table.rows[r_idx + 1].cells
        for c_idx, cell_text in enumerate(row):
            row_cells[c_idx].text = cell_text
            for p in row_cells[c_idx].paragraphs:
                for run in p.runs:
                    run.font.size = Pt(10)
                    run.font.name = "Calibri"
        if r_idx % 2 == 1:
            for cell in row_cells:
                set_cell_shading(cell, "FFF5EB")

    if col_widths:
        for row in table.rows:
            for i, width in enumerate(col_widths):
                row.cells[i].width = Inches(width)

    doc.add_paragraph()
    return table


def build_document():
    doc = Document()

    section = doc.sections[0]
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)

    # Title block
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run("BREW — Technology Stack")
    run.bold = True
    run.font.size = Pt(24)
    run.font.color.rgb = RGBColor(0xF4, 0x77, 0x0B)
    run.font.name = "Calibri"

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = subtitle.add_run("Influencer Marketplace Platform — Development Phase")
    run.font.size = Pt(14)
    run.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
    run.font.name = "Calibri"

    meta = doc.add_paragraph()
    meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = meta.add_run(f"Document Version 1.1  |  {date.today().strftime('%B %d, %Y')}")
    run.font.size = Pt(10)
    run.font.italic = True
    run.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
    run.font.name = "Calibri"

    doc.add_paragraph()

    # Executive Summary
    add_heading(doc, "1. Executive Summary", level=1)
    add_body(
        doc,
        "Brew is a web-based influencer marketplace connecting brands (clients) with content creators "
        "(influencers) for campaign discovery, proposals, professional connections, messaging, and portfolio "
        "management. This document outlines the technology stack selected for the development phase, the "
        "rationale behind each choice, and the planned future stack to be implemented as the platform scales "
        "beyond MVP.",
    )
    add_body(
        doc,
        "The stack prioritises rapid development, low initial infrastructure cost, security, and scalability — "
        "appropriate for a funded development phase where speed-to-market and capital efficiency are critical.",
    )

    # Current Stack
    add_heading(doc, "2. Current Technology Stack (Development Phase)", level=1)
    add_body(
        doc,
        "The following technologies are actively in use during the funded development phase. Each selection "
        "is justified against cost, team productivity, security, and alignment with Brew's product requirements.",
    )

    add_heading(doc, "2.1 Frontend Layer", level=2)
    add_table(
        doc,
        ["Technology", "Version", "Role", "Justification"],
        [
            [
                "Next.js",
                "15.x",
                "Application framework",
                "Industry-standard React framework with built-in routing, API routes, and server-side rendering. "
                "Reduces need for separate frontend/backend teams and accelerates MVP delivery.",
            ],
            [
                "React",
                "18.x",
                "UI component library",
                "Largest developer ecosystem, extensive documentation, and strong hiring pool. Enables reusable "
                "component architecture for dashboards, modals, and campaign cards.",
            ],
            [
                "JavaScript (JSX)",
                "ES2022+",
                "Primary language",
                "Faster iteration during development phase without TypeScript compilation overhead. Path aliases "
                "via jsconfig.json maintain clean imports. TypeScript can be adopted in a later phase.",
            ],
            [
                "Custom CSS + CSS Variables",
                "—",
                "Styling & design system",
                "No dependency on heavy UI frameworks. Brew's distinctive glassmorphism brand identity is "
                "implemented via CSS custom properties, keeping bundle size small and load times fast.",
            ],
            [
                "Google Fonts",
                "Playfair Display, DM Sans",
                "Typography",
                "Free, CDN-hosted fonts that reinforce Brew's premium, warm aesthetic without licensing cost.",
            ],
        ],
        col_widths=[1.1, 0.7, 1.2, 3.5],
    )

    add_heading(doc, "2.2 Backend & API Layer", level=2)
    add_table(
        doc,
        ["Technology", "Version", "Role", "Justification"],
        [
            [
                "Next.js API Routes",
                "15.x",
                "REST API layer",
                "Co-located with frontend in a single codebase. Eliminates separate API server deployment and "
                "reduces DevOps complexity during development.",
            ],
            [
                "Next.js Edge Middleware",
                "15.x",
                "Auth & route protection",
                "Runs at the edge for low-latency auth checks. Enforces role-based access (client vs. influencer) "
                "before pages load, improving security without client-side-only guards.",
            ],
            [
                "Node.js",
                "20 LTS",
                "Server runtime",
                "Standard runtime for Next.js. Wide hosting support (Vercel, AWS, Railway) and mature ecosystem.",
            ],
        ],
        col_widths=[1.1, 0.7, 1.2, 3.5],
    )

    add_heading(doc, "2.3 Database & Authentication", level=2)
    add_table(
        doc,
        ["Technology", "Version", "Role", "Justification"],
        [
            [
                "Supabase",
                "Cloud",
                "Backend-as-a-Service (BaaS)",
                "All-in-one platform providing PostgreSQL database, authentication, and real-time capabilities. "
                "Free tier supports development; paid tiers scale predictably. Avoids building auth and DB "
                "infrastructure from scratch.",
            ],
            [
                "PostgreSQL",
                "15+ (via Supabase)",
                "Primary relational database",
                "ACID-compliant, proven at scale. Supports complex queries for campaigns, proposals, and "
                "connections. Row Level Security (RLS) available for fine-grained access control in production.",
            ],
            [
                "Supabase Auth",
                "—",
                "Identity & access management",
                "Handles email/password registration, session management, and JWT tokens. Role metadata "
                "(client/influencer) stored in user profiles. Eliminates 2–4 weeks of custom auth development.",
            ],
            [
                "@supabase/ssr",
                "0.12.x",
                "Server-side session handling",
                "Cookie-based auth compatible with Next.js App Router and Edge Middleware. Secure session "
                "refresh without exposing tokens to client JavaScript.",
            ],
        ],
        col_widths=[1.1, 0.7, 1.2, 3.5],
    )

    add_heading(doc, "2.4 Core Data Model (Current)", level=2)
    add_body(doc, "The following entities are implemented in PostgreSQL during the development phase:")
    add_bullet(doc, "Clients — brand/company accounts with company profile and industry metadata")
    add_bullet(doc, "Influencers — creator accounts with bio, niche, and public profile identifiers")
    add_bullet(doc, "Campaigns — job listings created by clients (title, budget, category, status)")
    add_bullet(doc, "Proposals — influencer applications to campaigns with rate and cover letter")
    add_bullet(doc, "Connections — approved relationships between clients and influencers")
    add_bullet(doc, "Portfolios — structured JSON data for social platform stats (Instagram, TikTok, YouTube)")
    add_bullet(doc, "Messages — message records linked to connections (schema ready; UI in development)")

    add_heading(doc, "2.5 Development Tools & AI-Assisted Engineering", level=2)
    add_table(
        doc,
        ["Tool", "Category", "Justification"],
        [
            [
                "Git + GitHub",
                "Version control & collaboration",
                "Industry standard for source control, code review, and CI/CD integration. Required for team "
                "collaboration and audit trail during funded development.",
            ],
            [
                "npm",
                "Package management",
                "Native Node.js package manager. Manages Next.js, React, and Supabase dependencies.",
            ],
            [
                "Cursor",
                "AI-native IDE",
                "Accelerates full-stack development with context-aware code generation and refactoring.",
            ],
            [
                "Kiro",
                "AI-powered IDE",
                "Used for architecture planning, scaffolding, and structured feature development.",
            ],
            [
                "GitHub Copilot",
                "AI code completion",
                "Inline suggestions reduce boilerplate writing time by an estimated 30–40% on repetitive tasks.",
            ],
            [
                "Claude (Anthropic)",
                "AI development assistant",
                "Used for complex logic design, debugging, API design, and documentation. Enables a lean "
                "engineering team to deliver features typically requiring 2–3 developers.",
            ],
            [
                "VS Code / Cursor",
                "Development environment",
                "Standard IDE with extensions for JavaScript, Git, and Supabase integration.",
            ],
        ],
        col_widths=[1.2, 1.3, 4.0],
    )
    add_body(
        doc,
        "AI-assisted development is a deliberate cost-efficiency strategy for the funded development phase. "
        "It allows Brew to achieve MVP scope with a smaller engineering team while maintaining code quality "
        "and documentation standards expected by investors.",
        bold=False,
    )

    add_heading(doc, "2.6 Security & Environment Configuration", level=2)
    add_bullet(doc, "Environment variables (.env.local) for Supabase URL, anon key, and service role key")
    add_bullet(doc, "Service role key restricted to server-side API routes only — never exposed to browser")
    add_bullet(doc, "Middleware-enforced authentication on all /client/* and /influencer/* routes")
    add_bullet(doc, "Role-based route isolation — clients cannot access influencer dashboards and vice versa")
    add_bullet(doc, ".gitignore configured to prevent credential commits")

    # Architecture
    add_heading(doc, "3. System Architecture (Current)", level=1)
    add_body(doc, "Brew follows a modern three-tier architecture optimised for a solo or small-team development phase:")
    add_bullet(doc, "Presentation Tier — React 18 components rendered via Next.js App Router (client and server components)")
    add_bullet(doc, "Application Tier — Next.js API Routes handle business logic, validation, and Supabase queries")
    add_bullet(doc, "Data Tier — Supabase PostgreSQL with Supabase Auth for identity management")
    add_bullet(doc, "Edge Layer — Next.js Middleware intercepts requests for session validation and role routing")

    add_body(
        doc,
        "This monolithic Next.js + Supabase architecture is intentionally chosen for the development phase. "
        "It avoids premature microservices complexity while providing a clear migration path to dedicated "
        "services as user volume grows.",
    )

    # Future Stack
    add_heading(doc, "4. Planned Future Technology Stack", level=1)
    add_body(
        doc,
        "The following technologies are planned for implementation after the core development phase, "
        "as Brew moves from MVP to production launch and scale. Each is selected to integrate natively "
        "with the existing Next.js + Supabase foundation, minimising rework.",
    )

    add_heading(doc, "4.1 Hosting & Deployment", level=2)
    add_body(
        doc,
        "Brew is a Next.js full-stack application backed by Supabase Cloud. Deployment options have been "
        "evaluated against Brew's requirements: SSR/API route support, Git-based CI/CD, SSL, reasonable cost "
        "at early scale, and compatibility with real-time features. Three platforms are under consideration:",
    )
    add_table(
        doc,
        ["Platform", "Suitability", "Strengths", "Limitations", "Recommendation"],
        [
            [
                "Vercel",
                "Excellent",
                "Built by the Next.js team. Zero-config deploys, automatic preview URLs per branch, global "
                "Edge CDN, and native support for Next.js App Router, API Routes, and Middleware. Free Hobby "
                "tier suitable for early launch.",
                "Serverless model limits long-running WebSocket connections unless using external service. "
                "Pro plan ($20/mo) needed for commercial use.",
                "Primary choice for launch",
            ],
            [
                "Railway",
                "Very Good",
                "Flexible PaaS supporting Docker containers and Node.js services. Can host Next.js as a "
                "persistent Node process — useful if a custom WebSocket server is ever required (~1% scenario). "
                "Simple GitHub deploy, usage-based pricing (~$5–20/mo at early scale).",
                "No built-in global CDN — slower static asset delivery vs. Vercel unless paired with Cloudflare. "
                "Requires slightly more configuration than Vercel.",
                "Strong alternative / fallback",
            ],
            [
                "Hostinger VPS",
                "Moderate",
                "Low-cost VPS plans ($4–8/mo) attractive for budget-conscious early deployment. Full root "
                "access allows custom Node.js, Nginx reverse proxy, and PM2 process management.",
                "No native Next.js support — manual setup required (Node.js, Nginx, SSL via Certbot). No "
                "automatic preview deployments. Higher DevOps overhead for a small team. Not recommended for "
                "serverless/edge features.",
                "Budget option only if needed",
            ],
        ],
        col_widths=[0.9, 0.7, 1.8, 1.8, 1.3],
    )
    add_body(
        doc,
        "Recommended deployment architecture: Vercel (application hosting) + Supabase Cloud (database, auth, "
        "storage, realtime). Railway remains a viable alternative if Brew requires a persistent server process "
        "(e.g. custom WebSocket layer). Hostinger VPS is reserved as a cost fallback only — it adds operational "
        "overhead disproportionate to savings at Brew's current scale.",
    )
    add_table(
        doc,
        ["Technology", "Purpose", "Justification", "Expected Phase"],
        [
            [
                "Vercel (recommended)",
                "Application hosting & CDN",
                "Best-fit for Next.js. GitHub push triggers automatic build and deploy. Preview URLs for "
                "stakeholder review during funded development.",
                "Launch",
            ],
            [
                "Railway (alternative)",
                "Container-based hosting",
                "Fallback if persistent server processes or custom WebSocket infrastructure is needed later.",
                "Contingency",
            ],
            [
                "Supabase Cloud (Pro)",
                "Managed database, auth & storage",
                "Hosted separately from application — works with any deployment platform. Daily backups, "
                "connection pooling, and increased limits on Pro tier ($25/mo).",
                "Launch",
            ],
            [
                "Cloudflare (optional)",
                "DNS, CDN & DDoS protection",
                "Free tier adds DNS management and caching layer in front of Railway or Hostinger if used.",
                "Post-MVP",
            ],
            [
                "GitHub Actions",
                "CI/CD pipeline",
                "Automated lint and build checks on every pull request before deploy.",
                "Launch",
            ],
        ],
        col_widths=[1.0, 1.2, 3.0, 0.8],
    )

    add_heading(doc, "4.2 Real-Time Communication & Messaging", level=2)
    add_body(
        doc,
        "Direct messaging between clients and influencers is a core Brew feature — used for campaign "
        "negotiation, brief sharing, and ongoing collaboration. The messages table is already defined in "
        "the data model and linked to approved connections. The platform requires instant message delivery, "
        "read receipts, and optional typing indicators.",
    )
    add_body(
        doc,
        "Primary approach (99% planned): Supabase Realtime",
        bold=True,
    )
    add_body(
        doc,
        "Supabase Realtime uses WebSocket connections under the hood but is fully managed — no separate "
        "WebSocket server to build, deploy, or maintain. It listens to PostgreSQL changes and pushes new "
        "message rows to subscribed clients in real time. This is the default and strongly preferred path "
        "because it integrates with Brew's existing Supabase auth, database, and RLS policies.",
    )
    add_table(
        doc,
        ["Technology", "Purpose", "Justification", "Expected Phase"],
        [
            [
                "Supabase Realtime (WebSocket via managed service)",
                "Live message delivery",
                "Built into existing Supabase subscription. Uses PostgreSQL CDC to push new messages instantly. "
                "WebSocket transport handled by Supabase infrastructure — no custom server required.",
                "Post-MVP (Month 2–3)",
            ],
            [
                "Supabase Realtime Channels",
                "Typing indicators & online presence",
                "Broadcast channels scoped per connection ID. Enables 'user is typing' and online/offline "
                "status without additional infrastructure.",
                "Post-MVP (Month 3)",
            ],
            [
                "Supabase Storage",
                "Media attachments in chat",
                "Campaign briefs, images, and contracts uploaded to Supabase buckets with signed URLs. "
                "Access controlled via existing auth tokens.",
                "Post-MVP (Month 3–4)",
            ],
            [
                "Web Push Notifications",
                "Browser alerts for new messages",
                "Service worker + Web Push API for offline notifications when user is not on the platform.",
                "Scale (Month 6+)",
            ],
        ],
        col_widths=[1.0, 1.2, 3.0, 0.8],
    )
    add_body(
        doc,
        "Contingency approach (~1% — only if Supabase Realtime proves insufficient): Custom WebSocket Server",
        bold=True,
    )
    add_body(
        doc,
        "In the unlikely event that Supabase Realtime cannot meet specific requirements (e.g. complex "
        "multi-room chat logic, custom message routing, or very high concurrent connection counts), Brew "
        "may deploy a dedicated WebSocket layer. This is a low-probability fallback, not the planned path.",
    )
    add_table(
        doc,
        ["Technology", "Purpose", "Justification", "Likelihood"],
        [
            [
                "Socket.io",
                "Custom WebSocket server",
                "Node.js WebSocket library with room-based messaging, reconnection handling, and fallback "
                "to long-polling. Would run as a separate service on Railway alongside the Next.js app.",
                "~1% (contingency only)",
            ],
            [
                "Railway",
                "Host for WebSocket service",
                "Persistent Node.js process required for Socket.io — not compatible with Vercel serverless. "
                "Railway supports long-running WebSocket connections natively.",
                "Contingency",
            ],
            [
                "Redis (Upstash)",
                "Pub/sub for multi-instance scaling",
                "If WebSocket server is scaled to multiple instances, Redis pub/sub synchronises messages "
                "across nodes. Upstash offers serverless Redis with free tier.",
                "Contingency (scale)",
            ],
        ],
        col_widths=[1.0, 1.2, 3.0, 0.8],
    )
    add_body(
        doc,
        "Decision rationale: For a marketplace messaging use case (1-to-1 chat between connected parties, "
        "not a public chat room), Supabase Realtime is sufficient and avoids the operational cost of running "
        "a separate WebSocket server. Custom WebSocket infrastructure would only be justified at significant "
        "scale or if platform-specific real-time features exceed Supabase's capabilities.",
    )
    add_heading(doc, "4.3 Social Media Account Integration & Influencer Statistics", level=2)
    add_body(
        doc,
        "A key differentiator for Brew is allowing influencers to connect and showcase their social media "
        "presence — Instagram, TikTok, YouTube, and Twitter/X — with verified statistics visible to clients "
        "during discovery and campaign matching. The portfolio module already supports platform types, handles, "
        "follower counts, and engagement rates stored as structured JSON in Supabase. The planned integration "
        "stack moves from manual entry to verified, auto-synced data.",
    )
    add_body(
        doc,
        "Phase 1 — Manual portfolio (current development phase): Influencers enter handle, follower count, "
        "and engagement rate manually. Clients view aggregated stats on influencer cards and portfolio pages. "
        "This is sufficient for MVP validation without API costs or OAuth complexity.",
    )
    add_body(
        doc,
        "Phase 2 — Verified account linking (post-MVP): OAuth-based connection to social platforms for "
        "automatic stat sync and profile verification.",
        bold=True,
    )
    add_table(
        doc,
        ["Platform API", "Data Retrieved", "Justification", "Expected Phase"],
        [
            [
                "Instagram Graph API (Meta)",
                "Followers, reach, engagement rate, media count",
                "Official Meta API for Business/Creator accounts. Provides verified follower counts clients "
                "can trust. Requires Meta App Review for production access.",
                "Post-MVP (Month 3–4)",
            ],
            [
                "TikTok for Developers API",
                "Followers, video views, engagement metrics",
                "Official TikTok API for creator profile data. Essential given TikTok's dominance in influencer "
                "marketing. OAuth login flow for account verification.",
                "Post-MVP (Month 4–5)",
            ],
            [
                "YouTube Data API v3",
                "Subscribers, total views, video count",
                "Google's official API. Free quota of 10,000 units/day sufficient for early scale. Maps to "
                "Brew's existing YouTube portfolio fields (subscriber_count).",
                "Post-MVP (Month 3–4)",
            ],
            [
                "X (Twitter) API v2",
                "Followers, tweet engagement, profile verification",
                "Official X API for follower count and recent tweet performance. Paid tier may be required "
                "for production-scale polling.",
                "Post-MVP (Month 5–6)",
            ],
        ],
        col_widths=[1.0, 1.2, 3.0, 0.8],
    )
    add_body(
        doc,
        "Phase 3 — Third-party influencer analytics API (alternative or supplement):",
        bold=True,
    )
    add_body(
        doc,
        "Direct platform APIs require separate OAuth flows, rate limits, and app review processes for each "
        "platform. Third-party aggregator APIs provide a unified interface — one integration covering all "
        "platforms — which may be more cost-effective as Brew scales.",
    )
    add_table(
        doc,
        ["Third-Party Service", "Purpose", "Justification", "Expected Phase"],
        [
            [
                "Phyllo API",
                "Unified social account linking",
                "Single API covering Instagram, TikTok, YouTube, LinkedIn, and more. Handles OAuth, token "
                "refresh, and data normalisation. Used by influencer marketing platforms at scale. Pay-per-connected-account.",
                "Scale (Month 6+)",
            ],
            [
                "Modash API",
                "Influencer discovery & analytics",
                "Pre-indexed influencer database with audience demographics, fake follower detection, and "
                "engagement benchmarks. Useful for client-side influencer search beyond Brew's own user base.",
                "Scale (Month 9+)",
            ],
            [
                "HypeAuditor / Social Blade API",
                "Engagement quality scoring",
                "Audience authenticity and engagement quality metrics. Helps clients assess influencer value "
                "beyond raw follower count.",
                "Scale (Month 9+)",
            ],
        ],
        col_widths=[1.0, 1.2, 3.0, 0.8],
    )
    add_body(
        doc,
        "Integration architecture: Social account tokens stored encrypted in Supabase. A scheduled Next.js "
        "API route (or Supabase Edge Function) refreshes statistics nightly and writes updated follower/engagement "
        "data to the portfolios table. Clients always see current stats on influencer cards without manual updates.",
    )

    add_heading(doc, "4.4 AI Chatbot & Third-Party API Integrations", level=2)
    add_body(
        doc,
        "As Brew scales, intelligent assistance and third-party integrations will reduce support burden, "
        "improve user onboarding, and automate repetitive marketplace tasks. These are planned post-MVP "
        "enhancements aligned with Brew's two-sided marketplace model.",
    )
    add_table(
        doc,
        ["Integration", "Purpose", "Justification", "Expected Phase"],
        [
            [
                "Claude API / OpenAI API",
                "In-platform AI assistant",
                "Help influencers write proposal cover letters, help clients draft campaign briefs, and "
                "suggest campaign requirements based on niche and budget. Leverages AI tools already used "
                "in development — natural extension to product features.",
                "Post-MVP (Month 4–6)",
            ],
            [
                "Claude API / OpenAI API",
                "Campaign–influencer matching",
                "Analyse influencer portfolio data (niche, engagement, past campaigns) against campaign "
                "requirements to surface best-fit creators. Reduces client search time — key value proposition.",
                "Scale (Month 6–9)",
            ],
            [
                "Crisp / Tidio / Intercom",
                "Customer support chatbot",
                "Embedded support widget for onboarding help, FAQ, and escalation to human support. Handles "
                "common queries (how to create a campaign, how to submit a proposal) without engineering effort.",
                "Launch / Post-MVP",
            ],
            [
                "Zapier / Make (Integromat)",
                "Workflow automation",
                "Connect Brew events (new proposal, connection accepted) to external tools — Slack notifications, "
                "Google Sheets reporting, CRM updates — without custom integration code.",
                "Post-MVP (Month 3+)",
            ],
            [
                "Google OAuth / LinkedIn OAuth",
                "Social login (signup)",
                "Social login buttons are already present in Brew's auth UI design. Supabase Auth supports "
                "Google and LinkedIn OAuth providers natively — reduces signup friction for both user types.",
                "Launch",
            ],
            [
                "Calendly API (optional)",
                "Campaign kickoff scheduling",
                "Allow clients and influencers to schedule intro calls directly from a connection page. "
                "Reduces back-and-forth messaging for meeting coordination.",
                "Scale (Month 6+)",
            ],
        ],
        col_widths=[1.0, 1.2, 3.0, 0.8],
    )
    add_body(
        doc,
        "Chatbot strategy: A lightweight rule-based chatbot (Crisp/Tidio free tier) handles support at launch. "
        "An AI-powered in-platform assistant (Claude/OpenAI API) is added post-MVP for context-aware help using "
        "Brew's own data — campaign details, proposal status, connection history — providing significantly "
        "more value than a generic FAQ bot.",
    )

    add_heading(doc, "4.5 Payments & Monetisation", level=2)
    add_body(
        doc,
        "Brew's business model includes subscription tiers (as shown on the landing page) and campaign "
        "transaction fees. The following payment stack is planned:",
    )
    add_table(
        doc,
        ["Technology", "Purpose", "Justification", "Expected Phase"],
        [
            [
                "Stripe",
                "Payment processing",
                "Industry-standard for SaaS subscriptions and marketplace payments. Supports recurring billing "
                "(client subscription plans), one-off campaign payments, and Stripe Connect for influencer "
                "payouts. PCI compliance handled by Stripe — Brew never stores card data.",
                "Launch (Month 1–2 post-MVP)",
            ],
            [
                "Stripe Billing",
                "Subscription management",
                "Manages Brew's three pricing tiers (Starter, Professional, Enterprise). Handles invoicing, "
                "failed payment retry, and customer portal for self-service plan changes.",
                "Launch",
            ],
            [
                "Stripe Connect",
                "Marketplace payouts to influencers",
                "Enables Brew to collect campaign payments from clients and disburse funds to influencers "
                "after campaign completion. Required for a true marketplace model with escrow-style flows.",
                "Scale (Month 4–6)",
            ],
            [
                "Stripe Webhooks + Next.js API Routes",
                "Payment event handling",
                "Webhook endpoints in existing /api/* structure to update subscription status, unlock "
                "features, and trigger notifications on payment events.",
                "Launch",
            ],
        ],
        col_widths=[1.0, 1.2, 3.0, 0.8],
    )

    add_heading(doc, "4.6 Email & Notifications", level=2)
    add_table(
        doc,
        ["Technology", "Purpose", "Justification", "Expected Phase"],
        [
            [
                "Supabase Auth Emails",
                "Account verification & password reset",
                "Included in Supabase — handles signup confirmation and password recovery at no extra cost.",
                "Launch",
            ],
            [
                "Resend",
                "Transactional email (campaign alerts, proposals)",
                "Modern email API with React Email templates. Better deliverability and analytics than "
                "Supabase's basic SMTP. Free tier: 3,000 emails/month.",
                "Post-MVP (Month 2)",
            ],
            [
                "React Email",
                "Email template system",
                "Write email templates in React/JSX — consistent with existing codebase. Used with Resend "
                "for proposal notifications, connection requests, and campaign updates.",
                "Post-MVP (Month 2)",
            ],
        ],
        col_widths=[1.0, 1.2, 3.0, 0.8],
    )

    add_heading(doc, "4.7 Analytics, Monitoring & Quality", level=2)
    add_table(
        doc,
        ["Technology", "Purpose", "Justification", "Expected Phase"],
        [
            [
                "Vercel Analytics",
                "Web performance & traffic",
                "Built into Vercel hosting. Core Web Vitals, page views, and geographic traffic data.",
                "Launch",
            ],
            [
                "PostHog",
                "Product analytics & funnels",
                "Open-source alternative to Mixpanel. Tracks user journeys (signup → campaign creation → "
                "proposal submission). Self-hostable for GDPR compliance.",
                "Post-MVP (Month 2–3)",
            ],
            [
                "Sentry",
                "Error monitoring",
                "Captures frontend and API errors in production. Essential for maintaining uptime during "
                "early user growth.",
                "Launch",
            ],
            [
                "GitHub Actions",
                "CI/CD pipeline",
                "Automated lint, build, and deploy checks on every pull request. Prevents broken code "
                "reaching production.",
                "Launch",
            ],
        ],
        col_widths=[1.0, 1.2, 3.0, 0.8],
    )

    add_heading(doc, "4.8 Future Platform Extensions", level=2)
    add_table(
        doc,
        ["Technology", "Purpose", "Justification", "Expected Phase"],
        [
            [
                "TypeScript",
                "Type safety",
                "Migrate JavaScript codebase to TypeScript as team grows. Reduces runtime bugs in payment "
                "and messaging flows.",
                "Scale (Month 6+)",
            ],
            [
                "Supabase Row Level Security (RLS)",
                "Database-level access control",
                "Enforce that clients can only read their own campaigns and influencers their own proposals "
                "at the database layer — defence in depth beyond API checks.",
                "Launch",
            ],
            [
                "React Native / Expo",
                "Mobile apps (iOS & Android)",
                "Reuse business logic and Supabase client for native mobile experience. Expo accelerates "
                "cross-platform delivery.",
                "Scale (Month 9–12)",
            ],
            [
                "OpenAI / Claude API",
                "AI campaign matching & in-app assistant",
                "See Section 4.4 for full chatbot and matching strategy.",
                "Scale (Month 6+)",
            ],
        ],
        col_widths=[1.0, 1.2, 3.0, 0.8],
    )

    # Cost efficiency
    add_heading(doc, "5. Cost Efficiency Rationale", level=1)
    add_body(
        doc,
        "The selected stack is deliberately lean for the funded development phase. Estimated monthly "
        "infrastructure cost at launch:",
    )
    add_table(
        doc,
        ["Service", "Tier", "Estimated Monthly Cost"],
        [
            ["Vercel (recommended) / Railway (alt.)", "Hobby / Starter", "$0 – $20"],
            ["Supabase", "Free / Pro", "$0 – $25"],
            ["Stripe", "Pay-as-you-go", "2.9% + $0.30 per transaction"],
            ["Resend", "Free tier", "$0 (up to 3,000 emails)"],
            ["Crisp / Tidio (support chatbot)", "Free tier", "$0"],
            ["Sentry", "Developer tier", "$0 – $26"],
            ["Social platform APIs", "Free tiers / quotas", "$0 at early scale"],
            ["Phyllo / Modash (analytics)", "Pay-per-use", "Deferred to scale phase"],
            ["Domain & SSL", "—", "~$12/year"],
            ["AI Dev Tools", "Copilot, Claude, Kiro, Cursor", "Development cost only"],
        ],
        col_widths=[1.5, 1.5, 3.5],
    )
    add_body(
        doc,
        "Total estimated production infrastructure cost at early launch: under $75/month before transaction "
        "fees and optional third-party API usage. Social media API integrations use free platform quotas "
        "initially; aggregator APIs (Phyllo, Modash) are deferred until user volume justifies the cost. "
        "This allows maximum capital allocation to product development during the funded phase.",
    )

    # Timeline
    add_heading(doc, "6. Development Phase Roadmap", level=1)
    add_table(
        doc,
        ["Phase", "Focus", "Key Technologies"],
        [
            [
                "Phase 1 — Funded Development (Current)",
                "Core platform: auth, dashboards, campaigns, proposals, connections, manual portfolios",
                "Next.js, React, Supabase, AI dev tools (Kiro, Copilot, Claude, Cursor)",
            ],
            [
                "Phase 2 — Launch",
                "Production deployment, payments, email, support chatbot, social login",
                "Vercel or Railway, Stripe, Resend, Crisp/Tidio, Google OAuth, Sentry, Supabase RLS",
            ],
            [
                "Phase 3 — Post-MVP Growth",
                "Real-time messaging, social account linking, media uploads, AI assistant",
                "Supabase Realtime, Instagram/TikTok/YouTube APIs, Supabase Storage, Claude/OpenAI API",
            ],
            [
                "Phase 4 — Scale",
                "Verified analytics, marketplace payouts, mobile apps, advanced matching",
                "Phyllo/Modash API, Stripe Connect, React Native/Expo, AI campaign matching",
            ],
        ],
        col_widths=[1.5, 2.5, 2.5],
    )

    # Conclusion
    add_heading(doc, "7. Conclusion", level=1)
    add_body(
        doc,
        "Brew's technology stack is built on proven, modern foundations — Next.js, React, and Supabase — "
        "chosen specifically for rapid MVP delivery during the funded development phase. AI-assisted "
        "development tools (Kiro, GitHub Copilot, Claude, Cursor) further reduce engineering cost and "
        "timeline without compromising quality.",
    )
    add_body(
        doc,
        "The planned future stack integrates natively with the current architecture: Supabase Realtime for "
        "messaging (with Socket.io on Railway as a ~1% contingency), official social platform APIs progressing "
        "to unified analytics via Phyllo, AI assistance via Claude/OpenAI, Stripe for payments, and Vercel or "
        "Railway for deployment. No costly re-platforming is required as Brew scales from development to "
        "production launch and beyond.",
    )

    footer = doc.add_paragraph()
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = footer.add_run("— End of Document —")
    run.font.italic = True
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(0x99, 0x99, 0x99)

    return doc


if __name__ == "__main__":
    output_path = "docs/Brew_Technology_Stack_v1.1.docx"
    import os
    os.makedirs("docs", exist_ok=True)
    doc = build_document()
    doc.save(output_path)
    print(f"Document saved to: {output_path}")
