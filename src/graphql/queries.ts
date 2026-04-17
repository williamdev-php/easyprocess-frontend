import { gql } from "@apollo/client";

export const GET_LISTINGS = gql`
  query GetListings(
    $categoryId: ID
    $type: String
    $search: String
    $offset: Int
    $limit: Int
  ) {
    listings(
      categoryId: $categoryId
      type: $type
      search: $search
      offset: $offset
      limit: $limit
    ) {
      id
      title
      description
      type
      price
      currentBid
      endsAt
      imageUrl
      category {
        id
        name
      }
      seller {
        id
        fullName
        companyName
      }
    }
  }
`;

export const GET_LISTING = gql`
  query GetListing($id: ID!) {
    listing(id: $id) {
      id
      title
      description
      type
      price
      currentBid
      startingBid
      endsAt
      imageUrl
      images
      condition
      location
      category {
        id
        name
      }
      seller {
        id
        fullName
        companyName
        phone
        email
      }
      bids {
        id
        amount
        createdAt
        bidder {
          id
          fullName
        }
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      listingCount
    }
  }
`;

export const MY_LISTINGS = gql`
  query MyListings {
    myListings {
      id
      title
      type
      price
      currentBid
      endsAt
      imageUrl
      status
      createdAt
    }
  }
`;

export const MY_BIDS = gql`
  query MyBids {
    myBids {
      id
      amount
      createdAt
      listing {
        id
        title
        currentBid
        endsAt
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// AutoSite: Leads & Sites
// ---------------------------------------------------------------------------

export const GET_LEADS = gql`
  query GetLeads($filter: LeadFilterInput) {
    leads(filter: $filter) {
      items {
        id
        businessName
        websiteUrl
        email
        phone
        industry
        status
        qualityScore
        errorMessage
        scrapedAt
        createdAt
        inboundEmailsCount
        generatedSite {
          id
          status
          views
          aiModel
          generationCostUsd
        }
      }
      total
      page
      pageSize
    }
  }
`;

export const GET_LEAD = gql`
  query GetLead($id: String!) {
    lead(id: $id) {
      id
      businessName
      websiteUrl
      email
      phone
      address
      industry
      source
      status
      qualityScore
      errorMessage
      scrapedAt
      createdAt
      updatedAt
      scrapedData {
        id
        logoUrl
        colors
        texts
        images
        contactInfo
        metaInfo
        createdAt
      }
      generatedSite {
        id
        siteData
        template
        status
        subdomain
        views
        tokensUsed
        aiModel
        generationCostUsd
        publishedAt
        createdAt
        updatedAt
      }
      outreachEmails {
        id
        toEmail
        subject
        status
        sentAt
        openedAt
        clickedAt
        createdAt
      }
      inboundEmails {
        id
        fromEmail
        fromName
        toEmail
        subject
        bodyText
        bodyHtml
        category
        spamScore
        aiSummary
        isRead
        isArchived
        createdAt
      }
      inboundEmailsCount
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalLeads
      leadsNew
      leadsScraped
      leadsGenerated
      leadsEmailSent
      leadsConverted
      leadsFailed
      totalSites
      totalEmailsSent
      totalViews
      totalAiCostUsd
    }
  }
`;

export const GET_INBOX = gql`
  query GetInbox($filter: InboundEmailFilterInput) {
    inbox(filter: $filter) {
      items {
        id
        fromEmail
        fromName
        toEmail
        subject
        bodyText
        category
        spamScore
        aiSummary
        matchedLeadId
        isRead
        isArchived
        createdAt
      }
      total
      page
      pageSize
    }
  }
`;

export const GET_INBOUND_EMAIL = gql`
  query GetInboundEmail($id: String!) {
    inboundEmail(id: $id) {
      id
      fromEmail
      fromName
      toEmail
      subject
      bodyText
      bodyHtml
      category
      spamScore
      aiSummary
      matchedLeadId
      isRead
      isArchived
      createdAt
    }
  }
`;

export const GET_SITE = gql`
  query GetSite($id: String!) {
    site(id: $id) {
      id
      siteData
      template
      status
      views
    }
  }
`;

// ---------------------------------------------------------------------------
// User Sites (Mina Sidor)
// ---------------------------------------------------------------------------

export const GET_SITE_ANALYTICS = gql`
  query GetSiteAnalytics($siteId: String!, $days: Int) {
    siteAnalytics(siteId: $siteId, days: $days) {
      totalVisitors
      totalSessions
      totalPageViews
      pagesPerSession
      avgLoadTimeMs
      avgFcpMs
      avgLcpMs
      avgCls
      performanceScore
      visitorsChangePct
      pagesPerSessionPrev
      performanceScorePrev
      daily {
        date
        visitors
        pageViews
      }
    }
  }
`;

export const MY_SITES = gql`
  query MySites {
    mySites {
      id
      siteData
      template
      status
      subdomain
      views
      createdAt
      updatedAt
      leadId
      businessName
      websiteUrl
    }
  }
`;

export const MY_SITE = gql`
  query MySite($id: String!) {
    mySite(id: $id) {
      id
      siteData
      template
      status
      subdomain
      views
      createdAt
      updatedAt
      leadId
      businessName
      websiteUrl
    }
  }
`;

// ---------------------------------------------------------------------------
// Domains
// ---------------------------------------------------------------------------

export const MY_DOMAINS = gql`
  query MyDomains {
    myDomains {
      id
      domain
      siteId
      status
      siteSubdomain
      siteBusinessName
      verifiedAt
      createdAt
      updatedAt
    }
  }
`;

export const SUBDOMAIN_INFO = gql`
  query SubdomainInfo($siteId: String!) {
    subdomainInfo(siteId: $siteId) {
      subdomain
      fullUrl
      baseDomain
    }
  }
`;
