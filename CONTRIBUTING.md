# Contributing to Cellular Sleep Voyage

Thank you for your interest in contributing to the Cellular Sleep Voyage! This project aims to make cutting-edge sleep science accessible to young learners through interactive 3D experiences.

## 🌟 Ways to Contribute

### For Developers
- **React/TypeScript Components**: Build interactive UI elements and educational interfaces
- **Three.js/3D Development**: Create immersive cellular environments and molecular visualizations
- **Performance Optimization**: Improve WebGL rendering and asset loading
- **Accessibility Features**: Ensure the experience works for all learners
- **Testing**: Write unit tests, integration tests, and educational effectiveness tests

### For Educators & Scientists
- **Content Review**: Verify scientific accuracy and age-appropriateness
- **Educational Design**: Suggest improvements to learning progression and assessment
- **Curriculum Integration**: Help align content with educational standards
- **User Testing**: Test with real students and provide feedback

### For Designers & Artists
- **3D Modeling**: Create scientifically accurate cellular structures and organelles
- **Animation**: Design smooth transitions and engaging visual effects
- **UI/UX Design**: Improve user interface and interaction design
- **Asset Creation**: Develop educational illustrations and diagrams

## 🚀 Getting Started

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/cellular-sleep-voyage.git
   cd cellular-sleep-voyage
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm run test
   ```

### Project Structure Overview

```
src/
├── components/
│   ├── 3d/              # Three.js components for 3D interactions
│   ├── ui/              # React UI components
│   ├── chapters/        # Chapter-specific educational content
│   └── tutorial/        # Onboarding and help systems
├── stores/              # Zustand state management
├── types/               # TypeScript type definitions
└── utils/               # Asset management and utilities
```

## 📋 Development Guidelines

### Code Standards
- **TypeScript**: All new code should be written in TypeScript
- **ESLint**: Follow the project's ESLint configuration
- **Component Structure**: Use functional components with hooks
- **State Management**: Use Zustand for global state, local state for component-specific data
- **Testing**: Write tests for new features and bug fixes

### 3D Development Guidelines
- **Performance First**: Always consider performance impact of 3D operations
- **Mobile Compatibility**: Ensure interactions work on touch devices
- **Accessibility**: Provide alternative interaction methods for users who can't use 3D controls
- **Scientific Accuracy**: Maintain biological accuracy in all 3D representations

### Educational Content Guidelines
- **Age Appropriate**: Content should be accessible to 10-year-olds
- **Scientifically Accurate**: All content must be based on peer-reviewed research
- **Progressive Complexity**: Build understanding from simple to complex concepts
- **Interactive Learning**: Prefer hands-on discovery over passive consumption

## 🔬 Scientific Accuracy Standards

### Research Sources
All scientific content should be based on:
- Peer-reviewed research papers
- Established textbooks and educational resources
- Expert consultation when needed

### Key Research Areas
- **Mitochondrial Biology**: Electron transport chain, ATP synthesis, ROS generation
- **Sleep Science**: Sleep pressure mechanisms, circadian rhythms, sleep stages
- **Cell Biology**: Organelle structure and function, cellular metabolism
- **Evolutionary Biology**: Conservation of sleep across species

### Review Process
1. **Self-Review**: Check your content against established scientific sources
2. **Peer Review**: Have another contributor review for accuracy
3. **Expert Review**: For major content additions, seek expert consultation
4. **Documentation**: Include references and sources for scientific claims

## 🎯 Issue Guidelines

### Reporting Bugs
When reporting bugs, please include:
- **Environment**: Browser, device, operating system
- **Steps to Reproduce**: Clear steps to recreate the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots/Videos**: If applicable

### Feature Requests
For new features, please provide:
- **Educational Goal**: What learning objective does this serve?
- **Target Audience**: Who would benefit from this feature?
- **Implementation Ideas**: Any thoughts on how to implement
- **Scientific Basis**: What research supports this feature?

### Content Suggestions
For educational content improvements:
- **Learning Objective**: What should students learn?
- **Age Appropriateness**: How does this fit 10-year-old comprehension?
- **Scientific Sources**: What research supports this content?
- **Interactive Elements**: How can this be made hands-on?

## 🔄 Pull Request Process

### Before Submitting
1. **Test Thoroughly**: Ensure your changes work across different devices
2. **Check Scientific Accuracy**: Verify all scientific content is correct
3. **Update Documentation**: Update relevant documentation files
4. **Run Linting**: Ensure code passes ESLint checks
5. **Write Tests**: Add tests for new functionality

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Educational content update
- [ ] Performance improvement
- [ ] Documentation update

## Educational Impact
How does this change improve the learning experience?

## Scientific Accuracy
What sources support any scientific claims?

## Testing
- [ ] Tested on desktop
- [ ] Tested on mobile/tablet
- [ ] Tested with screen reader (if applicable)
- [ ] Unit tests added/updated
- [ ] Manual testing completed

## Screenshots/Videos
If applicable, add screenshots or videos demonstrating the changes
```

