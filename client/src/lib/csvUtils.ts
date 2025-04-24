// src/lib/csvUtils.ts
type GameResult = {
  //   name: string;
  //   email: string;
  //   age: string;
  //   game: string;
  //   score: number;
  //   level: string;
  //   timeTaken: number;
  // };
  
  // export const appendToCSV = (gameResult: GameResult) => {
  //   // Generate CSV row
  //   const row = `${gameResult.name},${gameResult.email},${gameResult.age},${gameResult.game},${gameResult.score},${gameResult.level},${gameResult.timeTaken}\n`;
  
  //   // Check for existing CSV data in localStorage
  //   const storageKey = `gameResults_${gameResult.game}`;
  //   const existingCSV = localStorage.getItem(storageKey) || "Name,Email,Age,Game,Score,Level,Time Taken (s)\n";
  
  //   // Append new data
  //   const updatedCSV = existingCSV + row;
  
  //   // Save back to localStorage
  //   localStorage.setItem(storageKey, updatedCSV);
  
  //   // Trigger download
  //   const blob = new Blob([updatedCSV], { type: "text/csv" });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `${gameResult.game}_results.csv`;
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   window.URL.revokeObjectURL(url);
  };