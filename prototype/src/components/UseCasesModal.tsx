import { useMemo, useState } from "react";
import "../styles/usecases-modal.css";

export type ProjectTypeId =
  | "financial-transaction"
  | "long-term-repository"
  | "assets-management";

export type UseCaseId =
  | "ma-sell-side"
  | "ipo-exits"
  | "bankruptcy"
  | "ma-buy-side"
  | "strategic-partnership"
  | "tendering"
  | "fundraising"
  | "debt-financing"
  | "licensing";

export type UseCasesModalValue = {
  projectType: ProjectTypeId;
  useCase: UseCaseId | null;
};

type ProjectTypeOption = {
  id: ProjectTypeId;
  title: string;
  description: string;
};

type UseCaseOption = {
  id: UseCaseId;
  label: string;
};

type UseCasesModalProps = {
  isOpen: boolean;
  initialProjectType?: ProjectTypeId;
  initialUseCase?: UseCaseId | null;
  onSkip?: () => void;
  onSave?: (value: UseCasesModalValue) => void;
  onClose?: () => void;
};

const PROJECT_TYPE_OPTIONS: ProjectTypeOption[] = [
  {
    id: "financial-transaction",
    title: "Financial transaction",
    description: "Deals with the monetary exchange of services or goods",
  },
  {
    id: "long-term-repository",
    title: "Long-term repository",
    description: "Internal or external document sharing between involved parties",
  },
  {
    id: "assets-management",
    title: "Assets management",
    description:
      "Collaboration on physical, financial, and intellectual assets",
  },
];

const USE_CASE_OPTIONS_BY_PROJECT_TYPE: Record<ProjectTypeId, UseCaseOption[]> = {
  "financial-transaction": [
    { id: "ma-sell-side", label: "M&A sell-side" },
    { id: "ipo-exits", label: "IPO & exits" },
    { id: "bankruptcy", label: "Bankruptcy" },
    { id: "ma-buy-side", label: "M&A buy-side" },
    { id: "strategic-partnership", label: "Strategic partnership" },
    { id: "tendering", label: "Tendering" },
    { id: "fundraising", label: "Fundraising" },
    { id: "debt-financing", label: "Debt financing" },
    { id: "licensing", label: "Licensing" },
  ],
  "long-term-repository": [
    { id: "ma-sell-side", label: "Board collaboration" },
    { id: "ipo-exits", label: "Annual reports" },
    { id: "bankruptcy", label: "Audit vault" },
    { id: "ma-buy-side", label: "Legal repository" },
    { id: "strategic-partnership", label: "External sharing" },
    { id: "tendering", label: "Stakeholder docs" },
    { id: "fundraising", label: "Policy archive" },
    { id: "debt-financing", label: "Compliance docs" },
    { id: "licensing", label: "Project handoff" },
  ],
  "assets-management": [
    { id: "ma-sell-side", label: "Portfolio management" },
    { id: "ipo-exits", label: "Asset valuation" },
    { id: "bankruptcy", label: "Insurance coordination" },
    { id: "ma-buy-side", label: "Contract lifecycle" },
    { id: "strategic-partnership", label: "Vendor governance" },
    { id: "tendering", label: "Facilities operations" },
    { id: "fundraising", label: "IP documentation" },
    { id: "debt-financing", label: "Budget controls" },
    { id: "licensing", label: "Risk tracking" },
  ],
};

type Phase = "project-type" | "use-case";

export function UseCasesModal({
  isOpen,
  initialProjectType = "financial-transaction",
  initialUseCase = null,
  onSkip,
  onSave,
  onClose,
}: UseCasesModalProps) {
  const [phase, setPhase] = useState<Phase>(
    initialUseCase ? "use-case" : "project-type"
  );
  const [projectType, setProjectType] = useState<ProjectTypeId>(
    initialProjectType
  );
  const [useCase, setUseCase] = useState<UseCaseId | null>(initialUseCase);

  const useCaseOptions = useMemo(
    () => USE_CASE_OPTIONS_BY_PROJECT_TYPE[projectType],
    [projectType]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="ucm-overlay" role="presentation" onClick={onClose}>
      <div
        className="ucm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ucm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ucm-header">
          <h2 id="ucm-title" className="ucm-title">
            Pick the project type you are working on
          </h2>
          <p className="ucm-subtitle">
            Knowing your project specifics, we will help you get started
          </p>
        </header>

        {phase === "project-type" ? (
          <section className="ucm-content ucm-content--cards">
            {PROJECT_TYPE_OPTIONS.map((option) => {
              const selected = option.id === projectType;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`ucm-card ${selected ? "ucm-card--selected" : ""}`}
                  onClick={() => {
                    setProjectType(option.id);
                    setUseCase(null);
                    setPhase("use-case");
                  }}
                >
                  <div className="ucm-card-preview" aria-hidden="true">
                    <span className="ucm-card-preview-icon" />
                  </div>
                  <h3 className="ucm-card-title">{option.title}</h3>
                  <p className="ucm-card-description">{option.description}</p>
                </button>
              );
            })}
          </section>
        ) : (
          <section className="ucm-content ucm-content--use-cases">
            <button
              type="button"
              className="ucm-back"
              onClick={() => setPhase("project-type")}
            >
              <span aria-hidden="true">&#x2039;</span> Back
            </button>

            <div className="ucm-use-case-grid" role="radiogroup" aria-label="Use case">
              {useCaseOptions.map((option) => {
                const selected = option.id === useCase;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`ucm-use-case ${selected ? "ucm-use-case--selected" : ""}`}
                    onClick={() => setUseCase(option.id)}
                  >
                    <span className="ucm-use-case-icon" aria-hidden="true" />
                    <span className="ucm-use-case-label">{option.label}</span>
                    <span
                      className={`ucm-radio ${selected ? "ucm-radio--selected" : ""}`}
                      aria-hidden="true"
                    >
                      <span className="ucm-radio-dot" />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <footer className="ucm-footer">
          {phase === "project-type" || useCase == null ? (
            <button type="button" className="ucm-link-action" onClick={onSkip}>
              Show later &amp; go to project <span aria-hidden="true">&#x2192;</span>
            </button>
          ) : (
            <button
              type="button"
              className="ucm-primary-action"
              onClick={() => onSave?.({ projectType, useCase })}
            >
              Save &amp; go to project <span aria-hidden="true">&#x2192;</span>
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

export default UseCasesModal;
