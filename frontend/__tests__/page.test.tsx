import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../app/page";
import { mockFetch, PILOT } from "./fixtures";

const USER = { id: 1, email: "ada@example.com", name: "Ada" };
const TERMS = { html: "<h1>Pilot Agreement</h1><ol><li>Terms</li></ol>" };

const signedIn = (extra = {}) =>
  mockFetch({
    "GET /api/auth/me": () => USER,
    "GET /api/templates": () => [PILOT],
    "GET /api/chat/greeting": () => ({ reply: "Hello! What do you need?" }),
    "GET /api/templates/pilot/terms": () => TERMS,
    ...extra,
  });

const COMPLETE = {
  pilotPeriod: "30 days",
  ...Object.fromEntries(
    ["provider", "customer"].flatMap((p) => ["Company", "Name", "Title", "Address"].map((s) => [`${p}${s}`, `${p} ${s}`]))
  ),
};

afterEach(() => vi.unstubAllGlobals());

describe("Home page", () => {
  it("shows the sign-in screen when signed out", async () => {
    mockFetch({});
    render(<Home />);
    expect(await screen.findByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("signs in and shows the greeting", async () => {
    const fetchMock = signedIn();
    fetchMock.mockImplementationOnce(async () => new Response("{}", { status: 401 }));
    fetchMock.mockImplementationOnce(async () => new Response(JSON.stringify(USER), { status: 200 }));
    const user = userEvent.setup();
    render(<Home />);
    await user.type(await screen.findByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "secret-pass");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Hello! What do you need?")).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
  });

  it("shows sign-in errors from the server", async () => {
    mockFetch({});
    const user = userEvent.setup();
    render(<Home />);
    await user.type(await screen.findByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Not signed in")).toBeInTheDocument();
  });

  it("chats, updates the preview, and offers download when complete", async () => {
    const fetchMock = signedIn({
      "POST /api/chat/message": () => ({
        reply: "Great, your pilot is ready.",
        document_type: "pilot",
        fields: COMPLETE,
        missing: [],
        complete: true,
      }),
    });
    const user = userEvent.setup();
    render(<Home />);
    await screen.findByText("Hello! What do you need?");
    expect(screen.queryByRole("button", { name: "Download PDF" })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Message"), "A 30 day pilot{Enter}");
    expect(await screen.findByText("Great, your pilot is ready.")).toBeInTheDocument();
    expect(screen.getAllByText("30 days").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Download PDF" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Message")).toHaveFocus());

    const call = fetchMock.mock.calls.find(([url]) => url === "/api/chat/message")!;
    const body = JSON.parse(call[1]!.body as string);
    expect(body.messages.at(-1)).toEqual({ role: "user", content: "A 30 day pilot" });
  });

  it("shows a friendly message when chat fails", async () => {
    signedIn();
    const user = userEvent.setup();
    render(<Home />);
    await screen.findByText("Hello! What do you need?");
    await user.type(screen.getByLabelText("Message"), "Hi{Enter}");
    expect(await screen.findByText(/couldn't process that.*\(Not signed in\)/)).toBeInTheDocument();
  });

  it("saves then loads a document from My Documents", async () => {
    const saved = { id: 7, title: "Pilot Agreement", document_type: "pilot", updated_at: "2026-10-05", fields: { pilotPeriod: "60 days" }, messages: [{ role: "user", content: "Loaded chat" }] };
    const fetchMock = signedIn({
      "POST /api/chat/message": () => ({ reply: "Pilot it is.", document_type: "pilot", fields: { pilotPeriod: "30 days" }, missing: [], complete: false }),
      "POST /api/documents": () => ({ ...saved, fields: { pilotPeriod: "30 days" } }),
      "GET /api/documents": () => [saved],
      "GET /api/documents/7": () => saved,
    });
    const user = userEvent.setup();
    render(<Home />);
    await screen.findByText("Hello! What do you need?");
    await user.type(screen.getByLabelText("Message"), "pilot{Enter}");
    await screen.findByText("Pilot it is.");

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Saved")).toBeInTheDocument();
    const post = fetchMock.mock.calls.find(([url, init]) => url === "/api/documents" && init?.method === "POST")!;
    expect(JSON.parse(post[1]!.body as string).title).toBe("Pilot Agreement");

    await user.click(screen.getByRole("button", { name: "My Documents" }));
    await user.click(await screen.findByRole("button", { name: "Open" }));
    expect(await screen.findByText("Loaded chat")).toBeInTheDocument();
    expect(screen.getAllByText("60 days").length).toBeGreaterThan(0);
  });

  it("New Document resets the conversation", async () => {
    signedIn({
      "POST /api/chat/message": () => ({ reply: "Pilot it is.", document_type: "pilot", fields: {}, missing: [], complete: false }),
    });
    const user = userEvent.setup();
    render(<Home />);
    await screen.findByText("Hello! What do you need?");
    await user.type(screen.getByLabelText("Message"), "pilot{Enter}");
    await screen.findByText("Pilot it is.");
    await user.click(screen.getByRole("button", { name: "New Document" }));
    expect(screen.queryByText("Pilot it is.")).not.toBeInTheDocument();
    expect(screen.getByText("Your document will appear here")).toBeInTheDocument();
  });
});
