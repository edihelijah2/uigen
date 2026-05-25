import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getLabel } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// getLabel unit tests

test("getLabel: str_replace_editor create", () => {
  expect(getLabel("str_replace_editor", { command: "create", path: "/src/App.jsx" })).toBe("Creating App.jsx");
});

test("getLabel: str_replace_editor str_replace", () => {
  expect(getLabel("str_replace_editor", { command: "str_replace", path: "/src/components/Card.tsx" })).toBe("Editing Card.tsx");
});

test("getLabel: str_replace_editor insert", () => {
  expect(getLabel("str_replace_editor", { command: "insert", path: "/src/App.jsx" })).toBe("Editing App.jsx");
});

test("getLabel: str_replace_editor view", () => {
  expect(getLabel("str_replace_editor", { command: "view", path: "/src/App.jsx" })).toBe("Viewing App.jsx");
});

test("getLabel: str_replace_editor unknown command falls back to Editing", () => {
  expect(getLabel("str_replace_editor", { command: "undo_edit", path: "/src/App.jsx" })).toBe("Editing App.jsx");
});

test("getLabel: file_manager rename", () => {
  expect(
    getLabel("file_manager", { command: "rename", path: "/src/Old.tsx", new_path: "/src/New.tsx" })
  ).toBe("Renaming Old.tsx to New.tsx");
});

test("getLabel: file_manager delete", () => {
  expect(getLabel("file_manager", { command: "delete", path: "/src/Unused.tsx" })).toBe("Deleting Unused.tsx");
});

test("getLabel: unknown tool returns toolName", () => {
  expect(getLabel("some_other_tool", {})).toBe("some_other_tool");
});

// ToolCallBadge rendering tests

function makeInvocation(overrides: Partial<ToolInvocation> = {}): ToolInvocation {
  return {
    state: "call",
    toolCallId: "abc",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/src/App.jsx" },
    ...overrides,
  } as ToolInvocation;
}

test("ToolCallBadge shows friendly label for create", () => {
  render(<ToolCallBadge tool={makeInvocation()} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("ToolCallBadge shows friendly label for str_replace", () => {
  render(
    <ToolCallBadge
      tool={makeInvocation({ args: { command: "str_replace", path: "/src/Button.tsx" } })}
    />
  );
  expect(screen.getByText("Editing Button.tsx")).toBeDefined();
});

test("ToolCallBadge shows friendly label for file_manager delete", () => {
  render(
    <ToolCallBadge
      tool={makeInvocation({
        toolName: "file_manager",
        args: { command: "delete", path: "/src/Old.tsx" },
      })}
    />
  );
  expect(screen.getByText("Deleting Old.tsx")).toBeDefined();
});

test("ToolCallBadge shows spinner while in progress", () => {
  const { container } = render(<ToolCallBadge tool={makeInvocation({ state: "call" })} />);
  expect(container.querySelector(".animate-spin")).not.toBeNull();
});

test("ToolCallBadge shows green dot when result is available", () => {
  const { container } = render(
    <ToolCallBadge
      tool={makeInvocation({ state: "result", result: "ok" } as ToolInvocation)}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
