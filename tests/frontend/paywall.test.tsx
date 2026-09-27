import { describe, it, expect, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import { PaywallDialog } from "@/components/paywall/PaywallDialog";

afterEach(cleanup);

const baseProps = {
  open: true,
  limit: 5,
  entitled: false,
  onClose: vi.fn(),
  onSignIn: vi.fn(),
  onUpgrade: vi.fn(),
  onManage: vi.fn(),
};

describe("PaywallDialog", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<PaywallDialog {...baseProps} open={false} reason="anonymous" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("asks anonymous visitors to sign in", () => {
    const onSignIn = vi.fn();
    render(<PaywallDialog {...baseProps} reason="anonymous" onSignIn={onSignIn} />);
    expect(screen.getByText(/used all 5 free rooms/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Sign up \/ Sign in/i }));
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  it("sends signed-in unpaid users to checkout", () => {
    const onUpgrade = vi.fn();
    render(<PaywallDialog {...baseProps} reason="unpaid" onUpgrade={onUpgrade} />);
    fireEvent.click(screen.getByRole("button", { name: /Get lifetime access/i }));
    expect(onUpgrade).toHaveBeenCalledTimes(1);
  });

  it("offers purchase management when already entitled", () => {
    const onManage = vi.fn();
    render(<PaywallDialog {...baseProps} reason="unpaid" entitled onManage={onManage} />);
    fireEvent.click(screen.getByRole("button", { name: /Manage your purchase/i }));
    expect(onManage).toHaveBeenCalledTimes(1);
  });
});
