import { gql } from "@apollo/client";

// ---------------------------------------------------------------------------
// AutoSite: Leads & Sites
// ---------------------------------------------------------------------------

export const CREATE_LEAD = gql`
  mutation CreateLead($input: CreateLeadInput!) {
    createLead(input: $input) {
      id
      businessName
      websiteUrl
      industryId
      industryName
      status
    }
  }
`;

export const SCRAPE_LEAD = gql`
  mutation ScrapeLead($leadId: String!) {
    scrapeLead(leadId: $leadId)
  }
`;

export const GENERATE_VIDEO = gql`
  mutation GenerateVideo($leadId: String!) {
    generateVideo(leadId: $leadId)
  }
`;

export const UPDATE_LEAD_STATUS = gql`
  mutation UpdateLeadStatus($leadId: String!, $status: String!) {
    updateLeadStatus(leadId: $leadId, status: $status) {
      id
      status
    }
  }
`;

export const DELETE_LEAD = gql`
  mutation DeleteLead($leadId: String!) {
    deleteLead(leadId: $leadId)
  }
`;

export const SEND_OUTREACH_EMAIL = gql`
  mutation SendOutreachEmail($leadId: String!) {
    sendOutreachEmail(leadId: $leadId) {
      id
      toEmail
      status
      sentAt
    }
  }
`;

export const PUBLISH_SITE = gql`
  mutation PublishSite($siteId: String!) {
    publishSite(siteId: $siteId) {
      id
      status
      publishedAt
    }
  }
`;

export const MARK_EMAIL_READ = gql`
  mutation MarkEmailRead($id: String!, $isRead: Boolean!) {
    markEmailRead(id: $id, isRead: $isRead) {
      id
      isRead
    }
  }
`;

export const ARCHIVE_EMAIL = gql`
  mutation ArchiveEmail($id: String!, $isArchived: Boolean!) {
    archiveEmail(id: $id, isArchived: $isArchived) {
      id
      isArchived
    }
  }
`;

export const UPDATE_SITE_DATA = gql`
  mutation UpdateSiteData($input: UpdateSiteDataInput!) {
    updateSiteData(input: $input) {
      id
      siteData
      updatedAt
    }
  }
`;

export const SAVE_DRAFT = gql`
  mutation SaveDraft($input: SaveDraftInput!) {
    saveDraft(input: $input) {
      siteId
      draftData
      updatedAt
    }
  }
`;

export const LOAD_DRAFT = gql`
  mutation LoadDraft($siteId: String!) {
    loadDraft(siteId: $siteId) {
      siteId
      draftData
      updatedAt
    }
  }
`;

export const PUBLISH_SITE_DATA = gql`
  mutation PublishSiteData($input: UpdateSiteDataInput!) {
    publishSiteData(input: $input) {
      success
      site {
        id
        siteData
        updatedAt
      }
    }
  }
`;

export const DISCARD_DRAFT = gql`
  mutation DiscardDraft($siteId: String!) {
    discardDraft(siteId: $siteId)
  }
`;

// ---------------------------------------------------------------------------
// Domains
// ---------------------------------------------------------------------------

export const ADD_DOMAIN = gql`
  mutation AddDomain($input: AddDomainInput!) {
    addDomain(input: $input) {
      id
      domain
      siteId
      status
      createdAt
      vercelVerification
    }
  }
`;

export const REMOVE_DOMAIN = gql`
  mutation RemoveDomain($domainId: String!) {
    removeDomain(domainId: $domainId)
  }
`;

export const ASSIGN_DOMAIN_TO_SITE = gql`
  mutation AssignDomainToSite($input: AssignDomainInput!) {
    assignDomainToSite(input: $input) {
      id
      domain
      siteId
      status
    }
  }
`;

export const VERIFY_DOMAIN = gql`
  mutation VerifyDomain($domainId: String!) {
    verifyDomain(domainId: $domainId) {
      id
      domain
      status
      verifiedAt
      vercelVerification
    }
  }
`;

export const SET_SITE_SUBDOMAIN = gql`
  mutation SetSiteSubdomain($siteId: String!, $subdomain: String!) {
    setSiteSubdomain(siteId: $siteId, subdomain: $subdomain) {
      id
      subdomain
    }
  }
`;

export const PREPARE_DOMAIN_TRANSFER = gql`
  mutation PrepareDomainTransfer($domainId: String!) {
    prepareDomainTransfer(domainId: $domainId) {
      domain
      isLocked
      authCode
      instructions
    }
  }
`;

