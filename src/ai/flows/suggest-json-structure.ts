'use server';

/**
 * @fileOverview AI-powered JSON structure suggestion flow.
 *
 * - suggestJsonStructure - A function that suggests JSON structure (data types, common keys, etc.) based on existing siblings in the object.
 * - SuggestJsonStructureInput - The input type for the suggestJsonStructure function.
 * - SuggestJsonStructureOutput - The return type for the suggestJsonStructure function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestJsonStructureInputSchema = z.object({
  siblingsJson: z
    .string()
    .describe('A JSON string representing the existing siblings in the object or array.'),
  newElementType: z
    .enum(['object', 'array', 'string', 'number', 'boolean', 'null'])
    .describe('The type of the new element to be inserted.'),
});
export type SuggestJsonStructureInput = z.infer<typeof SuggestJsonStructureInputSchema>;

const SuggestJsonStructureOutputSchema = z.object({
  suggestedStructure: z
    .string()
    .describe('A JSON string representing the suggested structure for the new element.'),
});
export type SuggestJsonStructureOutput = z.infer<typeof SuggestJsonStructureOutputSchema>;

export async function suggestJsonStructure(input: SuggestJsonStructureInput): Promise<SuggestJsonStructureOutput> {
  return suggestJsonStructureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestJsonStructurePrompt',
  input: {schema: SuggestJsonStructureInputSchema},
  output: {schema: SuggestJsonStructureOutputSchema},
  prompt: `You are a JSON structure suggestion expert. Based on the provided existing siblings in a JSON object or array, you will suggest an appropriate JSON structure for a new element to be inserted.

Existing Siblings (JSON): {{{siblingsJson}}}
New Element Type: {{{newElementType}}}

Considering the existing siblings and the desired element type, provide a JSON string representing the suggested structure for the new element. Consider data types, common keys, and overall consistency with the existing data.

Output (JSON):
{
  "suggestedStructure": ""
}

Make reasonable suggestions to reduce manual typing, based on other items in the same object or array.
`, 
});

const suggestJsonStructureFlow = ai.defineFlow(
  {
    name: 'suggestJsonStructureFlow',
    inputSchema: SuggestJsonStructureInputSchema,
    outputSchema: SuggestJsonStructureOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
