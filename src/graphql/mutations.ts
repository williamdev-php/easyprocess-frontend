import { gql } from "@apollo/client";

export const CREATE_LISTING = gql`
  mutation CreateListing($input: CreateListingInput!) {
    createListing(input: $input) {
      id
      title
      type
      price
      startingBid
      endsAt
      status
    }
  }
`;

export const UPDATE_LISTING = gql`
  mutation UpdateListing($id: ID!, $input: UpdateListingInput!) {
    updateListing(id: $id, input: $input) {
      id
      title
      type
      price
      startingBid
      endsAt
      status
    }
  }
`;

export const PLACE_BID = gql`
  mutation PlaceBid($listingId: ID!, $amount: Float!) {
    placeBid(listingId: $listingId, amount: $amount) {
      id
      amount
      createdAt
      listing {
        id
        currentBid
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// AutoSite: Leads & Sites
// ---------------------------------------------------------------------------

export const CREATE_LEAD = gql`
  mutation CreateLead($input: CreateLeadInput!) {
    createLead(input: $input) {
      id
      businessName
      websiteUrl
      status
    }
  }
`;

export const SCRAPE_LEAD = gql`
  mutation ScrapeLead($leadId: String!) {
    scrapeLead(leadId: $leadId)
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