### Review Process
1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: At least one maintainer reviews the code
3. **Educational Review**: Educational content is reviewed for accuracy and age-appropriateness
4. **Testing**: Changes are tested across different devices and browsers
5. **Merge**: Once approved, changes are merged into main branch

## 🎨 Asset Guidelines

### 3D Models
- **File Formats**: Prefer GLTF/GLB for 3D models
- **Optimization**: Keep polygon counts reasonable for web performance
- **Scientific Accuracy**: All biological structures should be anatomically correct
- **Licensing**: Ensure all assets have appropriate licenses

### Textures and Images
- **Resolution**: Provide multiple resolutions for different zoom levels
- **Formats**: Use WebP when possible, fallback to PNG/JPG
- **Compression**: Optimize file sizes without sacrificing quality
- **Attribution**: Include proper attribution for all assets

### Audio
- **Formats**: Use MP3 or OGG for broad compatibility
- **Quality**: Balance quality with file size
- **Accessibility**: Provide transcripts for all audio content

## 🌍 Internationalization

### Language Support
- **Primary Language**: English (US)
- **Future Languages**: Spanish, French, Mandarin (contributions welcome)
- **Text Externalization**: All user-facing text should be externalized for translation
- **Cultural Sensitivity**: Consider cultural differences in educational approaches

## 📚 Educational Standards Alignment

### Standards Consideration
- **NGSS**: Next Generation Science Standards alignment
- **Common Core**: Mathematics and literacy connections
- **International Standards**: Consider global educational frameworks
- **Age Appropriateness**: Maintain focus on 10-year-old comprehension level

## 🤝 Community Guidelines

### Communication
- **Be Respectful**: Treat all contributors with respect and kindness
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Patient**: Remember that contributors have different experience levels
- **Be Inclusive**: Welcome contributors from all backgrounds

### Collaboration
- **Ask Questions**: Don't hesitate to ask for help or clarification
- **Share Knowledge**: Help other contributors learn and grow
- **Give Credit**: Acknowledge the contributions of others
- **Stay Focused**: Keep discussions relevant to the project goals

## 📞 Getting Help

### Resources
- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for general questions
- **Discord**: Join our Discord server for real-time chat (link in README)

### Mentorship
New contributors are welcome! If you're new to:
- **React/TypeScript**: We can help you get started with modern web development
- **Three.js**: We'll guide you through 3D web development
- **Educational Technology**: Learn about creating effective learning experiences
- **Open Source**: Get familiar with collaborative development practices

## 🏆 Recognition

### Contributor Recognition
- **README Credits**: All contributors are acknowledged in the README
- **Release Notes**: Significant contributions are highlighted in release notes
- **Contributor Badges**: GitHub badges for different types of contributions
- **Annual Recognition**: Special recognition for outstanding contributions

Thank you for helping make science education more accessible and engaging for young learners! 🧬✨