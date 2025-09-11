#!/usr/bin/env node

/**
 * AI Code Generator for Autonomous Workflow Mode
 * Generates code based on feature specifications and project context
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class AICodeGenerator {
  constructor() {
    this.config = null;
    this.projectRoot = path.resolve(__dirname, '..');
    this.templates = {};
    this.generationHistory = [];
  }

  async initialize() {
    try {
      // Load autonomous configuration
      const configPath = path.join(this.projectRoot, '.autonomous-config.json');
      this.config = JSON.parse(await fs.readFile(configPath, 'utf8'));

      // Load code templates
      await this.loadTemplates();

      console.log('🤖 AI Code Generator initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI Code Generator:', error.message);
      throw error;
    }
  }

  async loadTemplates() {
    const templatesDir = path.join(__dirname, 'templates');
    try {
      const templateFiles = await fs.readdir(templatesDir);
      for (const file of templateFiles) {
        if (file.endsWith('.template')) {
          const templateName = file.replace('.template', '');
          const templatePath = path.join(templatesDir, file);
          this.templates[templateName] = await fs.readFile(templatePath, 'utf8');
        }
      }
    } catch (error) {
      console.warn('⚠️  No templates directory found, using default templates');
      this.templates = this.getDefaultTemplates();
    }
  }

  getDefaultTemplates() {
    return {
      component: `import React from 'react';
import PropTypes from 'prop-types';

const {{componentName}} = ({ {{props}} }) => {
  return (
    <div className="{{componentName.toLowerCase()}}">
      {/* {{componentName}} implementation */}
    </div>
  );
};

{{componentName}}.propTypes = {
  {{props}}: PropTypes.any
};

export default {{componentName}};
`,
      hook: `import { useState, useEffect } from 'react';

const use{{hookName}} = ({{parameters}}) => {
  const [state, setState] = useState({{initialState}});

  useEffect(() => {
    // Hook implementation
  }, [{{dependencies}}]);

  return {
    ...state,
    // Hook methods
  };
};

export default use{{hookName}};
`,
      api: `import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== '{{method}}') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // API implementation
    const result = {}; // Implement logic here

    res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
