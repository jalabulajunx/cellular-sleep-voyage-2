# Cellular Sleep Voyage 🧬💤

> **Transforming cutting-edge sleep science into an interactive adventure for young minds**

An immersive 3D educational experience that takes 10-year-old STEM enthusiasts on a "Fantastic Voyage" style journey through living cells to discover why we need sleep. Built on groundbreaking 2025 mitochondrial research and Matthew Walker's sleep science, this project makes complex cellular biology accessible through engaging storytelling and hands-on exploration.

![Project Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.178.0-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)

## 🌟 The Mission

**The Problem**: Young people are increasingly sacrificing sleep to achieve more - from swim classes to Kerbal Space Program, piano recitals to late-night reading. But they don't understand *why* sleep matters at a fundamental biological level.

**The Solution**: Transform revolutionary 2025 mitochondrial sleep research into an interactive cellular adventure that shows kids exactly what happens inside their cells when they skip sleep. No more abstract lectures - just pure scientific discovery through exploration.

**The Impact**: When children understand that sleep pressure begins in tiny cellular "power plants" becoming overwhelmed with toxic sparks, they gain a concrete, scientific reason to prioritize rest. This isn't just health advice - it's cellular biology in action.

## 🔬 Scientific Foundation

### Revolutionary Discovery
A groundbreaking [2025 Nature study](https://www.nature.com/articles/s41586-025-09261-y.pdf) revealed that **sleep pressure originates from mitochondrial dysfunction**. When specialized sleep-control neurons (dFBNs) in fruit flies work too hard during waking hours, their mitochondria become overwhelmed with excess electrons that can't be used to make ATP energy. These extra electrons "leak out" and create dangerous reactive oxygen species (ROS) - essentially toxic sparks that damage cellular components.

### Key Scientific Insights
- **122 genes upregulated after sleep deprivation** - almost exclusively mitochondrial proteins
- **Voltage-gated lipid peroxidation memory** - cells literally remember accumulated damage  
- **Universal sleep mechanism** - from fruit flies to humans, the same cellular processes drive sleep need
- **Evolutionary conservation** - 600 million years of shared sleep biology across all animals

### Matthew Walker Integration
Bridges concepts from Matthew Walker's ["Why We Sleep"](https://www.amazon.com/Why-We-Sleep-Unlocking-Dreams/dp/1501144316) with cellular mechanisms:
- **Adenosine buildup** connects to mitochondrial electron leaks
- **Glymphatic system** as the brain's cellular sanitation department  
- **Memory consolidation** powered by cellular energy management
- **Sleep as "contra-death"** through mitochondrial repair processes

### Educational Research Foundation
This project is based on comprehensive research detailed in our [Mitochondrial Sleep Science for Young Minds](docs/mitochondrial-sleep-science-for-kids.md) educational framework, which demonstrates how cutting-edge cellular biology can be made accessible to 10-year-olds without sacrificing scientific accuracy.

## 🎮 Interactive Experience

### Chapter-Based Journey
1. **Cellular City Tour** - Navigate through a living cell styled as a bustling metropolis
2. **Power Plant Deep Dive** - Explore mitochondria as industrial power plants with assembly lines
3. **Electron Transport Game** - Pass electrons down the cellular assembly line, watch what happens when they escape
4. **Sleep Pressure Management** - Control sleep-wake cycles, observe cellular damage and repair in real-time
5. **Evolutionary Timeline** - Discover how sleep evolved across 600 million years of life

### Key Features
- **3D Cellular Navigation** - Pilot a microscopic vessel through organelles styled as city districts
- **Interactive Molecular Processes** - Manipulate ATP, electrons, and ROS at the molecular level
- **Virtual Laboratory** - Conduct simplified versions of real mitochondrial experiments
- **Gamified Learning** - Earn Discovery Points, Scientist Points, and Sleep Points
- **Multi-Modal Accessibility** - Visual, auditory, and kinesthetic learning paths

## 🛠 Technical Architecture

### Core Technologies
- **React 19** + **TypeScript** - Modern component architecture
- **Three.js** + **React Three Fiber** - 3D rendering and WebGL optimization
- **React Spring** - Smooth animations and transitions
- **Zustand** - Lightweight state management
- **Vite** - Fast development and optimized builds

### 3D Engine Features
- **WebGL Rendering** with automatic quality scaling
- **360-degree object manipulation** with touch and mouse support
- **Multi-level zoom** from cellular overview to molecular detail
- **Interactive hotspot system** with contextual information
- **Performance monitoring** and memory management

### Asset Pipeline
- **SVG to WebGL texture conversion** for scalable scientific illustrations
- **Lazy loading** and **asset caching** for optimal performance
- **Multiple resolution support** for different zoom levels
- **BioRender integration** for scientifically accurate visuals

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser with WebGL support

### Installation
```bash
# Clone the repository
git clone https://github.com/jalabulajunx/cellular-sleep-voyage.git
cd cellular-sleep-voyage

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run test     # Run tests
```

## 📁 Project Structure

```
cellular-sleep-voyage/
├── src/
│   ├── components/
│   │   ├── 3d/              # Three.js components
│   │   ├── ui/              # User interface components
│   │   ├── chapters/        # Chapter-specific content
│   │   └── tutorial/        # Onboarding and help
│   ├── stores/              # Zustand state management
│   ├── types/               # TypeScript definitions
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Asset management and utilities
├── docs/                    # Comprehensive documentation
│   ├── setup/               # Installation and setup guides
│   ├── architecture/        # System architecture documentation
│   ├── troubleshooting/     # Problem resolution guides
│   ├── maintenance/         # Maintenance and update procedures
│   └── components/          # Component-specific documentation
├── public/                  # Static assets
└── .kiro/specs/            # Feature specifications and tasks
```

## 📚 Documentation

### Quick Start Guides
- **[3D Environment Setup](docs/setup/3D-Environment-Setup.md)** - Complete setup and configuration guide
- **[Navigation System Architecture](docs/architecture/Navigation-System-Architecture.md)** - System design and component overview
- **[Troubleshooting Guide](docs/troubleshooting/Navigation-Troubleshooting-Guide.md)** - Solutions for common issues
- **[Maintenance Guide](docs/maintenance/Environment-Maintenance-Guide.md)** - Ongoing maintenance procedures

### Component Documentation
- **[Cellular Environment](docs/components/3d/CellularEnvironment.md)** - 3D cellular city implementation
- **[Vessel Navigation](docs/components/3d/VesselNavigation.md)** - Microscopic vessel system
- **[Asset System](docs/AssetSystemGuide.md)** - Asset management and optimization

### Educational Framework
- **[Mitochondrial Sleep Science for Young Minds](docs/mitochondrial-sleep-science-for-kids.md)** - Educational research foundation

## 🎯 Development Roadmap

### Phase 1: Foundation ✅ Complete
- [x] Project setup and development environment
- [x] Three.js scene management and WebGL renderer
- [x] 3D object manipulation controls (360° rotation, multi-level zoom)
- [x] UI controls for 3D manipulation (zoom, rotate, pan buttons)
- [x] Interactive hotspot and selection system
- [x] Geometric placeholder assets with color-coding
- [x] Asset integration pipeline (SVG to WebGL conversion)
- [x] Comprehensive documentation system

### Phase 2: Core Experience ✅ Complete
- [x] **Cellular environment and navigation system** - Immersive 3D cellular city with districts
- [x] **Vessel navigation system** - Microscopic vessel with WASD/touch controls
- [x] **Environmental lighting** - Chapter-adaptive lighting and atmospheric effects
- [x] **Draggable HUD system** - Customizable UI panels with persistence
- [x] **Comprehensive documentation** - Setup guides, architecture docs, troubleshooting

### Phase 3: Advanced Features 📋 Next
- [ ] Chapter management and progression system
- [ ] Tutorial and onboarding experience
- [ ] Mitochondrial power plant system (Chapter 2)
- [ ] Sleep pressure and ROS damage system (Chapter 3)
- [ ] Virtual laboratory and experimental system

### Phase 4: Educational Integration 🎨 Planned
- [ ] "Why We Sleep" concepts integration
- [ ] Evolutionary context and species comparison
- [ ] Gamification and progress tracking system
- [ ] Accessibility and multi-modal support
- [ ] Educational effectiveness testing

### Phase 5: Production & Launch 🚀 Future
- [ ] Performance optimization and PWA features
- [ ] Final BioRender asset integration
- [ ] Cross-platform compatibility testing
- [ ] Production deployment and distribution

## 🤝 Contributing

We welcome contributions from educators, developers, scientists, and anyone passionate about making science accessible to young learners!

### Ways to Contribute
- **Code**: React components, 3D interactions, performance optimizations
- **Content**: Scientific accuracy review, educational content development
- **Design**: 3D models, animations, user interface improvements
- **Testing**: Educational effectiveness, accessibility, cross-platform compatibility

### Getting Involved
1. Check out our [Issues](https://github.com/jalabulajunx/cellular-sleep-voyage/issues) for current needs
2. Read our [Contributing Guide](CONTRIBUTING.md) for development setup
3. Join discussions in our [Discussions](https://github.com/jalabulajunx/cellular-sleep-voyage/discussions) section
4. Review our [Code of Conduct](CODE_OF_CONDUCT.md)

## 📚 Educational Impact

### Target Audience
- **Primary**: 10-year-old STEM enthusiasts
- **Secondary**: Middle school students, homeschool families, science educators
- **Tertiary**: Anyone curious about cellular biology and sleep science

### Learning Objectives
- Understand mitochondria as cellular power plants
- Grasp the connection between cellular energy and sleep need
- Appreciate evolutionary conservation of biological processes
- Develop scientific thinking through hands-on exploration
- Connect abstract cellular processes to personal health decisions

### Pedagogical Approach
- **Constructivist learning** through guided discovery
- **Analogical reasoning** with familiar concepts (cities, power plants)
- **Multi-modal engagement** for diverse learning styles
- **Scaffolded complexity** from simple to sophisticated concepts
- **Real-world connections** to personal sleep experiences

## 🔬 Scientific Accuracy

### Research Foundation
Based on peer-reviewed research including:
- [2025 Nature study](https://www.nature.com/articles/s41586-025-09261-y.pdf) on mitochondrial sleep mechanisms
- Matthew Walker's ["Why We Sleep"](https://www.amazon.com/Why-We-Sleep-Unlocking-Dreams/dp/1501144316) comprehensive sleep science
- Evolutionary biology of sleep across species
- Cellular biology and mitochondrial function

### Accuracy Principles
- **Analogies represent real mechanisms** without creating misconceptions
- **Progressive complexity** maintains scientific truth at all levels
- **Expert review** by sleep researchers and cell biologists
- **Limitation acknowledgment** where analogies break down
- **Current research integration** as new discoveries emerge

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Sleep Researchers** whose groundbreaking work makes this possible
- **Matthew Walker** for "Why We Sleep" foundational insights
- **BioRender** for scientific illustration tools and assets
- **Open Source Community** for the incredible tools that power this project
- **Educators and Parents** who inspire us to make science accessible

## 📞 Contact

- **Project Lead**: [jalabulajunx](https://github.com/jalabulajunx)
- **Issues**: [GitHub Issues](https://github.com/jalabulajunx/cellular-sleep-voyage/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jalabulajunx/cellular-sleep-voyage/discussions)
- **Repository**: [https://github.com/jalabulajunx/cellular-sleep-voyage](https://github.com/jalabulajunx/cellular-sleep-voyage)

---

**"Every child deserves to understand the beautiful science happening inside their own cells."**

*Made with ❤️ for curious young minds and the future of science education*
