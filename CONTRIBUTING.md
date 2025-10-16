# 🎮 CoinQuest - Contributing Guide

Thank you for your interest in contributing to CoinQuest! This guide will help you get started with contributing to our blockchain-powered arcade game.

## 🤝 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **🐛 Bug Reports**: Report issues and bugs
- **✨ Feature Requests**: Suggest new features
- **💻 Code Contributions**: Submit code improvements
- **📖 Documentation**: Improve documentation
- **🎨 Design**: UI/UX improvements
- **🧪 Testing**: Add tests and improve coverage
- **🌐 Translations**: Translate the app to other languages

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Xverse wallet (for testing)
- Basic knowledge of React, TypeScript, and blockchain concepts

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/coinQuest.git
   cd coinQuest
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-description
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Make Your Changes**
   - Write your code
   - Add tests if applicable
   - Update documentation

6. **Test Your Changes**
   ```bash
   npm test
   npm run test:coverage
   ```

7. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

8. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

9. **Create a Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Fill out the PR template
   - Submit the PR

## 📋 Pull Request Process

### Before Submitting

- [ ] **Code Quality**: Ensure your code follows our style guide
- [ ] **Tests**: Add tests for new functionality
- [ ] **Documentation**: Update relevant documentation
- [ ] **TypeScript**: Fix any TypeScript errors
- [ ] **Linting**: Fix any ESLint warnings
- [ ] **Performance**: Consider performance implications

### PR Template

When creating a PR, please include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## 🎯 Development Guidelines

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix

# Format code
npm run format
```

### TypeScript Guidelines

- Use strict TypeScript settings
- Define proper interfaces and types
- Avoid `any` types when possible
- Use proper error handling

```typescript
// Good
interface WalletStatus {
  connected: boolean;
  address: string | null;
  balance: number | null;
}

// Avoid
const walletStatus: any = {};
```

### React Guidelines

- Use functional components with hooks
- Follow React best practices
- Use proper prop types
- Implement proper error boundaries

```typescript
// Good
const GameComponent: React.FC<Props> = ({ score, onScoreChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    try {
      await onScoreChange(score);
    } finally {
      setIsLoading(false);
    }
  }, [score, onScoreChange]);
  
  return (
    <button onClick={handleSubmit} disabled={isLoading}>
      Submit Score
    </button>
  );
};
```

### Blockchain Guidelines

- Always handle transaction failures
- Provide user feedback for blockchain operations
- Use proper error handling for contract calls
- Test with testnet before mainnet

```typescript
// Good
const submitScore = async (score: number) => {
  try {
    const result = await wallet.callContract(
      contractId,
      'submit-game-score',
      [score]
    );
    
    if (result.success) {
      showSuccess('Score submitted successfully!');
    } else {
      showError(result.error || 'Transaction failed');
    }
  } catch (error) {
    showError('Network error. Please try again.');
    console.error('Submit score error:', error);
  }
};
```

## 🧪 Testing Guidelines

### Unit Tests

Write unit tests for all new functionality:

```typescript
// Example test
describe('WalletContext', () => {
  it('should connect wallet successfully', async () => {
    const mockWallet = {
      connectWallet: jest.fn().mockResolvedValue({ success: true })
    };
    
    const result = await mockWallet.connectWallet();
    
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests

Test contract interactions:

```typescript
describe('Contract Integration', () => {
  it('should submit score to contract', async () => {
    const result = await window.callStacksFinalize([100]);
    
    expect(result.success).toBe(true);
    expect(result.txId).toBeDefined();
  });
});
```

### E2E Tests

Test complete user journeys:

```typescript
describe('Game Flow', () => {
  it('should complete full game cycle', async () => {
    // Connect wallet
    await page.click('[data-testid="connect-wallet"]');
    
    // Play game
    await page.click('[data-testid="play-button"]');
    
    // Submit score
    await page.click('[data-testid="submit-score"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

## 📖 Documentation Guidelines

### Code Documentation

- Document all public functions
- Use JSDoc comments
- Include examples for complex functions

```typescript
/**
 * Submits a game score to the blockchain and earns tokens
 * @param score - The player's game score
 * @returns Promise resolving to transaction result
 * @example
 * ```typescript
 * const result = await submitGameScore(100);
 * if (result.success) {
 *   console.log('Score submitted:', result.txId);
 * }
 * ```
 */
const submitGameScore = async (score: number): Promise<SubmitResult> => {
  // Implementation
};
```

### README Updates

When adding new features, update the README:

- Add new features to the features list
- Update installation instructions if needed
- Add new API endpoints to documentation
- Update examples and usage

## 🎨 Design Guidelines

### UI/UX Principles

- **Consistency**: Follow existing design patterns
- **Accessibility**: Ensure WCAG 2.1 compliance
- **Responsiveness**: Design for all screen sizes
- **Performance**: Optimize for speed

### Design System

Use our established design tokens:

```css
/* Colors */
--primary-blue: #5546ff;
--success-green: #4ade80;
--warning-orange: #ff6b35;
--error-red: #ef4444;

/* Typography */
--font-heading: 'Inter', sans-serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Spacing */
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;
```

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test with latest version** to ensure it's not fixed
3. **Check documentation** for known issues

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Wallet: [e.g. Xverse 1.0.0]
- Node.js: [e.g. 18.0.0]

## Additional Context
Screenshots, logs, etc.
```

## ✨ Feature Requests

### Before Requesting

1. **Check existing issues** for similar requests
2. **Consider the scope** and complexity
3. **Think about implementation** approach

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this be implemented?

## Alternatives Considered
Other solutions you've thought about

## Additional Context
Mockups, examples, etc.
```

## 🏷️ Issue Labels

We use the following labels:

- **bug**: Something isn't working
- **enhancement**: New feature or request
- **documentation**: Documentation improvements
- **good first issue**: Good for newcomers
- **help wanted**: Extra attention is needed
- **priority: high**: High priority issue
- **priority: low**: Low priority issue
- **type: frontend**: Frontend related
- **type: backend**: Backend related
- **type: blockchain**: Blockchain related

## 🎯 Good First Issues

Looking for your first contribution? Check out these issues:

- [ ] Add unit tests for existing functions
- [ ] Improve error messages
- [ ] Add TypeScript types
- [ ] Update documentation
- [ ] Fix minor UI issues
- [ ] Add accessibility improvements

## 📞 Getting Help

### Community Channels

- **💬 Discord**: [Join our community](https://discord.gg/coinquest)
- **🐦 Twitter**: [Follow us](https://twitter.com/coinquest)
- **📧 Email**: contributors@coinquest.com

### Mentorship

- **New Contributors**: We offer mentorship for first-time contributors
- **Code Reviews**: Experienced developers review all PRs
- **Documentation**: Help with writing and improving docs

## 🏆 Recognition

### Contributor Recognition

- **Contributors List**: Added to our contributors list
- **Discord Role**: Special contributor role in Discord
- **Swag**: CoinQuest merchandise for significant contributions
- **Credits**: Mentioned in release notes

### Contribution Levels

- **🥉 Bronze**: 1-5 contributions
- **🥈 Silver**: 6-15 contributions  
- **🥇 Gold**: 16+ contributions
- **💎 Diamond**: Core team member

## 📋 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

### Enforcement

Instances of abusive behavior may be reported to the project maintainers. All complaints will be reviewed and investigated promptly.

## 📄 License

By contributing to CoinQuest, you agree that your contributions will be licensed under the MIT License.

---

## 🎉 Thank You!

Thank you for contributing to CoinQuest! Your contributions help make this project better for everyone.

**Happy coding! 🚀**
