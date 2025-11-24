import type { ChatSummary } from "../types";

export const suggestions = [
  {
    id: 12312,
    title: 'Top Python developers',
    description:
      'Find me the top 5 Python developers with 5+ years of experience that have worked on at least 2 Endava projects.',
    prompt:
      'Find me the top 5 Python developers with 5+ years of experience that have worked on at least 2 Endava projects.',
    actionLabel: 'Start',
    icon: '🐍',
  },
  {
    id: 234242,
    title: 'Match candidates to a SOW',
    description:
      'Below is a statement of work. Give me the top 5 candidates for each position listed. Make sure they match the required skills and experience.',
    prompt:
      'Below is a statement of work. Give me the top 5 candidates for each position listed. Make sure they match the required skills and experience.',
    actionLabel: 'Start',
    icon: '📝',
  },
  {
    id: 345345,
    title: 'React availability check',
    description:
      'Show me React developers available in the next two weeks with strong TypeScript and Tailwind CSS skills.',
    prompt:
      'Show me React developers available in the next two weeks with strong TypeScript and Tailwind CSS skills.',
    actionLabel: 'Start',
    icon: '⚛️',
  },
];

export const defaultChats: ChatSummary[] = [
  {
    id: '12321',
    title: 'ClientX Team pairing ideas',
    preview: 'Based on the requirements for ClientX, give me three pairing ideas that balance mobile, API, and QA expertise for the payments team.',
    updatedAt: Date.now() - 1000 * 60 * 15,
    messages: [
      {
        id: '4233423',
        sender: 'user',
        content:
          'Can you suggest a few pairings of engineers for ClientX who have complementary skills for the payments team?',
      },
      {
        id: '4345',
        sender: 'bot',
        content:
          'Here are three pairing ideas that balance mobile, API, and QA expertise for the payments pod.',
      },
    ],
  },
  {
    id: '23439',
    title: 'ATL Staffing follow-up',
    preview: 'We still have four roles open in Atlanta for Cox: two frontend, one backend, and a data analyst position.',
    updatedAt: Date.now() - 1000 * 60 * 60,
    messages: [
      {
        id: '98767',
        sender: 'user',
        content: 'Can you recap the open roles we still need to fill in Atlanta for Cox?',
      },
      {
        id: '67534',
        sender: 'bot',
        content:
          'We still have four roles open at Cox in Atlanta: two frontend, one backend, and a data analyst position. Would you like me to suggest candidates for any of these roles?',
      },
    ],
  },
  {
    id: '86634343',
    title: 'Nimbus SOW notes',
    preview: 'Next position for Nimbus onboarding',
    updatedAt: Date.now() - 1000 * 60 * 90,
    messages: [
      {
        id: '55333378',
        sender: 'user',
        content: 'Return the next position from the Nimbus statement of work and the top five candidates for that position.',
      },
      {
        id: '676656777',
        sender: 'bot',
        content: 'The next position for Nimbus onboarding is **Senior Frontend Engineer**. The requirements are: - React, - TypeScript, - AWS experience. Here are the top five candidates for this role...',
      },
    ],
  },
];
