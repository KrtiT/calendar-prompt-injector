// == Prompt banks ==
// Author: Krti Tallam

const PROMPT_BANKS = {
  default: {
    mon: [
      "what’s the single riskiest assumption in our agent chain today?",
      "what would break if we 10× concurrency tomorrow—and how do we fail closed?",
      "which one change yields 10× risk-reduction for <1 day of work?"
    ],
    tue: [
      "how do i halve context tokens without losing signal?",
      "design a 5-minute harness to A/B chunkers—what metrics decide?",
      "which 3 golden prompts should be canonical in our repo?"
    ],
    wed: [
      "what can i remove so the team ships 1.0 sooner?",
      "which decision are we deferring that has the biggest tail risk?",
      "what review habit would cut PR cycle time by 25%?"
    ],
    thu: [
      "what claim would i defend in a 10-minute talk—what falsifies it?",
      "sketch a figure that tells the story with no text.",
      "what experiment can i run in 48 hours to move this forward?"
    ],
    fri: [
      "if we acted like a top-decile eng org next week, what changes first?",
      "where is ambiguity creating thrash—what single doc codifies it?",
      "which ritual should be weekly (agenda + owners)?"
    ],
    sat: [
      "what gives me the most energy for deep work—how do i schedule more?",
      "what can i stop doing this week with no negative impact?",
      "what boundary best protects sleep + recovery?"
    ],
    sun: [
      "what would convince future-me this was the wrong path?",
      "if we removed 80% of complexity, what stays?",
      "what is the falsifiable claim—and how do we test it by tuesday?"
    ]
  },

  research: {
    mon: [
      "state the hypothesis in one sentence—what falsifies it?",
      "what minimal dataset or proxy would unlock a 48h test?"
    ],
    tue: [
      "design the figure first—what data would each panel show?"
    ],
    wed: [
      "what prior work are we implicitly duplicating—what’s the delta?"
    ],
    thu: [
      "what ablation would most change our conclusion?"
    ],
    fri: [
      "what’s the one result that would make this publishable?"
    ],
    sat: ["open problem: what makes this actually hard?"],
    sun: ["write the abstract; then delete half the words."]
  }
};
