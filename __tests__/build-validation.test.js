/**
 * Build Process Validation Tests
 *
 * These tests validate that the project's build configuration and
 * critical dependencies are working correctly.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Build Process Validation', () => {
  const projectRoot = path.resolve(__dirname, '..');

  describe('Configuration Files', () => {
    it('should have valid package.json', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      expect(fs.existsSync(packagePath)).toBe(true);

      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      // Check required scripts
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.scripts).toHaveProperty('lint');
      expect(packageJson.scripts).toHaveProperty('type-check');

      // Check critical dependencies
      expect(packageJson.dependencies).toHaveProperty('next');
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.dependencies).toHaveProperty('react-dom');
      expect(packageJson.dependencies).toHaveProperty('typescript');
      expect(packageJson.dependencies).toHaveProperty('tailwindcss');
    });

    it('should have valid tsconfig.json', () => {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);

      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

      // Check essential compiler options
      expect(tsconfig.compilerOptions).toHaveProperty('strict', true);
      expect(tsconfig.compilerOptions).toHaveProperty('jsx', 'preserve');
      expect(tsconfig.compilerOptions).toHaveProperty('module', 'esnext');
      expect(tsconfig.compilerOptions.paths).toHaveProperty('@/*');
    });

    it('should have valid tailwind.config.js', () => {
      const tailwindPath = path.join(projectRoot, 'tailwind.config.js');
      expect(fs.existsSync(tailwindPath)).toBe(true);

      // Require the config to check it's valid JavaScript
      const tailwindConfig = require(tailwindPath);
      expect(tailwindConfig).toHaveProperty('content');
      expect(tailwindConfig).toHaveProperty('theme');
      expect(Array.isArray(tailwindConfig.content)).toBe(true);
    });

    it('should have valid next.config.js', () => {
      const nextConfigPath = path.join(projectRoot, 'next.config.js');
      expect(fs.existsSync(nextConfigPath)).toBe(true);

      // Should be valid JavaScript
      expect(() => require(nextConfigPath)).not.toThrow();
    });

    it('should have valid ESLint configuration', () => {
      const eslintPath = path.join(projectRoot, 'eslint.config.mjs');
      expect(fs.existsSync(eslintPath)).toBe(true);
    });

    it('should have valid PostCSS configuration', () => {
      const postcssPath = path.join(projectRoot, 'postcss.config.js');
      expect(fs.existsSync(postcssPath)).toBe(true);

      const postcssConfig = require(postcssPath);
      expect(postcssConfig).toHaveProperty('plugins');
    });

    it('should have valid Jest configuration', () => {
      const jestPath = path.join(projectRoot, 'jest.config.js');
      expect(fs.existsSync(jestPath)).toBe(true);

      // Should be valid JavaScript
      expect(() => require(jestPath)).not.toThrow();
    });
  });

  describe('Directory Structure', () => {
    it('should have required source directories', () => {
      const requiredDirs = [
        'src',
        'src/app',
        'src/components',
        'src/components/layout',
        'public',
        'docs',
        'docs/stories',
        'docs/qa',
        'docs/qa/gates'
      ];

      requiredDirs.forEach(dir => {
        const dirPath = path.join(projectRoot, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
        expect(fs.statSync(dirPath).isDirectory()).toBe(true);
      });
    });

    it('should have key component files', () => {
      const requiredFiles = [
        'src/app/layout.tsx',
        'src/app/(dashboard)/layout.tsx',
        'src/app/globals.css',
        'src/components/layout/Header.tsx',
        'src/components/layout/Sidebar.tsx'
      ];

      requiredFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        expect(fs.existsSync(filePath)).toBe(true);
        expect(fs.statSync(filePath).isFile()).toBe(true);
      });
    });
  });

  describe('TypeScript Compilation', () => {
    it('should compile TypeScript without errors', () => {
      expect(() => {
        execSync('npm run type-check', {
          cwd: projectRoot,
          stdio: 'pipe',
          timeout: 30000
        });
      }).not.toThrow();
    });

    it('should not have TypeScript errors in component files', () => {
      const componentFiles = [
        'src/components/layout/Header.tsx',
        'src/components/layout/Sidebar.tsx',
        'src/app/layout.tsx',
        'src/app/(dashboard)/layout.tsx'
      ];

      componentFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Basic syntax checks
        expect(content).toMatch(/import.*from/); // Has imports
        expect(content).toMatch(/export.*function|export default/); // Has exports
        expect(content).not.toMatch(/\/\/ @ts-ignore/); // No ts-ignore comments
        expect(content).not.toMatch(/any(?!\w)/); // No 'any' types (with word boundary)
      });
    });
  });

  describe('ESLint Validation', () => {
    it('should pass ESLint checks', () => {
      expect(() => {
        execSync('npm run lint', {
          cwd: projectRoot,
          stdio: 'pipe',
          timeout: 30000
        });
      }).not.toThrow();
    });
  });

  describe('Build Process', () => {
    // Note: This test can be slow, so we increase the timeout
    it('should complete production build successfully', () => {
      expect(() => {
        execSync('npm run build', {
          cwd: projectRoot,
          stdio: 'pipe',
          timeout: 60000 // 1 minute timeout for build
        });
      }).not.toThrow();
    });

    it('should generate required build outputs', () => {
      const buildDir = path.join(projectRoot, '.next');

      // Build directory should exist after build
      expect(fs.existsSync(buildDir)).toBe(true);

      // Should have server and static directories
      expect(fs.existsSync(path.join(buildDir, 'server'))).toBe(true);
      expect(fs.existsSync(path.join(buildDir, 'static'))).toBe(true);
    });

    it('should have proper build manifest', () => {
      const manifestPath = path.join(projectRoot, '.next', 'build-manifest.json');

      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        expect(manifest).toHaveProperty('pages');
        expect(typeof manifest.pages).toBe('object');
      }
    });
  });

  describe('Dependency Integrity', () => {
    it('should have consistent package-lock.json', () => {
      const packageLockPath = path.join(projectRoot, 'package-lock.json');
      expect(fs.existsSync(packageLockPath)).toBe(true);

      const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
      expect(packageLock).toHaveProperty('lockfileVersion');
      expect(packageLock).toHaveProperty('packages');
    });

    it('should have all dependencies installed', () => {
      const nodeModulesPath = path.join(projectRoot, 'node_modules');
      expect(fs.existsSync(nodeModulesPath)).toBe(true);

      // Check for critical dependencies
      const criticalDeps = ['next', 'react', 'react-dom', 'typescript', 'tailwindcss'];

      criticalDeps.forEach(dep => {
        const depPath = path.join(nodeModulesPath, dep);
        expect(fs.existsSync(depPath)).toBe(true);
      });
    });
  });

  describe('Asset Generation', () => {
    it('should generate CSS assets correctly', () => {
      const staticPath = path.join(projectRoot, '.next', 'static');

      if (fs.existsSync(staticPath)) {
        // Should have CSS files generated
        const hasCSS = fs.readdirSync(staticPath, { recursive: true })
          .some(file => file.toString().endsWith('.css'));

        expect(hasCSS).toBe(true);
      }
    });

    it('should have proper globals.css compilation', () => {
      const globalsCSSPath = path.join(projectRoot, 'src/app/globals.css');
      const content = fs.readFileSync(globalsCSSPath, 'utf8');

      // Should have Tailwind import
      expect(content).toMatch(/@import.*tailwindcss/);

      // Should not have obvious syntax errors
      expect(content).not.toMatch(/\}\s*\{/); // No mismatched braces
      expect(content).not.toMatch(/;\s*;/); // No double semicolons
    });
  });

  describe('Runtime Configuration', () => {
    it('should have proper Next.js configuration', () => {
      const nextConfig = require(path.join(projectRoot, 'next.config.js'));

      // Should be a valid Next.js config object or function
      expect(typeof nextConfig === 'object' || typeof nextConfig === 'function').toBe(true);
    });

    it('should have environment-specific configurations', () => {
      // Check that we have proper configurations for different environments
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
      );

      // Should have both dev and production scripts
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.start).toBeDefined();
    });
  });

  describe('Testing Infrastructure', () => {
    it('should have Jest configuration', () => {
      const jestConfigPath = path.join(projectRoot, 'jest.config.js');
      expect(fs.existsSync(jestConfigPath)).toBe(true);
    });

    it('should have Jest setup file', () => {
      const jestSetupPath = path.join(projectRoot, 'jest.setup.js');
      expect(fs.existsSync(jestSetupPath)).toBe(true);
    });

    it('should have test files in correct locations', () => {
      const testDirs = [
        'src/components/layout/__tests__',
        'src/app/__tests__',
        '__tests__'
      ];

      testDirs.forEach(dir => {
        const dirPath = path.join(projectRoot, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
      });
    });
  });
});