export const LOCK_DOMAIN = gql`
  mutation LockDomain($domainId: String!) {
    lockDomain(domainId: $domainId) {
      id
      isLocked
    }
  }
`;

export const TOGGLE_DOMAIN_AUTO_RENEW = gql`
  mutation ToggleDomainAutoRenew($domainId: String!, $autoRenew: Boolean!) {
    toggleDomainAutoRenew(domainId: $domainId, autoRenew: $autoRenew) {
      id
      autoRenew
    }
  }
`;

export const RENEW_PURCHASED_DOMAIN = gql`
  mutation RenewPurchasedDomain($domainId: String!) {
    renewPurchasedDomain(domainId: $domainId) {
      id
      domain
      status
      expiresAt
    }
  }
`;

// ---------------------------------------------------------------------------
// Version History
// ---------------------------------------------------------------------------

export const RESTORE_SITE_VERSION = gql`
  mutation RestoreSiteVersion($siteId: String!, $versionId: String!) {
    restoreSiteVersion(siteId: $siteId, versionId: $versionId) {
      id
      siteData
      updatedAt
    }
  }
`;

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export const UPDATE_BILLING_DETAILS = gql`
  mutation UpdateBillingDetails($input: UpdateBillingDetailsInput!) {
    updateBillingDetails(input: $input) {
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

// ---------------------------------------------------------------------------
// Site Management (Delete, Pause, Settings)
// ---------------------------------------------------------------------------

export const REQUEST_SITE_DELETION = gql`
  mutation RequestSiteDeletion($siteId: String!, $slug: String!) {
    requestSiteDeletion(siteId: $siteId, slug: $slug)
  }
`;

export const CONFIRM_SITE_DELETION = gql`
  mutation ConfirmSiteDeletion($token: String!) {
    confirmSiteDeletion(token: $token)
  }
`;

export const PAUSE_SITE = gql`
  mutation PauseSite($siteId: String!) {
    pauseSite(siteId: $siteId) {
      id
      status
      updatedAt
    }
  }
`;

export const UNPAUSE_SITE = gql`
  mutation UnpauseSite($siteId: String!) {
    unpauseSite(siteId: $siteId) {
      id
      status
      updatedAt
    }
  }
`;

export const UPDATE_SITE_SETTINGS = gql`
  mutation UpdateSiteSettings($siteId: String!, $settings: JSON!) {
    updateSiteSettings(siteId: $siteId, settings: $settings) {
      id
      siteData
      updatedAt
    }
  }
`;

export const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription {
    cancelSubscription {
      id
      status
      cancelAtPeriodEnd
    }
  }
`;

