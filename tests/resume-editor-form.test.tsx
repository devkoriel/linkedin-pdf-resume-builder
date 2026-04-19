import { useState } from "react";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ResumeEditorForm } from "@/components/resume-editor-form";
import { createEmptyResume } from "@/lib/resume/schema";

afterEach(() => {
  cleanup();
});

describe("ResumeEditorForm", () => {
  it("renders guided sections and updates controlled fields", () => {
    function Harness() {
      const [resume, setResume] = useState(() => createEmptyResume());

      return (
        <>
          <ResumeEditorForm resume={resume} setResume={setResume} />
          <output data-testid="resume-name">{resume.basics.name}</output>
        </>
      );
    }

    render(<Harness />);

    expect(screen.getByText("Basics")).toBeInTheDocument();
    expect(screen.getByText("Professional Experience")).toBeInTheDocument();
    expect(screen.getByText("Technical Skills")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Alex Morgan" },
    });

    expect(screen.getByTestId("resume-name")).toHaveTextContent("Alex Morgan");
  });

  it("keeps dynamic publication fields stable while typing and preserves raw year input", () => {
    function Harness() {
      const [resume, setResume] = useState(() => createEmptyResume());

      return <ResumeEditorForm resume={resume} setResume={setResume} />;
    }

    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Add publication" }));

    const titleInput = screen.getByLabelText("Title");

    titleInput.focus();
    expect(titleInput).toHaveFocus();

    fireEvent.change(titleInput, {
      target: { value: "Cloud or Dare" },
    });

    expect(screen.getByLabelText("Title")).toHaveValue("Cloud or Dare");
    expect(screen.getByLabelText("Title")).toHaveFocus();

    fireEvent.change(screen.getByPlaceholderText("2019"), {
      target: { value: "2" },
    });
    expect(screen.getByPlaceholderText("2019")).toHaveValue("2");

    fireEvent.change(screen.getByPlaceholderText("2019"), {
      target: { value: "2019" },
    });
    expect(screen.getByPlaceholderText("2019")).toHaveValue("2019");
  });

  it("keeps award year inputs as plain years while typing", () => {
    function Harness() {
      const [resume, setResume] = useState(() => createEmptyResume());

      return <ResumeEditorForm resume={resume} setResume={setResume} />;
    }

    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Add award" }));

    fireEvent.change(screen.getByPlaceholderText("2012"), {
      target: { value: "20" },
    });
    expect(screen.getByPlaceholderText("2012")).toHaveValue("20");

    fireEvent.change(screen.getByPlaceholderText("2012"), {
      target: { value: "2012" },
    });
    expect(screen.getByPlaceholderText("2012")).toHaveValue("2012");
  });
});