`
    };
  }

  async generateComponent(specification) {
    const { name, props, features } = specification;

    console.log(`🔧 Generating component: ${name}`);

    const template = this.templates.component || this.getDefaultTemplates().component;
    let code = template
      .replace(/{{componentName}}/g, name)
      .replace(/{{props}}/g, props.join(', '));

    // Add features based on specification
    if (features.includes('state')) {
      code = this.addStateManagement(code, name);
    }

    if (features.includes('effects')) {
      code = this.addEffects(code, name);
    }

    if (features.includes('styling')) {
      code = this.addStyling(code, name);
    }

    const filePath = path.join(this.projectRoot, 'components', `${name}.tsx`);
    await this.writeFile(filePath, code);

    return { filePath, code };
  }

  async generateHook(specification) {
    const { name, parameters, dependencies } = specification;

    console.log(`🔧 Generating hook: ${name}`);

    const template = this.templates.hook || this.getDefaultTemplates().hook;
    const code = template
      .replace(/{{hookName}}/g, name)
      .replace(/{{parameters}}/g, parameters.join(', '))
      .replace(/{{dependencies}}/g, dependencies.join(', '))
      .replace(/{{initialState}}/g, '{}');

    const filePath = path.join(this.projectRoot, 'hooks', `${name}.ts`);
    await this.writeFile(filePath, code);

    return { filePath, code };
  }

  async generateAPI(specification) {
    const { name, method, path: apiPath } = specification;

    console.log(`🔧 Generating API: ${name}`);

    const template = this.templates.api || this.getDefaultTemplates().api;
    const code = template
      .replace(/{{method}}/g, method);

    const filePath = path.join(this.projectRoot, 'pages', 'api', `${name}.ts`);
    await this.writeFile(filePath, code);

    return { filePath, code };
  }

  addStateManagement(code, componentName) {
    const stateImport = "import { useState } from 'react';";
    const stateHook = `  const [state, setState] = useState({});`;

    return code
      .replace("import React from 'react';", `import React, { useState } from 'react';`)
      .replace("const {{componentName}} = ({ {{props}} }) => {", `const {{componentName}} = ({ {{props}} }) => {\n${stateHook}`)
      .replace("export default {{componentName}};", `  return {\n    state,\n    setState\n  };\nexport default {{componentName}};`);
  }

  addEffects(code, componentName) {
    const effectImport = "import { useEffect } from 'react';";
    const effectHook = `  useEffect(() => {\n    // Component effects\n  }, []);`;

    return code
      .replace("import React from 'react';", `import React, { useEffect } from 'react';`)
      .replace("const {{componentName}} = ({ {{props}} }) => {", `const {{componentName}} = ({ {{props}} }) => {\n${effectHook}`)
      .replace("export default {{componentName}};", `  return {\n    // Component logic\n  };\nexport default {{componentName}};`);
  }

  addStyling(code, componentName) {
    const styledImport = "import styled from 'styled-components';";
    const styledComponent = `const Styled${componentName} = styled.div\`\n  /* Component styles */\n\`;`;

    return code
      .replace("import React from 'react';", `import React from 'react';\nimport styled from 'styled-components';`)
      .replace("const {{componentName}} = ({ {{props}} }) => {", `${styledComponent}\n\nconst {{componentName}} = ({ {{props}} }) => {`)
      .replace("<div className=\"{{componentName.toLowerCase()}}\">", "<Styled{{componentName}}>")
      .replace("</div>", "</Styled{{componentName}}>");
  }

  async writeFile(filePath, content) {
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, 'utf8');

      // Run linting and formatting
      await this.formatAndLint(filePath);

      console.log(`✅ Generated: ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to write file ${filePath}:`, error.message);
      throw error;
    }
  }

  async formatAndLint(filePath) {
    try {
      // Run Prettier
      execSync(`npx prettier --write ${filePath}`, { stdio: 'inherit' });

      // Run ESLint
      execSync(`npx eslint ${filePath} --fix`, { stdio: 'inherit' });
    } catch (error) {
      console.warn(`⚠️  Formatting/linting failed for ${filePath}:`, error.message);
    }
  }

  async validateGeneration(specification) {
    const { type, name } = specification;

    // Check for naming conflicts
    const filePath = this.getFilePath(type, name);
    if (await this.fileExists(filePath)) {
      throw new Error(`File already exists: ${filePath}`);
    }

    // Validate specification
    if (!name || !type) {
      throw new Error('Specification must include name and type');
    }

    return true;
  }

  getFilePath(type, name) {
    switch (type) {
      case 'component':
        return path.join(this.projectRoot, 'components', `${name}.tsx`);
      case 'hook':
        return path.join(this.projectRoot, 'hooks', `${name}.ts`);
      case 'api':
        return path.join(this.projectRoot, 'pages', 'api', `${name}.ts`);
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  recordGeneration(specification, result) {
    this.generationHistory.push({
      timestamp: new Date().toISOString(),
      specification,
      result,
      success: true
    });
  }
}

// CLI Interface
async function main() {
  const generator = new AICodeGenerator();

  try {
    await generator.initialize();

    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.log('Usage: node ai-code-generator.js <specification.json>');
      process.exit(1);
    }

    const specPath = args[0];
    const specification = JSON.parse(await fs.readFile(specPath, 'utf8'));

    await generator.validateGeneration(specification);

    let result;
    switch (specification.type) {
      case 'component':
        result = await generator.generateComponent(specification);
        break;
      case 'hook':
        result = await generator.generateHook(specification);
        break;
      case 'api':
        result = await generator.generateAPI(specification);
        break;
      default:
        throw new Error(`Unsupported type: ${specification.type}`);
    }

    generator.recordGeneration(specification, result);
    console.log('🎉 Code generation completed successfully!');

  } catch (error) {
    console.error('❌ Code generation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AICodeGenerator;