export const REACTIVATE_SUBSCRIPTION = gql`
  mutation ReactivateSubscription {
    reactivateSubscription {
      id
      status
      cancelAtPeriodEnd
    }
  }
`;

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($notificationId: String!) {
    markNotificationRead(notificationId: $notificationId)
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

// ---------------------------------------------------------------------------
// Support Tickets
// ---------------------------------------------------------------------------

export const CREATE_SUPPORT_TICKET = gql`
  mutation CreateSupportTicket($input: CreateSupportTicketInput!) {
    createSupportTicket(input: $input) {
      id
      subject
      message
      status
      createdAt
    }
  }
`;

export const UPDATE_SUPPORT_TICKET = gql`
  mutation UpdateSupportTicket($input: UpdateSupportTicketInput!) {
    updateSupportTicket(input: $input) {
      id
      status
      priority
      adminReply
      repliedAt
      updatedAt
    }
  }
`;

export const MARK_TICKET_READ = gql`
  mutation MarkTicketRead($ticketId: String!, $isRead: Boolean!) {
    markTicketRead(ticketId: $ticketId, isRead: $isRead) {
      id
      isRead
    }
  }
`;

export const ARCHIVE_TICKET = gql`
  mutation ArchiveTicket($ticketId: String!, $isArchived: Boolean!) {
    archiveTicket(ticketId: $ticketId, isArchived: $isArchived) {
      id
      isArchived
    }
  }
`;

// ---------------------------------------------------------------------------
// Admin: User Management
// ---------------------------------------------------------------------------

export const ADMIN_UPDATE_USER = gql`
  mutation AdminUpdateUser($input: AdminUpdateUserInput!) {
    adminUpdateUser(input: $input) {
      id
      email
      fullName
      companyName
      orgNumber
      phone
      locale
      role
      isSuperuser
      isActive
      isVerified
      updatedAt
    }
  }
`;

// ---------------------------------------------------------------------------
// Platform Settings (Super Admin)
// ---------------------------------------------------------------------------

export const UPDATE_PLATFORM_SETTING = gql`
  mutation UpdatePlatformSetting($input: UpdatePlatformSettingInput!) {
    updatePlatformSetting(input: $input) {
      key
      value
    }
  }
`;

// ---------------------------------------------------------------------------
// Industries
// ---------------------------------------------------------------------------

export const CREATE_INDUSTRY = gql`
  mutation CreateIndustry($input: CreateIndustryInput!) {
    createIndustry(input: $input) {
      id
      name
      slug
      description
      createdAt
    }
  }
`;

export const UPDATE_INDUSTRY = gql`
  mutation UpdateIndustry($input: UpdateIndustryInput!) {
    updateIndustry(input: $input) {
      id
      name
      slug
      description
      updatedAt
    }
  }
`;

export const DELETE_INDUSTRY = gql`
  mutation DeleteIndustry($industryId: String!) {
    deleteIndustry(industryId: $industryId)
  }
`;

// ---------------------------------------------------------------------------
// Apps
// ---------------------------------------------------------------------------

export const INSTALL_APP = gql`
  mutation InstallApp($input: InstallAppInput!) {
    installApp(input: $input) {
      id
      appSlug
      appName
      siteId
      isActive
      sidebarLinks
      installedAt
    }
  }
`;

export const UNINSTALL_APP = gql`
  mutation UninstallApp($input: UninstallAppInput!) {
    uninstallApp(input: $input)
  }
`;

// ---------------------------------------------------------------------------
// App Reviews
// ---------------------------------------------------------------------------

export const CREATE_APP_REVIEW = gql`
  mutation CreateAppReview($input: CreateAppReviewInput!) {
    createAppReview(input: $input) {
      id
      appId
      userId
      userName
      siteId
      rating
      title
      body
      locale
      createdAt
    }
  }
`;

export const DELETE_APP_REVIEW = gql`
  mutation DeleteAppReview($input: DeleteAppReviewInput!) {
    deleteAppReview(input: $input)
  }
`;

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export const CREATE_BLOG_POST = gql`
  mutation CreateBlogPost($input: CreateBlogPostInput!) {
    createBlogPost(input: $input) {
      id
      siteId
      title
      slug
      excerpt
      content
      featuredImage
      authorName
      categoryId
      categoryName
      status
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_BLOG_POST = gql`
  mutation UpdateBlogPost($input: UpdateBlogPostInput!) {
    updateBlogPost(input: $input) {
      id
      siteId
      title
      slug
      excerpt
      content
      featuredImage
      authorName
      categoryId
      categoryName
      status
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_BLOG_POST = gql`
  mutation DeleteBlogPost($siteId: String!, $postId: String!) {
    deleteBlogPost(siteId: $siteId, postId: $postId)
  }
`;

export const CREATE_BLOG_CATEGORY = gql`
  mutation CreateBlogCategory($input: CreateBlogCategoryInput!) {
    createBlogCategory(input: $input) {
      id
      siteId
      name
      slug
      description
      sortOrder
      postCount
      createdAt
    }
  }
`;

export const UPDATE_BLOG_CATEGORY = gql`
  mutation UpdateBlogCategory($input: UpdateBlogCategoryInput!) {
    updateBlogCategory(input: $input) {
      id
      siteId
      name
      slug
      description
      sortOrder
      postCount
      updatedAt
    }
  }
`;

export const DELETE_BLOG_CATEGORY = gql`
  mutation DeleteBlogCategory($siteId: String!, $categoryId: String!) {
    deleteBlogCategory(siteId: $siteId, categoryId: $categoryId)
  }
`;

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export const SEND_CHAT_REPLY = gql`
  mutation SendChatReply($input: SendChatReplyInput!) {
    sendChatReply(input: $input) {
      id
      conversationId
      senderType
      senderName
      content
      createdAt
    }
  }
`;

export const CLOSE_CHAT_CONVERSATION = gql`
  mutation CloseChatConversation($siteId: String!, $conversationId: String!) {
    closeChatConversation(siteId: $siteId, conversationId: $conversationId)
  }
`;

export const REOPEN_CHAT_CONVERSATION = gql`
  mutation ReopenChatConversation($siteId: String!, $conversationId: String!) {
    reopenChatConversation(siteId: $siteId, conversationId: $conversationId)
  }
`;
