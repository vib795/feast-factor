# Macro Calculator

Welcome to the **Macro Calculator** project! This application helps users calculate their macronutrient requirements (proteins, carbs, and fats) based on their personal information and fitness goals. Built using **Next.js**, this tool offers a clean, responsive interface and is easy to set up and customize.

## Live Demo

Check out the live, deployed version here:
[Feast Factor](https://www.feastfactor.xyz/)

## Table of Contents
1. [Features](#features)
2. [Getting Started](#getting-started)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Scripts](#scripts)
6. [Project Structure](#project-structure)
7. [Technologies Used](#technologies-used)
8. [Contributing](#contributing)
9. [License](#license)
10. [Contact](#contact)

---

## Features

- **User-friendly form**: Input basic personal details such as age, gender, weight, height, and activity level.
- **Macro distribution**: Calculates daily protein, carbohydrate, and fat intake needs.
- **Calorie estimations**: Shows estimated total daily calorie needs.
- **Responsive design**: Works seamlessly on various device sizes.
- **Deployed on Vercel**: Easy to access and lightning fast.

---

## Getting Started

1. **Clone the repo**:  
   ```bash
   git clone https://github.com/vib795/macro-calculator.git
   ```
2. **Install dependencies**:  
   ```bash
   cd macro-calculator
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```

You should now have the app running on [http://localhost:3000](http://localhost:3000).

---

## Installation

To run the project locally:

1. **Ensure Node.js** is installed (preferably the latest LTS version).
2. **Download or clone** the repository.
3. **Install packages** by running `npm install`.
4. **Start the dev server** with `npm run dev`.

---

## Usage

1. **Open the app** in your web browser at `http://localhost:3000`.
2. **Fill in your personal info** including weight, height, age, and activity level.
3. **Specify your goals**—whether you want to lose weight, maintain, or gain muscle.
4. **Click “Calculate”** to get daily macros (protein, carbs, and fats) and estimated caloric needs.

Use these macro numbers to guide your meal planning and track your calorie/macro intake (using apps like MyFitnessPal or Cronometer).

---

## Scripts

- **`npm run dev`**: Starts the development server on `http://localhost:3000`.
- **`npm run build`**: Builds the application for production.
- **`npm run start`**: Runs the production build.
- **`npm run lint`**: Checks for linting errors.

---

## Project Structure

Here's a simplified overview of the core folders and files:

```bash
macro-calculator
├── public
│   └── favicon.ico
├── src
|   |── components
|   |    └── MacroCalculator.js
│   ├── pages
│   │   ├── _app.js
|   |   |── _document.js
|   |   |── index.js   
│   │   └── api        
|   |       └── hello.js
│   └── styles
│   |    └── globals.css
├── eslint.config.mjs
├── jsconfig.json
├── LICENSE
├── next.config.js
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tailwind.config.mjs
```

- **`app/page.tsx`**: Main page where the form is rendered and macro calculations happen.
- **`styles/globals.css`**: Global CSS styles (can be replaced or extended with your preferred styling approach).

---

## Technologies Used

- **Next.js**: React-based framework for server-side rendering and static site generation.
- **React**: Library for building user interfaces.
- **CSS** (Modules/Global Styles): For styling components and pages.
- **JavaScript/TypeScript**: Depending on which you prefer (TypeScript setup is straightforward in Next.js).
- **Vercel**: For deployment and hosting, providing rapid and seamless CI/CD integration.

---

## Contributing

Contributions are welcome! If you’d like to add features, fix bugs, or improve documentation:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/YourFeatureName`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/YourFeatureName`.
5. Create a Pull Request on the original repository.

---

## License

This project is open-source—feel free to use and modify it. Please see the [LICENSE](LICENSE) file for details (if available in the repo). If not, consider adding one.

---

## Contact

For questions or feedback, feel free to open an issue on GitHub or reach out via:

- **GitHub**: [@vib795](https://github.com/vib795)

---

## Disclaimer
I’m not a licensed dietitian or medical professional, and this calculator is provided purely for informational and educational purposes. Always consult a qualified healthcare provider or registered dietitian before making significant changes to your diet or exercise routine. Use of this calculator is at your own risk, and I assume no liability for any decisions you make based on the results.

---


**Thank you for using the Macro Calculator!** Feel free to star the repo if you found it helpful, and share it with anyone who might benefit from a straightforward macro-tracking tool.
