# Mero Banshawali (मेरो वंशावली) 🇳🇵

A high-performance, offline-first Family Lineage and Genealogy application designed for the Nepali community. Built with React, Tailwind CSS, and advanced Graph Theory logic.

## 🚀 Key Features

- **Dynamic Tree Visualization**: SVG-based rendering of family lineages with support for thousands of members.
- **Intelligent Kinship Engine**: Uses a Least Common Ancestor (LCA) algorithm to calculate complex relationships (maternal, paternal, and marital).
- **Offline Data Architect**: Designed with a SQLite/Room compatible schema in mind for mobile porting.
- **Rich Member Management**: 
  - Add/Edit/Delete members.
  - Local photo support (Base64 storage).
  - Generation-level tracking.
- **Bilingual Support**: Native Nepali interface for better accessibility.

## 🛠 Technical Workflow

### 1. Data Structure (The Graph)
Family lineage is treated as a **Directed Acyclic Graph (DAG)** rather than a simple tree to support:
- **Spousal Links**: Horizontal edges at the same generation level.
- **Collateral Branches**: Uncles, Aunts, and Cousins via shared ancestors.
- **Generational Alignment**: Strict Y-axis control based on `generationLevel`.

### 2. Relationship Calculation Logic
The app implements a custom `RelationshipEngine`:
1. **Ancestor Mapping**: Traverses up from both Member A and Member B to find all ancestors.
2. **LCA Identification**: Finds the closest shared ancestor.
3. **Kinship Terminology**: Maps the (Up, Down, Gender) tuple to specific Nepali terms (e.g., `(2, 0, MALE)` -> `बाजे`).

### 3. Rendering Engine
- Uses **SVG g-elements** for nodes and **path/line elements** for relationships.
- Pink dashed lines represent marital bonds.
- Solid gray lines represent parental descent.

## 💻 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mero-banshawali.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗 Architecture Documentation
See the "संरचना" (Structure) tab inside the app for a detailed technical blueprint, including SQL entities and performance strategies for handling 10,000+ records.

## 📄 License
MIT License - feel free to use and contribute!
