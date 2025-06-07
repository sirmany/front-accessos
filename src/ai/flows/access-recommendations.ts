// AccessRecommendations.ts
'use server';

/**
 * @fileOverview An AI agent that recommends access levels for new employees based on their role and department.
 *
 * - getAccessRecommendations - A function that provides access recommendations.
 * - AccessRecommendationsInput - The input type for the getAccessRecommendations function.
 * - AccessRecommendationsOutput - The return type for the getAccessRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AccessRecommendationsInputSchema = z.object({
  role: z.string().describe('The role of the employee.'),
  department: z.string().describe('The department of the employee.'),
});
export type AccessRecommendationsInput = z.infer<typeof AccessRecommendationsInputSchema>;

const AccessRecommendationsOutputSchema = z.object({
  recommendedAccessLevels: z
    .array(z.string())
    .describe('A list of recommended access levels for the employee.'),
  justification: z.string().describe('The justification for the recommended access levels.'),
});
export type AccessRecommendationsOutput = z.infer<typeof AccessRecommendationsOutputSchema>;

export async function getAccessRecommendations(
  input: AccessRecommendationsInput
): Promise<AccessRecommendationsOutput> {
  return accessRecommendationsFlow(input);
}

const accessRecommendationsPrompt = ai.definePrompt({
  name: 'accessRecommendationsPrompt',
  input: {schema: AccessRecommendationsInputSchema},
  output: {schema: AccessRecommendationsOutputSchema},
  prompt: `You are an expert in access control and security.

  Based on the employee's role and department, recommend appropriate access levels for internal systems.
  Explain the reasons for your recommendations.

  Role: {{{role}}}
  Department: {{{department}}}

  Format your response as a JSON object:
  {
    "recommendedAccessLevels": ["accessLevel1", "accessLevel2"],
    "justification": "Explanation of why these access levels are appropriate."
  }`,
});

const accessRecommendationsFlow = ai.defineFlow(
  {
    name: 'accessRecommendationsFlow',
    inputSchema: AccessRecommendationsInputSchema,
    outputSchema: AccessRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await accessRecommendationsPrompt(input);
    return output!;
  }
);
