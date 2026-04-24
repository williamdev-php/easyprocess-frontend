import { gql } from "@apollo/client";

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
        industryId
        industryName
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
      industryId
      industryName
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
        videoUrl
        publishedAt
        createdAt
        updatedAt
      }
      outreachEmails {
        id
        toEmail
        subject
        status
        sentVia
        sentAt
        openedAt
        clickedAt
        repliedAt
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
      outreachSent30d
      outreachOpenRate
      outreachReplyRate
      outreachConversions30d
    }
  }
`;

export const GET_OUTREACH_STATS = gql`
  query GetOutreachStats {
    outreachStats {
      emailsSent30d
      openRate
      replyRate
      clickRate
      bounceRate
      conversions30d
      dailySendCount
      dailySendLimit
      warmupStatus
      warmupDay
      warmupDaysTarget
    }
  }
`;

export const GET_SMARTLEAD_MESSAGES = gql`
  query GetSmartleadMessages($leadId: String!) {
    smartleadMessages(leadId: $leadId) {
      id
      type
      subject
      body
      fromEmail
      toEmail
      timestamp
      status
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
      vercelVerification
    }
  }
`;

export const MY_GSC_CONNECTION = gql`
  query MyGscConnection {
    myGscConnection {
      connected
      googleEmail
      indexedDomain
      indexedAt
      status
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

export const SEARCH_DOMAIN = gql`
  query SearchDomain($domain: String!) {
    searchDomain(domain: $domain) {
      available
      domain
      priceSek
      priceSekDisplay
      priceUsd
      period
    }
  }
`;

export const MY_PURCHASED_DOMAINS = gql`
  query MyPurchasedDomains {
    myPurchasedDomains {
      id
      domain
      priceSek
      status
      periodYears
      autoRenew
      isLocked
      expiresAt
      purchasedAt
      createdAt
    }
  }
`;

// ---------------------------------------------------------------------------
// Version History
// ---------------------------------------------------------------------------

export const SITE_VERSIONS = gql`
  query SiteVersions($siteId: String!) {
    siteVersions(siteId: $siteId) {
      id
      siteId
      versionNumber
      siteData
      label
      createdAt
    }
  }
`;

// ---------------------------------------------------------------------------
// Billing & Subscription
// ---------------------------------------------------------------------------

export const MY_SUBSCRIPTION = gql`
  query MySubscription {
    mySubscription {
      id
      status
      currentPeriodStart
      currentPeriodEnd
      cancelAtPeriodEnd
      trialStart
      trialEnd
      createdAt
    }
  }
`;

export const MY_PAYMENTS = gql`
  query MyPayments($limit: Int, $offset: Int) {
    myPayments(limit: $limit, offset: $offset) {
      items {
        id
        amountSek
        currency
        status
        invoiceUrl
        createdAt
      }
      total
    }
  }
`;

export const MY_BILLING_DETAILS = gql`
  query MyBillingDetails {
    myBillingDetails {
      id
      billingName
      billingCompany
      billingOrgNumber
      billingVatNumber
      billingEmail
      billingPhone
      addressLine1
      addressLine2
      zip
      city
      country
    }
  }
`;

export const MY_PAYMENT_METHODS = gql`
  query MyPaymentMethods {
    myPaymentMethods {
      id
      brand
      last4
      expMonth
      expYear
    }
  }
`;

export const AVAILABLE_PLANS = gql`
  query AvailablePlans {
    availablePlans {
      key
      name
      priceSek
      trialDays
      features
    }
  }
`;

// ---------------------------------------------------------------------------
// Admin: Users (Super Admin)
// ---------------------------------------------------------------------------

export const GET_ALL_USERS = gql`
  query AllUsers($filter: AdminUserFilterInput) {
    allUsers(filter: $filter) {
      items {
        id
        email
        fullName
        companyName
        phone
        country
        avatarUrl
        role
        isSuperuser
        isActive
        isVerified
        createdAt
        lastLoginAt
        sitesCount
        hasSubscription
      }
      total
      page
      pageSize
    }
  }
`;

export const GET_ADMIN_USER_STATS = gql`
  query AdminUserStats {
    adminUserStats {
      totalUsers
      activeUsers
      verifiedUsers
      usersWithSubscription
      newUsers30d
    }
  }
`;

export const GET_ADMIN_USER = gql`
  query AdminUser($id: String!) {
    adminUser(id: $id) {
      id
      email
      fullName
      companyName
      orgNumber
      phone
      country
      avatarUrl
      locale
      role
      isSuperuser
      isActive
      isVerified
      twoFactorEnabled
      failedLoginAttempts
      lockedUntil
      lastLoginAt
      passwordChangedAt
      createdAt
      updatedAt
      billingStreet
      billingCity
      billingZip
      billingCountry
      stripeCustomerId
      sitesCount
      hasSubscription
      sessions {
        id
        ipAddress
        userAgent
        createdAt
        expiresAt
      }
      auditLog {
        id
        eventType
        ipAddress
        userAgent
        createdAt
      }
      recentSites {
        id
        businessName
        subdomain
        status
        views
        createdAt
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Support Tickets
// ---------------------------------------------------------------------------

export const GET_MY_SUPPORT_TICKETS = gql`
  query MySupportTickets {
    mySupportTickets {
      id
      subject
      message
      status
      priority
      adminReply
      repliedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_NOTIFICATIONS = gql`
  query MyNotifications {
    myNotifications {
      items {
        id
        type
        title
        body
        link
        isRead
        createdAt
      }
      unreadCount
    }
  }
`;

export const GET_SUPPORT_TICKET = gql`
  query SupportTicket($id: String!) {
    supportTicket(id: $id) {
      id
      userId
      userEmail
      userName
      subject
      message
      status
      priority
      isRead
      isArchived
      adminReply
      repliedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_SUPPORT_TICKETS = gql`
  query SupportTickets($filter: SupportTicketFilterInput) {
    supportTickets(filter: $filter) {
      items {
        id
        userId
        userEmail
        userName
        subject
        message
        status
        priority
        isRead
        isArchived
        adminReply
        repliedAt
        createdAt
        updatedAt
      }
      total
      page
      pageSize
    }
  }
`;

// ---------------------------------------------------------------------------
// Admin: All Sites (Super Admin)
// ---------------------------------------------------------------------------

export const GET_ALL_SITES = gql`
  query AllSites($filter: AdminSiteFilterInput) {
    allSites(filter: $filter) {
      items {
        id
        template
        status
        subdomain
        customDomain
        views
        generationCostUsd
        publishedAt
        createdAt
        updatedAt
        businessName
        websiteUrl
        ownerId
        ownerEmail
        ownerName
        isLeadSite
      }
      total
      page
      pageSize
    }
  }
`;

// ---------------------------------------------------------------------------
// Analytics (Super Admin)
// ---------------------------------------------------------------------------

export const GET_ANALYTICS_OVERVIEW = gql`
  query AnalyticsOverview($startDate: String!, $endDate: String!) {
    analyticsOverview(startDate: $startDate, endDate: $endDate) {
      uniqueVisitors
      totalSignups
      totalTrials
      totalSubscriptions
      trialStartRate
      trialConversionRate
      totalRevenueSek
      avgSessionDurationSeconds
    }
  }
`;

export const GET_FUNNEL_STATS = gql`
  query FunnelStats($startDate: String!, $endDate: String!, $utmSource: String, $utmCampaign: String) {
    funnelStats(startDate: $startDate, endDate: $endDate, utmSource: $utmSource, utmCampaign: $utmCampaign) {
      steps {
        name
        count
        conversionRate
      }
      startDate
      endDate
    }
  }
`;

export const GET_VISITOR_STATS = gql`
  query VisitorStats($startDate: String!, $endDate: String!) {
    visitorStats(startDate: $startDate, endDate: $endDate) {
      points {
        date
        count
      }
      total
    }
  }
`;

export const GET_UTM_STATS = gql`
  query UtmStats($startDate: String!, $endDate: String!) {
    utmStats(startDate: $startDate, endDate: $endDate) {
      source
      medium
      campaign
      count
    }
  }
`;

export const GET_TOP_PAGES = gql`
  query TopPages($startDate: String!, $endDate: String!, $limit: Int) {
    topPages(startDate: $startDate, endDate: $endDate, limit: $limit) {
      path
      count
    }
  }
`;

// ---------------------------------------------------------------------------
// Admin: Subscriptions (Super Admin)
// ---------------------------------------------------------------------------

export const GET_ADMIN_SUBSCRIPTIONS = gql`
  query AdminSubscriptions($filter: AdminSubscriptionFilterInput) {
    adminSubscriptions(filter: $filter) {
      items {
        id
        userId
        userEmail
        userName
        companyName
        stripeSubscriptionId
        stripeCustomerId
        status
        currentPeriodStart
        currentPeriodEnd
        cancelAtPeriodEnd
        trialStart
        trialEnd
        createdAt
        updatedAt
        paymentsCount
        totalPaidSek
      }
      total
      page
      pageSize
    }
  }
`;

export const GET_ADMIN_SUBSCRIPTION_STATS = gql`
  query AdminSubscriptionStats {
    adminSubscriptionStats {
      totalSubscriptions
      active
      trialing
      pastDue
      canceled
      incomplete
    }
  }
`;

export const GET_ADMIN_SUBSCRIPTION = gql`
  query AdminSubscription($id: String!) {
    adminSubscription(id: $id) {
      id
      userId
      userEmail
      userName
      companyName
      stripeSubscriptionId
      stripeCustomerId
      status
      currentPeriodStart
      currentPeriodEnd
      cancelAtPeriodEnd
      trialStart
      trialEnd
      createdAt
      updatedAt
      paymentsCount
      totalPaidSek
    }
  }
`;

// ---------------------------------------------------------------------------
// Revenue (Super Admin)
// ---------------------------------------------------------------------------

export const GET_REVENUE_STATS = gql`
  query RevenueStats($limit: Int) {
    revenueStats(limit: $limit) {
      mrrSek
      totalRevenueSek
      activeSubscriptions
      trialingSubscriptions
      chargesCount
      refundedSek
      recentCharges {
        id
        amountSek
        currency
        status
        description
        customerEmail
        customerName
        cardBrand
        cardLast4
        createdAt
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Platform Settings (Super Admin)
// ---------------------------------------------------------------------------

export const GET_PLATFORM_SETTINGS = gql`
  query PlatformSettings {
    platformSettings {
      key
      value
    }
  }
`;

// ---------------------------------------------------------------------------
// Industries
// ---------------------------------------------------------------------------

export const GET_INDUSTRIES = gql`
  query GetIndustries {
    industries {
      id
      name
      slug
      description
      createdAt
      updatedAt
    }
  }
`;

// ---------------------------------------------------------------------------
// Apps
// ---------------------------------------------------------------------------

export const GET_APPS = gql`
  query GetApps {
    apps {
      id
      slug
      name
      description
      iconUrl
      version
      scopes
      sidebarLinks
      requiresPayments
    }
  }
`;

export const GET_SITE_APPS = gql`
  query GetSiteApps($siteId: String!) {
    siteApps(siteId: $siteId) {
      id
      appId
      appSlug
      appName
      siteId
      isActive
      settings
      sidebarLinks
      requiresPayments
      installedAt
    }
  }
`;

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export const GET_BLOG_POSTS = gql`
  query GetBlogPosts($siteId: String!, $filter: BlogPostFilterInput) {
    blogPosts(siteId: $siteId, filter: $filter) {
      items {
        id
        siteId
        title
        slug
        excerpt
        featuredImage
        authorName
        categoryId
        categoryName
        status
        publishedAt
        createdAt
        updatedAt
      }
      total
      page
      pageSize
    }
  }
`;

export const GET_BLOG_POST = gql`
  query GetBlogPost($siteId: String!, $postId: String!) {
    blogPost(siteId: $siteId, postId: $postId) {
      id
      siteId
      title
      slug
      excerpt
      content
      featuredImage
      authorName
      authorId
      categoryId
      categoryName
      status
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_BLOG_CATEGORIES = gql`
  query GetBlogCategories($siteId: String!) {
    blogCategories(siteId: $siteId) {
      id
      siteId
      name
      slug
      description
      sortOrder
      postCount
      createdAt
      updatedAt
    }
  }
`;

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export const GET_CHAT_CONVERSATIONS = gql`
  query GetChatConversations($siteId: String!, $filter: ChatConversationFilterInput) {
    chatConversations(siteId: $siteId, filter: $filter) {
      items {
        id
        siteId
        visitorEmail
        visitorName
        status
        subject
        lastMessageAt
        messageCount
        lastMessagePreview
        createdAt
        updatedAt
      }
      total
      page
      pageSize
    }
  }
`;

export const GET_CHAT_CONVERSATION = gql`
  query GetChatConversation($siteId: String!, $conversationId: String!) {
    chatConversation(siteId: $siteId, conversationId: $conversationId) {
      conversation {
        id
        siteId
        visitorEmail
        visitorName
        status
        subject
        lastMessageAt
        messageCount
        createdAt
        updatedAt
      }
      messages {
        id
        conversationId
        senderType
        senderName
        content
        createdAt
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export const GET_BOOKING_SERVICES = gql`
  query GetBookingServices($siteId: String!) {
    bookingServices(siteId: $siteId) {
      id
      siteId
      name
      description
      durationMinutes
      price
      currency
      isActive
      sortOrder
      createdAt
      updatedAt
    }
  }
`;

export const GET_BOOKING_FORM_FIELDS = gql`
  query GetBookingFormFields($siteId: String!) {
    bookingFormFields(siteId: $siteId) {
      id
      siteId
      label
      fieldType
      placeholder
      isRequired
      options
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_BOOKING_PAYMENT_METHODS = gql`
  query GetBookingPaymentMethods($siteId: String!) {
    bookingPaymentMethods(siteId: $siteId) {
      id
      siteId
      stripeConnectEnabled
      onSiteEnabled
      klarnaEnabled
      swishEnabled
      createdAt
      updatedAt
    }
  }
`;

export const GET_BOOKINGS = gql`
  query GetBookings($siteId: String!, $filter: BookingFilterInput) {
    bookings(siteId: $siteId, filter: $filter) {
      items {
        id
        siteId
        serviceId
        serviceName
        customerName
        customerEmail
        customerPhone
        status
        paymentMethod
        paymentStatus
        amount
        currency
        bookingDate
        createdAt
        updatedAt
      }
      total
      page
      pageSize
    }
  }
`;

export const GET_BOOKING = gql`
  query GetBooking($siteId: String!, $bookingId: String!) {
    booking(siteId: $siteId, bookingId: $bookingId) {
      id
      siteId
      serviceId
      serviceName
      customerName
      customerEmail
      customerPhone
      formData
      status
      paymentMethod
      paymentStatus
      stripePaymentIntentId
      amount
      currency
      notes
      bookingDate
      createdAt
      updatedAt
    }
  }
`;

export const GET_BOOKING_STATS = gql`
  query GetBookingStats($siteId: String!) {
    bookingStats(siteId: $siteId) {
      totalBookings
      pendingCount
      confirmedCount
      completedCount
      cancelledCount
      totalRevenue
      currency
    }
  }
`;

export const GET_CONNECTED_ACCOUNT = gql`
  query GetConnectedAccount($siteId: String!) {
    connectedAccount(siteId: $siteId) {
      id
      siteId
      stripeAccountId
      onboardingStatus
      chargesEnabled
      payoutsEnabled
      detailsSubmitted
      country
      createdAt
      updatedAt
    }
  }
`;
