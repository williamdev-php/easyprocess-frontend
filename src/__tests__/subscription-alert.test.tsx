import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const messages: Record<string, string> = {
      paymentFailed: "Your payment failed.",
      expiringPlan: `Your trial ends in ${params?.days ?? 0} days.`,
      siteDeletion: `Your site will be deleted in ${params?.days ?? 0} days.`,
      action: "Fix billing",
      dismiss: "Dismiss",
    };
    return messages[key] ?? key;
  },
}));

// Mock routing
vi.mock("@/i18n/routing", () => ({
  usePathname: () => "/dashboard",
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock Apollo
const mockUseQuery = vi.fn();
vi.mock("@apollo/client/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

vi.mock("@/graphql/queries", () => ({
  MY_SUBSCRIPTION: "MY_SUBSCRIPTION",
}));

// Import component after mocks
import SubscriptionAlert from "@/components/subscription-alert";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SubscriptionAlert", () => {
  it("renders nothing when no subscription data", () => {
    mockUseQuery.mockReturnValue({ data: null });
    const { container } = render(<SubscriptionAlert />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for active subscription without issues", () => {
    mockUseQuery.mockReturnValue({
      data: {
        mySubscription: {
          id: "sub_1",
          status: "ACTIVE",
          currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
          cancelAtPeriodEnd: false,
          trialEnd: null,
        },
      },
    });
    const { container } = render(<SubscriptionAlert />);
    expect(container.firstChild).toBeNull();
  });

  it("shows payment failed alert for PAST_DUE status", () => {
    mockUseQuery.mockReturnValue({
      data: {
        mySubscription: {
          id: "sub_1",
          status: "PAST_DUE",
          currentPeriodEnd: new Date(Date.now() + 7 * 86400000).toISOString(),
          cancelAtPeriodEnd: false,
          trialEnd: null,
        },
      },
    });
    render(<SubscriptionAlert />);
    expect(screen.getByText("Your payment failed.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows expiring trial alert when trial ends within 7 days", () => {
    mockUseQuery.mockReturnValue({
      data: {
        mySubscription: {
          id: "sub_1",
          status: "TRIALING",
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          trialEnd: new Date(Date.now() + 3 * 86400000).toISOString(),
        },
      },
    });
    render(<SubscriptionAlert />);
    expect(screen.getByText(/Your trial ends in 3 days/)).toBeInTheDocument();
  });

  it("shows site deletion alert when cancel scheduled within 14 days", () => {
    mockUseQuery.mockReturnValue({
      data: {
        mySubscription: {
          id: "sub_1",
          status: "ACTIVE",
          currentPeriodEnd: new Date(Date.now() + 5 * 86400000).toISOString(),
          cancelAtPeriodEnd: true,
          trialEnd: null,
        },
      },
    });
    render(<SubscriptionAlert />);
    expect(screen.getByText(/Your site will be deleted in 5 days/)).toBeInTheDocument();
  });

  it("can be dismissed", async () => {
    mockUseQuery.mockReturnValue({
      data: {
        mySubscription: {
          id: "sub_1",
          status: "PAST_DUE",
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          trialEnd: null,
        },
      },
    });
    render(<SubscriptionAlert />);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText("Dismiss"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
