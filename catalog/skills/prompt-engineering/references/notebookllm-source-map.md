# NotebookLLM Source Map

This skill was derived from the user's NotebookLLM AI Engineering prompt-engineering PDFs. The skill intentionally compresses the course material into operational guidance and avoids copying the PDFs as long-form text.

## Core Foundations

| Skill section | Source PDFs |
| --- | --- |
| Prompt anatomy and principles | `Introduction.pdf`, `Whats_a_prompt.pdf`, `Whats_prompt_engineering.pdf`, `Prompting_Best_Practices.pdf` |
| LLM mechanics and durable model-selection principles | `LLMs_and_How_Do_They_Work.pdf`, `Vocabulary.pdf`, `Models_commonly_known.pdf` |
| Scenario decision tree | `Prompting_Techniques.pdf`, `Prompting_Best_Practices.pdf` |

## Prompting Strategies

| Strategy | Source PDFs |
| --- | --- |
| Zero-shot, one-shot, few-shot | `Prompting_Techniques.pdf`, `Whats_a_prompt.pdf` |
| Step-back prompting | `Prompting_Techniques.pdf`, `Prompt_Debiasing.pdf` |
| Chain-of-thought and bounded reasoning | `Prompting_Techniques.pdf`, `LLMs_and_How_Do_They_Work.pdf` |
| Self-consistency and Tree of Thoughts | `Prompting_Techniques.pdf` |
| ReAct and tool boundaries | `Prompting_Techniques.pdf`, `Stop_Sequences.pdf`, `Output_Control.pdf` |
| Prompt ensembling and automatic prompt engineering | `Prompt_Ensembling.pdf`, `Automatic_Prompt_Engineering.pdf` |

## Output and Parameter Control

| Skill topic | Source PDFs |
| --- | --- |
| Temperature, top-p, top-k | `Sampling_Parameters.pdf`, `Temperature.pdf`, `Top-P.pdf`, `Top-K.pdf` |
| Max tokens and stop sequences | `Max_Tokens.pdf`, `Stop_Sequences.pdf`, `Output_Control.pdf` |
| Repetition penalties | `Repetition_Penalties.pdf`, `Frequency_Penalty.pdf`, `Presence_Penalty.pdf` |
| Structured outputs | `Structured_Outputs.pdf`, `Output_Control.pdf`, `Prompting_Best_Practices.pdf` |

## Reliability, Safety, and Evaluation

| Skill topic | Source PDFs |
| --- | --- |
| Prompt testing and versioning | `Prompting_Best_Practices.pdf`, `Automatic_Prompt_Engineering.pdf` |
| Self-evaluation and rubric judging | `LLM_Self_Evaluation.pdf` |
| Confidence, abstention, calibration | `Calibrating_LLMs.pdf`, `LLM_Self_Evaluation.pdf` |
| Debiasing and counterfactual testing | `Prompt_Debiasing.pdf` |
| Red teaming and prompt-injection defense | `AI_Red_Teaming.pdf`, `Vocabulary.pdf`, `Prompting_Best_Practices.pdf` |

## Durable-Only Provider Guidance

`Models_commonly_known.pdf` includes provider and flagship-model examples that may become stale. This skill uses only durable selection criteria from that material:

- context window and retrieval strategy
- cost and latency
- modality support
- tool/function calling support
- deployment and data-residency constraints
- safety posture and instruction-following behavior
- reproducibility and ecosystem fit

Do not add current flagship model claims to this skill without verifying them against current official provider sources.
