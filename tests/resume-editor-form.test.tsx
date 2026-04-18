import { useState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResumeEditorForm } from "@/components/resume-editor-form";
import { createEmptyResume } from "@/lib/resume/schema";

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
});
