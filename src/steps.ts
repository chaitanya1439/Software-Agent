import { Step, StepType } from './types';

export function parseXml(response: string): Step[] {
  const xmlMatch = response.match(/<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/);
  if (!xmlMatch) return [];

  const xmlContent = xmlMatch[1];
  const steps: Step[] = [];
  let stepId = 1;

  const titleMatch = response.match(/title="([^"]*)"/);
  const artifactTitle = titleMatch ? titleMatch[1] : 'Project Files';

  steps.push({
    id: stepId++,
    title: artifactTitle,
    description: '',
    type: StepType.CreateFolder,
    status: 'pending'
  });

  const actionRegex = /<boltAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/boltAction>/g;
  let match;

  while ((match = actionRegex.exec(xmlContent)) !== null) {
    const [, type, filePath, content] = match;
    const trimmedContent = content.trim();

    if (type === 'file' && filePath) {
      steps.push({
        id: stepId++,
        title: `Create ${filePath}`,
        description: '',
        type: StepType.CreateFile,
        status: 'pending',
        code: trimmedContent,
        path: filePath
      });
    } else if (type === 'shell') {
      steps.push({
        id: stepId++,
        title: 'Run command',
        description: '',
        type: StepType.RunScript,
        status: 'pending',
        code: trimmedContent
      });
    }
  }

  return steps;
}
